package invoice_insight_api.service;

import invoice_insight_api.dto.CurrentUsageResponse;
import invoice_insight_api.dto.DashboardSummaryResponse;
import invoice_insight_api.dto.EmployeeResponse;
import invoice_insight_api.dto.MonthlyUsageTrendPoint;
import invoice_insight_api.dto.PackageResponse;
import invoice_insight_api.dto.SubscriptionResponse;
import invoice_insight_api.dto.UsageAnalyticsResponse;
import invoice_insight_api.dto.UsageRankingItem;
import invoice_insight_api.enums.RecommendationStatus;
import invoice_insight_api.enums.Status;
import invoice_insight_api.exception.ResourceNotFoundException;
import invoice_insight_api.model.Customers;
import invoice_insight_api.model.Subscription;
import invoice_insight_api.model.TariffPackage;
import invoice_insight_api.model.UsageSummary;
import invoice_insight_api.repository.CustomerRepository;
import invoice_insight_api.repository.RecommendationRepository;
import invoice_insight_api.repository.SubscriptionRepository;
import invoice_insight_api.repository.TariffPackageRepository;
import invoice_insight_api.repository.UsageSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CorporateService {

    private static final BigDecimal UNDERUTILIZED_THRESHOLD = BigDecimal.valueOf(0.2);
    private static final int RANKING_LIMIT = 5;

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TariffPackageRepository tariffPackageRepository;
    private final UsageSummaryRepository usageSummaryRepository;
    private final RecommendationRepository recommendationRepository;
    private final InvoiceService invoiceService;

    public List<EmployeeResponse> getEmployees(Long organizationId) {
        return customerRepository.findByOrganizationId(organizationId).stream()
                .map(customer -> toEmployeeResponse(customer, primarySubscriptionFor(organizationId, customer.getId())))
                .toList();
    }

    public EmployeeResponse getEmployeeDetail(Long organizationId, Long employeeId) {
        Customers customer = customerRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Çalışan bulunamadı"));

        List<Subscription> subscriptions = subscriptionRepository
                .findByOrganization_IdAndCustomers_Id(organizationId, employeeId);

        if (subscriptions.isEmpty()) {
            throw new ResourceNotFoundException("Çalışan bulunamadı");
        }

        return toEmployeeResponse(customer, primarySubscriptionOf(subscriptions));
    }

    public List<SubscriptionResponse> getSubscriptions(Long organizationId) {
        return subscriptionRepository.findByOrganization_Id(organizationId).stream()
                .map(this::toSubscriptionResponse)
                .toList();
    }

    public SubscriptionResponse getSubscription(Long organizationId, Long subscriptionId) {
        Subscription subscription = requireSubscription(organizationId, subscriptionId);
        return toSubscriptionResponse(subscription);
    }

    @Transactional
    public SubscriptionResponse updateSubscriptionPackage(Long organizationId, Long subscriptionId, Long packageId) {
        Subscription subscription = requireSubscription(organizationId, subscriptionId);

        TariffPackage tariffPackage = tariffPackageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Paket bulunamadı"));

        subscription.setTariffPackage(tariffPackage);
        subscription.setUpdatedAt(LocalDateTime.now());

        return toSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    @Transactional
    public SubscriptionResponse updateSubscriptionStatus(Long organizationId, Long subscriptionId, Status status) {
        Subscription subscription = requireSubscription(organizationId, subscriptionId);

        subscription.setStatus(status);
        subscription.setUpdatedAt(LocalDateTime.now());

        return toSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    public List<PackageResponse> getPackages() {
        return tariffPackageRepository.findByStatus(Status.ACTIVE).stream()
                .map(this::toPackageResponse)
                .toList();
    }

    public DashboardSummaryResponse getDashboardSummary(Long organizationId) {
        long totalEmployees = customerRepository.findByOrganizationId(organizationId).size();
        long totalActiveSubscriptions = subscriptionRepository.countByOrganization_IdAndStatus(organizationId, Status.ACTIVE);

        BigDecimal totalMonthlyInvoiceAmount = invoiceService.getMonthlyInvoiceTrendForOrganization(organizationId).stream()
                .reduce((first, second) -> second)
                .map(point -> point.totalAmount())
                .orElse(BigDecimal.ZERO);

        List<UsageSummary> latestUsagePerSubscription = latestUsageBySubscription(organizationId).values().stream().toList();

        BigDecimal totalInternetUsageGb = latestUsagePerSubscription.stream()
                .map(UsageSummary::getUsedInternetGb)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalVoiceMinutes = latestUsagePerSubscription.stream()
                .mapToLong(UsageSummary::getUsedMinutes)
                .sum();

        long totalSmsUsage = latestUsagePerSubscription.stream()
                .mapToLong(UsageSummary::getUsedSms)
                .sum();

        long subscriptionsExceedingLimits = buildUsageRankings(organizationId).exceedingLimits().size();

        long recommendationOpportunities = recommendationRepository
                .countBySubscription_Organization_IdAndStatus(organizationId, RecommendationStatus.ACTIVE);

        return new DashboardSummaryResponse(
                totalEmployees,
                totalActiveSubscriptions,
                totalMonthlyInvoiceAmount,
                totalInternetUsageGb,
                totalVoiceMinutes,
                totalSmsUsage,
                subscriptionsExceedingLimits,
                recommendationOpportunities
        );
    }

    public List<MonthlyUsageTrendPoint> getMonthlyUsageTrend(Long organizationId) {
        List<UsageSummary> summaries = usageSummaryRepository.findBySubscription_Organization_Id(organizationId);

        Map<Integer, List<UsageSummary>> byPeriod = summaries.stream()
                .collect(Collectors.groupingBy(summary -> summary.getUsageYear() * 100 + summary.getUsageMonth()));

        return byPeriod.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MonthlyUsageTrendPoint(
                        entry.getKey() / 100,
                        entry.getKey() % 100,
                        entry.getValue().stream().map(UsageSummary::getUsedInternetGb).reduce(BigDecimal.ZERO, BigDecimal::add),
                        entry.getValue().stream().mapToLong(UsageSummary::getUsedMinutes).sum(),
                        entry.getValue().stream().mapToLong(UsageSummary::getUsedSms).sum()
                ))
                .toList();
    }

    public UsageAnalyticsResponse getUsageAnalytics(Long organizationId) {
        return buildUsageRankings(organizationId);
    }

    private UsageAnalyticsResponse buildUsageRankings(Long organizationId) {
        Map<Long, UsageSummary> latestUsageBySubscriptionId = latestUsageBySubscription(organizationId);

        List<UsageRankingItem> items = latestUsageBySubscriptionId.values().stream()
                .map(this::toUsageRankingItem)
                .toList();

        List<UsageRankingItem> highestInternetConsumers = items.stream()
                .sorted(Comparator.comparing(UsageRankingItem::usedInternetGb).reversed())
                .limit(RANKING_LIMIT)
                .toList();

        List<UsageRankingItem> highestVoiceConsumers = items.stream()
                .sorted(Comparator.comparing(UsageRankingItem::usedMinutes).reversed())
                .limit(RANKING_LIMIT)
                .toList();

        List<UsageRankingItem> highestSmsConsumers = items.stream()
                .sorted(Comparator.comparing(UsageRankingItem::usedSms).reversed())
                .limit(RANKING_LIMIT)
                .toList();

        List<UsageRankingItem> exceedingLimits = items.stream()
                .filter(this::exceedsAnyLimit)
                .toList();

        List<UsageRankingItem> underutilized = items.stream()
                .filter(this::isUnderutilized)
                .toList();

        return new UsageAnalyticsResponse(
                highestInternetConsumers,
                highestVoiceConsumers,
                highestSmsConsumers,
                exceedingLimits,
                underutilized
        );
    }

    private boolean exceedsAnyLimit(UsageRankingItem item) {
        return item.usedInternetGb().compareTo(item.internetLimitGb()) > 0
                || item.usedMinutes() > item.minuteLimit()
                || item.usedSms() > item.smsLimit();
    }

    private boolean isUnderutilized(UsageRankingItem item) {
        BigDecimal internetThreshold = item.internetLimitGb().multiply(UNDERUTILIZED_THRESHOLD);
        double minuteThreshold = item.minuteLimit() * UNDERUTILIZED_THRESHOLD.doubleValue();
        double smsThreshold = item.smsLimit() * UNDERUTILIZED_THRESHOLD.doubleValue();

        return item.usedInternetGb().compareTo(internetThreshold) < 0
                && item.usedMinutes() < minuteThreshold
                && item.usedSms() < smsThreshold;
    }

    private Map<Long, UsageSummary> latestUsageBySubscription(Long organizationId) {
        List<UsageSummary> summaries = usageSummaryRepository.findBySubscription_Organization_Id(organizationId);

        return summaries.stream()
                .collect(Collectors.toMap(
                        summary -> summary.getSubscription().getId(),
                        summary -> summary,
                        (existing, candidate) -> periodKey(candidate).compareTo(periodKey(existing)) > 0 ? candidate : existing
                ));
    }

    private Integer periodKey(UsageSummary summary) {
        return summary.getUsageYear() * 100 + summary.getUsageMonth();
    }

    private UsageRankingItem toUsageRankingItem(UsageSummary usage) {
        Subscription subscription = usage.getSubscription();
        Customers customer = subscription.getCustomers();
        TariffPackage tariffPackage = subscription.getTariffPackage();

        return new UsageRankingItem(
                subscription.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                subscription.getPhoneNumber(),
                tariffPackage.getPackageName(),
                usage.getUsedInternetGb(),
                usage.getUsedMinutes(),
                usage.getUsedSms(),
                tariffPackage.getInternetLimitGb(),
                tariffPackage.getMinuteLimit(),
                tariffPackage.getSmsLimit()
        );
    }

    private Subscription requireSubscription(Long organizationId, Long subscriptionId) {
        return subscriptionRepository.findByIdAndOrganization_Id(subscriptionId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Abonelik bulunamadı"));
    }

    private Optional<Subscription> primarySubscriptionFor(Long organizationId, Long customerId) {
        return primarySubscriptionOf(subscriptionRepository.findByOrganization_IdAndCustomers_Id(organizationId, customerId));
    }

    private Optional<Subscription> primarySubscriptionOf(List<Subscription> subscriptions) {
        return subscriptions.stream()
                .sorted(Comparator
                        .comparing((Subscription s) -> s.getStatus() == Status.ACTIVE ? 0 : 1)
                        .thenComparing(Subscription::getStartDate, Comparator.reverseOrder()))
                .findFirst();
    }

    private EmployeeResponse toEmployeeResponse(Customers customer, Optional<Subscription> primarySubscription) {
        PackageResponse currentPackage = primarySubscription
                .map(subscription -> toPackageResponse(subscription.getTariffPackage()))
                .orElse(null);

        String phoneNumber = primarySubscription
                .map(Subscription::getPhoneNumber)
                .orElse(customer.getPhoneNumber());

        String subscriptionStatus = primarySubscription
                .map(subscription -> subscription.getStatus().name())
                .orElse(null);

        var commitmentStart = primarySubscription.map(Subscription::getCommitmentStartDate).orElse(null);
        var commitmentEnd = primarySubscription.map(Subscription::getCommitmentEndDate).orElse(null);

        var latestInvoice = primarySubscription
                .flatMap(subscription -> invoiceService.getLatestInvoiceForSubscription(subscription.getId()))
                .orElse(null);

        CurrentUsageResponse currentUsage = primarySubscription
                .flatMap(this::latestCurrentUsage)
                .orElse(null);

        return new EmployeeResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                phoneNumber,
                currentPackage,
                subscriptionStatus,
                commitmentStart,
                commitmentEnd,
                latestInvoice,
                currentUsage
        );
    }

    private Optional<CurrentUsageResponse> latestCurrentUsage(Subscription subscription) {
        return usageSummaryRepository
                .findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(subscription.getId())
                .stream()
                .findFirst()
                .map(usage -> toCurrentUsageResponse(usage, subscription.getTariffPackage()));
    }

    private CurrentUsageResponse toCurrentUsageResponse(UsageSummary usage, TariffPackage tariffPackage) {
        boolean exceedsLimit = usage.getUsedInternetGb().compareTo(tariffPackage.getInternetLimitGb()) > 0
                || usage.getUsedMinutes() > tariffPackage.getMinuteLimit()
                || usage.getUsedSms() > tariffPackage.getSmsLimit();

        return new CurrentUsageResponse(
                usage.getUsageMonth(),
                usage.getUsageYear(),
                usage.getUsedInternetGb(),
                usage.getUsedMinutes(),
                usage.getUsedSms(),
                tariffPackage.getInternetLimitGb(),
                tariffPackage.getMinuteLimit(),
                tariffPackage.getSmsLimit(),
                exceedsLimit
        );
    }

    private SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        Customers customer = subscription.getCustomers();

        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getSubscriptionNumber(),
                subscription.getPhoneNumber(),
                customer.getFirstName() + " " + customer.getLastName(),
                toPackageResponse(subscription.getTariffPackage()),
                subscription.getStatus().name(),
                subscription.getCommitmentStartDate(),
                subscription.getCommitmentEndDate()
        );
    }

    private PackageResponse toPackageResponse(TariffPackage tariffPackage) {
        return new PackageResponse(
                tariffPackage.getId(),
                tariffPackage.getPackageCode(),
                tariffPackage.getPackageName(),
                tariffPackage.getInternetLimitGb(),
                tariffPackage.getMinuteLimit(),
                tariffPackage.getSmsLimit(),
                tariffPackage.getMonthlyFee()
        );
    }
}
