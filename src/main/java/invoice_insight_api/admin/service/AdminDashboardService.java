package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminDashboardChartsResponse;
import invoice_insight_api.admin.dto.AdminDashboardSummaryResponse;
import invoice_insight_api.admin.dto.AdminMonthlyCountPoint;
import invoice_insight_api.admin.dto.AdminMonthlyRevenuePoint;
import invoice_insight_api.admin.dto.NameAmountItem;
import invoice_insight_api.admin.dto.NameCountItem;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.enums.SubscriptionType;
import invoice_insight_api.shared.model.Invoice;
import invoice_insight_api.shared.model.UsageSummary;
import invoice_insight_api.shared.repository.CustomerRepository;
import invoice_insight_api.shared.repository.InvoiceRepository;
import invoice_insight_api.shared.repository.OrganizationRepository;
import invoice_insight_api.shared.repository.SubscriptionRepository;
import invoice_insight_api.shared.repository.UsageSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static invoice_insight_api.shared.config.CacheConfig.ADMIN_DASHBOARD_CHARTS_CACHE;
import static invoice_insight_api.shared.config.CacheConfig.ADMIN_DASHBOARD_SUMMARY_CACHE;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Period;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final int TOP_N = 5;

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final UsageSummaryRepository usageSummaryRepository;
    private final OrganizationRepository organizationRepository;

    @Cacheable(ADMIN_DASHBOARD_SUMMARY_CACHE)
    public AdminDashboardSummaryResponse getSummary() {
        long totalCustomers = customerRepository.countByStatusNot(Status.DELETED);
        long totalSubscriptions = subscriptionRepository.count();
        long totalCompanies = organizationRepository.count();
        long corporateLineCount = subscriptionRepository.countBySubscriptionType(SubscriptionType.CORPORATE);
        long totalInvoices = invoiceRepository.count();

        List<Object[]> monthlyRevenue = invoiceRepository.findMonthlyRevenueTrend();
        BigDecimal currentMonthlyRevenue = monthlyRevenue.isEmpty()
                ? BigDecimal.ZERO
                : (BigDecimal) monthlyRevenue.get(monthlyRevenue.size() - 1)[2];

        long deliveryTagged = invoiceRepository.countWithDeliveryMethod();
        long digitalCount = invoiceRepository.countDigitalInvoices();
        double digitalRate = deliveryTagged == 0 ? 0 : percentage(digitalCount, deliveryTagged);
        double paperRate = deliveryTagged == 0 ? 0 : 100 - digitalRate;

        long paidWithPaymentDate = invoiceRepository.countPaidWithPaymentDate();
        long paidOnTime = invoiceRepository.countPaidOnTime();
        double paidOnTimeRate = paidWithPaymentDate == 0 ? 0 : percentage(paidOnTime, paidWithPaymentDate);
        double latePaymentRate = paidWithPaymentDate == 0 ? 0 : 100 - paidOnTimeRate;

        BigDecimal averageInvoiceAmount = invoiceRepository.findAverageTotalAmount();
        if (averageInvoiceAmount == null) {
            averageInvoiceAmount = BigDecimal.ZERO;
        } else {
            averageInvoiceAmount = averageInvoiceAmount.setScale(2, RoundingMode.HALF_UP);
        }

        List<UsageSummary> latestUsagePerSubscription = latestUsageBySubscription();
        BigDecimal averageInternetUsageGb = latestUsagePerSubscription.isEmpty()
                ? BigDecimal.ZERO
                : latestUsagePerSubscription.stream()
                        .map(UsageSummary::getUsedInternetGb)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(latestUsagePerSubscription.size()), 2, RoundingMode.HALF_UP);

        return new AdminDashboardSummaryResponse(
                totalCustomers,
                totalSubscriptions,
                totalCompanies,
                corporateLineCount,
                totalInvoices,
                currentMonthlyRevenue,
                round(digitalRate),
                round(paperRate),
                round(paidOnTimeRate),
                round(latePaymentRate),
                averageInvoiceAmount,
                averageInternetUsageGb
        );
    }

    @Cacheable(ADMIN_DASHBOARD_CHARTS_CACHE)
    public AdminDashboardChartsResponse getCharts() {
        Pageable top5 = PageRequest.of(0, TOP_N);
        Pageable allPackages = PageRequest.of(0, 50);
        Pageable allCities = PageRequest.of(0, 81);

        List<AdminMonthlyRevenuePoint> monthlyRevenueTrend = invoiceRepository.findMonthlyRevenueTrend().stream()
                .map(row -> new AdminMonthlyRevenuePoint((Integer) row[0], (Integer) row[1], (BigDecimal) row[2]))
                .toList();

        List<AdminMonthlyCountPoint> monthlyInvoiceCountTrend = invoiceRepository.findMonthlyInvoiceCountTrend().stream()
                .map(row -> new AdminMonthlyCountPoint((Integer) row[0], (Integer) row[1], (Long) row[2]))
                .toList();

        List<NameCountItem> packageDistribution = subscriptionRepository.countBySubscriptionsGroupedByPackage(allPackages).stream()
                .map(row -> new NameCountItem((String) row[1], (Long) row[2]))
                .toList();

        List<NameCountItem> topPackages = subscriptionRepository.countBySubscriptionsGroupedByPackage(top5).stream()
                .map(row -> new NameCountItem((String) row[1], (Long) row[2]))
                .toList();

        List<NameCountItem> corporateVsIndividual = subscriptionRepository.countBySubscriptionTypeGrouped().stream()
                .map(row -> new NameCountItem(row[0].toString(), (Long) row[1]))
                .toList();

        List<NameCountItem> invoiceStatusDistribution = invoiceRepository.countByStatusGrouped().stream()
                .map(row -> new NameCountItem(row[0].toString(), (Long) row[1]))
                .toList();

        List<NameCountItem> paymentChannelDistribution = invoiceRepository.countByPaymentChannelGrouped().stream()
                .map(row -> new NameCountItem(row[0].toString(), (Long) row[1]))
                .toList();

        List<NameCountItem> digitalVsPaper = invoiceRepository.countByDeliveryMethodGrouped().stream()
                .map(row -> new NameCountItem(row[0].toString(), (Long) row[1]))
                .toList();

        List<NameCountItem> topCities = customerRepository.countGroupedByCity(allCities).stream()
                .map(row -> new NameCountItem(displayCityName((String) row[0]), (Long) row[1]))
                .toList();

        List<NameCountItem> genderDistribution = customerRepository.countGroupedByGender().stream()
                .map(row -> new NameCountItem(row[0].toString(), (Long) row[1]))
                .toList();

        List<NameCountItem> ageDistribution = buildAgeDistribution();

        List<NameAmountItem> topCompanies = invoiceRepository.findTopCompaniesByBilledAmount(top5).stream()
                .map(row -> new NameAmountItem((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<UsageSummary> latestUsagePerSubscription = latestUsageBySubscription();
        List<NameCountItem> usageDistribution = buildUsageDistribution(latestUsagePerSubscription);

        List<Invoice> invoicesWithCustomerData = invoiceRepository.findAllWithSubscriptionCustomerAndPackage();
        List<NameAmountItem> invoiceAmountByAgeGroup = buildInvoiceAmountByAgeGroup(invoicesWithCustomerData);
        List<NameAmountItem> invoiceAmountByPaymentChannel = buildInvoiceAmountByPaymentChannel(invoicesWithCustomerData);
        List<NameAmountItem> invoiceAmountByDeliveryMethod = buildInvoiceAmountByDeliveryMethod(invoicesWithCustomerData);
        List<NameAmountItem> invoiceAmountByPackageUsage =
                buildInvoiceAmountByPackageUsage(invoicesWithCustomerData, latestUsagePerSubscription);

        List<AdminMonthlyCountPoint> latePaymentTrend = invoiceRepository.findLatePaymentMonthlyTrend().stream()
                .map(row -> new AdminMonthlyCountPoint((Integer) row[0], (Integer) row[1], (Long) row[2]))
                .toList();

        return new AdminDashboardChartsResponse(
                monthlyRevenueTrend,
                monthlyInvoiceCountTrend,
                packageDistribution,
                corporateVsIndividual,
                invoiceStatusDistribution,
                paymentChannelDistribution,
                digitalVsPaper,
                topCities,
                ageDistribution,
                genderDistribution,
                topPackages,
                topCompanies,
                usageDistribution,
                invoiceAmountByAgeGroup,
                invoiceAmountByPaymentChannel,
                invoiceAmountByDeliveryMethod,
                invoiceAmountByPackageUsage,
                latePaymentTrend
        );
    }

    private List<NameAmountItem> buildInvoiceAmountByAgeGroup(List<Invoice> invoices) {
        LocalDate today = LocalDate.now();
        Map<String, BigDecimal> buckets = new LinkedHashMap<>();
        List.of("18-25", "26-35", "36-45", "46-55", "56+").forEach(bucket -> buckets.put(bucket, BigDecimal.ZERO));

        for (Invoice invoice : invoices) {
            int age = Period.between(invoice.getSubscription().getCustomer().getBirthDate(), today).getYears();
            String bucket = ageBucket(age);
            buckets.put(bucket, buckets.get(bucket).add(invoice.getTotalAmount()));
        }

        return buckets.entrySet().stream()
                .map(entry -> new NameAmountItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<NameAmountItem> buildInvoiceAmountByPaymentChannel(List<Invoice> invoices) {
        return invoices.stream()
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getPaymentChannel() == null ? "No Payment Channel" : invoice.getPaymentChannel().name(),
                        Collectors.reducing(BigDecimal.ZERO, Invoice::getTotalAmount, BigDecimal::add)
                ))
                .entrySet()
                .stream()
                .map(entry -> new NameAmountItem(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(NameAmountItem::amount).reversed())
                .toList();
    }

    private List<NameAmountItem> buildInvoiceAmountByDeliveryMethod(List<Invoice> invoices) {
        return invoices.stream()
                .collect(Collectors.groupingBy(
                        invoice -> invoice.getDeliveryMethod() == null ? "Unknown" : invoice.getDeliveryMethod().name(),
                        Collectors.reducing(BigDecimal.ZERO, Invoice::getTotalAmount, BigDecimal::add)
                ))
                .entrySet()
                .stream()
                .map(entry -> new NameAmountItem(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(NameAmountItem::amount).reversed())
                .toList();
    }

    private List<NameAmountItem> buildInvoiceAmountByPackageUsage(List<Invoice> invoices,
                                                                    List<UsageSummary> latestUsagePerSubscription) {
        Map<Long, String> usageBucketBySubscriptionId = latestUsagePerSubscription.stream()
                .collect(Collectors.toMap(
                        usage -> usage.getSubscription().getId(),
                        this::usageBucket
                ));

        Map<String, BigDecimal> buckets = new LinkedHashMap<>();
        List.of("Under 50%", "50-100%", "Over 100%", "No Usage Data")
                .forEach(bucket -> buckets.put(bucket, BigDecimal.ZERO));

        for (Invoice invoice : invoices) {
            String bucket = usageBucketBySubscriptionId.getOrDefault(invoice.getSubscription().getId(), "No Usage Data");
            buckets.put(bucket, buckets.get(bucket).add(invoice.getTotalAmount()));
        }

        return buckets.entrySet().stream()
                .map(entry -> new NameAmountItem(entry.getKey(), entry.getValue()))
                .toList();
    }

    private List<NameCountItem> buildAgeDistribution() {
        LocalDate today = LocalDate.now();
        Map<String, Long> buckets = customerRepository.findAllBirthDates().stream()
                .map(birthDate -> Period.between(birthDate, today).getYears())
                .collect(Collectors.groupingBy(this::ageBucket, Collectors.counting()));

        List<String> order = List.of("18-25", "26-35", "36-45", "46-55", "56+");
        return order.stream()
                .map(bucket -> new NameCountItem(bucket, buckets.getOrDefault(bucket, 0L)))
                .toList();
    }

    private String ageBucket(int age) {
        if (age <= 25) return "18-25";
        if (age <= 35) return "26-35";
        if (age <= 45) return "36-45";
        if (age <= 55) return "46-55";
        return "56+";
    }

    private String displayCityName(String city) {
        if (city == null) {
            return "Unknown";
        }

        return switch (city) {
            case "Istanbul" -> "İstanbul";
            case "Izmir" -> "İzmir";
            case "Eskisehir" -> "Eskişehir";
            case "Sanliurfa" -> "Şanlıurfa";
            case "Diyarbakir" -> "Diyarbakır";
            default -> city;
        };
    }

    private List<NameCountItem> buildUsageDistribution(List<UsageSummary> latest) {
        long underHalf = 0;
        long halfToFull = 0;
        long overFull = 0;

        for (UsageSummary usage : latest) {
            BigDecimal limit = usage.getSubscription().getTariffPackage().getInternetLimitGb();
            if (limit.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            String bucket = usageBucket(usage);
            if (bucket.equals("Under 50%")) {
                underHalf++;
            } else if (bucket.equals("50-100%")) {
                halfToFull++;
            } else {
                overFull++;
            }
        }

        return List.of(
                new NameCountItem("Under 50%", underHalf),
                new NameCountItem("50-100%", halfToFull),
                new NameCountItem("Over 100%", overFull)
        );
    }

    private String usageBucket(UsageSummary usage) {
        BigDecimal limit = usage.getSubscription().getTariffPackage().getInternetLimitGb();
        if (limit.compareTo(BigDecimal.ZERO) <= 0) {
            return "No Usage Data";
        }

        double ratio = usage.getUsedInternetGb().doubleValue() / limit.doubleValue();
        if (ratio < 0.5) return "Under 50%";
        if (ratio <= 1.0) return "50-100%";
        return "Over 100%";
    }

    private List<UsageSummary> latestUsageBySubscription() {
        return usageSummaryRepository.findAllWithSubscriptionAndPackage().stream()
                .collect(Collectors.toMap(
                        u -> u.getSubscription().getId(),
                        u -> u,
                        (existing, candidate) -> periodKey(candidate) > periodKey(existing) ? candidate : existing
                ))
                .values()
                .stream()
                .sorted(Comparator.comparing(u -> u.getSubscription().getId()))
                .toList();
    }

    private int periodKey(UsageSummary usage) {
        return usage.getUsageYear() * 100 + usage.getUsageMonth();
    }

    private double percentage(long part, long total) {
        return (part * 100.0) / total;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
