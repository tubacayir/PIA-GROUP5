package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminCustomerDetailResponse;
import invoice_insight_api.admin.dto.AdminCustomerSubscriptionItem;
import invoice_insight_api.admin.dto.AdminCustomerSummaryResponse;
import invoice_insight_api.admin.dto.AdminPaymentHistoryItem;
import invoice_insight_api.admin.dto.CreateCustomerRequest;
import invoice_insight_api.shared.dto.CurrentUsageResponse;
import invoice_insight_api.shared.dto.InvoiceSummaryResponse;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;
import invoice_insight_api.corporate.dto.MonthlyUsageTrendPoint;
import invoice_insight_api.admin.dto.UpdateCustomerRequest;
import invoice_insight_api.shared.enums.Gender;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.DuplicateResourceException;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.Customers;
import invoice_insight_api.shared.model.Invoice;
import invoice_insight_api.shared.model.Organization;
import invoice_insight_api.shared.model.Subscription;
import invoice_insight_api.shared.model.TariffPackage;
import invoice_insight_api.shared.model.UsageSummary;
import invoice_insight_api.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import invoice_insight_api.shared.enums.SubscriptionType;


import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCustomerService {

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final UsageSummaryRepository usageSummaryRepository;
    private final PasswordEncoder passwordEncoder;
    private final TariffPackageRepository tariffPackageRepository;
    private final OrganizationRepository organizationRepository;


    public List<AdminCustomerSummaryResponse> getCustomers(String search, String city, Gender gender,
                                                             Status status, String customerType,
                                                             Long packageId, Integer minAge, Integer maxAge) {
        List<Customers> customers = customerRepository.findByStatusNot(Status.DELETED);
        List<Subscription> allSubscriptions = subscriptionRepository.findAll();

        Map<Long, List<Subscription>> subscriptionsByCustomerId = allSubscriptions.stream()
                .collect(Collectors.groupingBy(s -> s.getCustomers().getId()));

        String normalizedSearch = search == null ? null : search.trim().toLowerCase();
        LocalDate today = LocalDate.now();

        return customers.stream()
                .filter(customer -> {
                    List<Subscription> subs = subscriptionsByCustomerId.getOrDefault(customer.getId(), List.of());
                    boolean isCorporate = subs.stream().anyMatch(s -> s.getOrganization() != null);
                    String type = isCorporate ? "Corporate" : "Individual";
                    int age = Period.between(customer.getBirthDate(), today).getYears();

                    if (normalizedSearch != null && !normalizedSearch.isEmpty()) {
                        String haystack = (customer.getFirstName() + " " + customer.getLastName() + " "
                                + customer.getTcIdentityNumber() + " " + customer.getEmail() + " "
                                + customer.getPhoneNumber()).toLowerCase();
                        if (!haystack.contains(normalizedSearch)) {
                            return false;
                        }
                    }
                    if (city != null && !city.isBlank() && !city.equalsIgnoreCase(customer.getCity())) {
                        return false;
                    }
                    if (gender != null && gender != customer.getGender()) {
                        return false;
                    }
                    if (status != null && status != customer.getStatus()) {
                        return false;
                    }
                    if (customerType != null && !customerType.isBlank() && !customerType.equalsIgnoreCase(type)) {
                        return false;
                    }
                    if (packageId != null && subs.stream().noneMatch(s -> s.getTariffPackage().getId().equals(packageId))) {
                        return false;
                    }
                    if (minAge != null && age < minAge) {
                        return false;
                    }
                    if (maxAge != null && age > maxAge) {
                        return false;
                    }
                    return true;
                })
                .map(customer -> toSummary(customer, subscriptionsByCustomerId.getOrDefault(customer.getId(), List.of()), today))
                .toList();
    }

    public AdminCustomerDetailResponse getCustomerDetail(Long id) {
        Customers customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri bulunamadı"));

        List<Subscription> subscriptions = subscriptionRepository.findByCustomers_Id(id);

        List<Invoice> invoices = subscriptions.stream()
                .flatMap(s -> invoiceRepository.findBySubscription_IdOrderByIssueDateDesc(s.getId()).stream())
                .sorted(Comparator.comparing(Invoice::getIssueDate).reversed())
                .toList();

        List<AdminCustomerSubscriptionItem> subscriptionItems = subscriptions.stream()
                .map(s -> new AdminCustomerSubscriptionItem(
                        s.getId(),
                        s.getSubscriptionNumber(),
                        s.getPhoneNumber(),
                        s.getTariffPackage().getPackageName(),
                        s.getStatus().name(),
                        s.getStartDate(),
                        s.getOrganization() != null ? s.getOrganization().getName() : null
                ))
                .toList();

        List<InvoiceSummaryResponse> invoiceHistory = invoices.stream()
                .map(i -> new InvoiceSummaryResponse(
                        i.getId(), i.getInvoiceNumber(), i.getInvoiceMonth(), i.getInvoiceYear(),
                        i.getIssueDate(), i.getDueDate(), i.getTotalAmount(), i.getStatus().name()
                ))
                .toList();

        List<CurrentUsageResponse> currentUsage = subscriptions.stream()
                .map(s -> usageSummaryRepository.findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(s.getId())
                        .stream()
                        .findFirst()
                        .map(u -> toCurrentUsage(u, s.getTariffPackage())))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList();

        List<MonthlyInvoiceTrendPoint> monthlyInvoiceTrend = buildMonthlyInvoiceTrend(invoices);

        List<UsageSummary> allUsage = subscriptions.stream()
                .flatMap(s -> usageSummaryRepository.findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(s.getId()).stream())
                .toList();
        List<MonthlyUsageTrendPoint> usageTrend = buildMonthlyUsageTrend(allUsage);

        List<AdminPaymentHistoryItem> paymentHistory = invoices.stream()
                .filter(i -> i.getPaymentDate() != null)
                .map(i -> new AdminPaymentHistoryItem(
                        i.getInvoiceNumber(),
                        i.getPaymentDate(),
                        i.getPaymentChannel() != null ? i.getPaymentChannel().name() : null,
                        i.getTotalAmount(),
                        !i.getPaymentDate().isAfter(i.getDueDate())
                ))
                .toList();

        return new AdminCustomerDetailResponse(
                customer.getId(),
                customer.getTcIdentityNumber(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getEmail(),
                customer.getPhoneNumber(),
                customer.getBirthDate(),
                customer.getGender().name(),
                customer.getCity(),
                customer.getStatus().name(),
                subscriptionItems,
                invoiceHistory,
                currentUsage,
                monthlyInvoiceTrend,
                usageTrend,
                paymentHistory
        );
    }

    @Transactional
    public AdminCustomerSummaryResponse createCustomer(CreateCustomerRequest request) {
        if (customerRepository.findByTcIdentityNumber(request.tcIdentityNumber()).isPresent()) {
            throw new DuplicateResourceException("Bu TC kimlik numarası zaten kayıtlı");
        }
        if (customerRepository.findByEmail(request.email()).isPresent()) {
            throw new DuplicateResourceException("Bu e-posta adresi zaten kayıtlı");
        }
        if (customerRepository.findByPhoneNumber(request.phoneNumber()).isPresent()) {
            throw new DuplicateResourceException("Bu telefon numarası zaten kayıtlı");
        }

        TariffPackage tariffPackage = tariffPackageRepository.findById(request.tariffPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Paket bulunamadı"));
        Organization organization = request.organizationId() == null ? null : organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Organizasyon bulunamadı"));

        Customers customer = new Customers();
        customer.setTcIdentityNumber(request.tcIdentityNumber());
        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setEmail(request.email());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setPassword(passwordEncoder.encode(request.password()));
        customer.setBirthDate(request.birthDate());
        customer.setGender(request.gender());
        customer.setCity(request.city());
        customer.setStatus(Status.ACTIVE);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        Customers saved = customerRepository.save(customer);

        Subscription subscription = new Subscription();
        subscription.setSubscriptionNumber("SUB" + System.currentTimeMillis());
        subscription.setPhoneNumber(request.phoneNumber());
        subscription.setCustomers(saved);
        subscription.setOrganization(organization);
        subscription.setTariffPackage(tariffPackage);
        subscription.setSubscriptionType(organization == null ? SubscriptionType.INDIVIDUAL : SubscriptionType.CORPORATE);
        subscription.setStartDate(LocalDate.now());
        subscription.setStatus(Status.ACTIVE);
        subscription.setCommitmentStartDate(LocalDate.now());
        subscription.setCommitmentEndDate(LocalDate.now().plusMonths(12));
        subscription.setCreatedAt(LocalDateTime.now());
        subscription.setUpdatedAt(LocalDateTime.now());

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        if (organization != null) {
            organization.setEmployeeCount((organization.getEmployeeCount() == null ? 0 : organization.getEmployeeCount()) + 1);
            organization.setUpdatedAt(LocalDateTime.now());
        }

        return toSummary(saved, List.of(savedSubscription), LocalDate.now());
    }
    @Transactional
    public AdminCustomerSummaryResponse updateCustomer(Long id, UpdateCustomerRequest request) {
        Customers customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri bulunamadı"));

        customerRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Bu e-posta adresi zaten kayıtlı");
                });
        customerRepository.findByPhoneNumber(request.phoneNumber())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Bu telefon numarası zaten kayıtlı");
                });

        customer.setFirstName(request.firstName());
        customer.setLastName(request.lastName());
        customer.setEmail(request.email());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setBirthDate(request.birthDate());
        customer.setGender(request.gender());
        customer.setCity(request.city());
        customer.setUpdatedAt(LocalDateTime.now());

        Customers saved = customerRepository.save(customer);
        List<Subscription> subs = subscriptionRepository.findByCustomers_Id(id);
        return toSummary(saved, subs, LocalDate.now());
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customers customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri bulunamadı"));

        customer.setStatus(Status.DELETED);
        customer.setUpdatedAt(LocalDateTime.now());
        customerRepository.save(customer);
    }

    private AdminCustomerSummaryResponse toSummary(Customers customer, List<Subscription> subscriptions, LocalDate today) {
        boolean isCorporate = subscriptions.stream().anyMatch(s -> s.getOrganization() != null);
        int age = Period.between(customer.getBirthDate(), today).getYears();

        return new AdminCustomerSummaryResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getCity(),
                customer.getGender().name(),
                age,
                subscriptions.size(),
                customer.getStatus().name(),
                isCorporate ? "Corporate" : "Individual"
        );
    }

    private CurrentUsageResponse toCurrentUsage(UsageSummary usage, TariffPackage tariffPackage) {
        boolean exceeds = usage.getUsedInternetGb().compareTo(tariffPackage.getInternetLimitGb()) > 0
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
                exceeds
        );
    }

    private List<MonthlyInvoiceTrendPoint> buildMonthlyInvoiceTrend(List<Invoice> invoices) {
        Map<Integer, List<Invoice>> byPeriod = invoices.stream()
                .collect(Collectors.groupingBy(i -> i.getInvoiceYear() * 100 + i.getInvoiceMonth()));

        return byPeriod.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MonthlyInvoiceTrendPoint(
                        entry.getKey() / 100,
                        entry.getKey() % 100,
                        entry.getValue().stream().map(Invoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .toList();
    }

    private List<MonthlyUsageTrendPoint> buildMonthlyUsageTrend(List<UsageSummary> usageSummaries) {
        Map<Integer, List<UsageSummary>> byPeriod = usageSummaries.stream()
                .collect(Collectors.groupingBy(u -> u.getUsageYear() * 100 + u.getUsageMonth()));

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
}
