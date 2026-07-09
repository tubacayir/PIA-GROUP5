package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminOrganizationDetailResponse;
import invoice_insight_api.admin.dto.AdminOrganizationSummaryResponse;
import invoice_insight_api.corporate.dto.CorporateInvoiceSummaryResponse;
import invoice_insight_api.admin.dto.CreateOrganizationRequest;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.corporate.dto.SubscriptionResponse;
import invoice_insight_api.admin.dto.UpdateOrganizationRequest;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.DuplicateResourceException;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.*;
import invoice_insight_api.shared.repository.InvoiceRepository;
import invoice_insight_api.shared.repository.OrganizationRepository;
import invoice_insight_api.shared.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOrganizationService {

    private final OrganizationRepository organizationRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminOrganizationSummaryResponse> getOrganizations(String search, String city, String sector, Status status) {
        List<Organization> organizations = organizationRepository.findByStatusNot(Status.DELETED);
        String normalizedSearch = search == null ? null : search.trim().toLowerCase();

        return organizations.stream()
                .filter(org -> {
                    if (normalizedSearch != null && !normalizedSearch.isEmpty()) {
                        String haystack = (org.getName() + " " + org.getTaxIdentityNumber()).toLowerCase();
                        if (!haystack.contains(normalizedSearch)) {
                            return false;
                        }
                    }
                    if (city != null && !city.isBlank() && !city.equalsIgnoreCase(org.getCity())) {
                        return false;
                    }
                    if (sector != null && !sector.isBlank() && !sector.equalsIgnoreCase(org.getSector())) {
                        return false;
                    }
                    if (status != null && status != org.getStatus()) {
                        return false;
                    }
                    return true;
                })
                .map(org -> toSummary(org, subscriptionRepository.findByOrganization_Id(org.getId()).size()))
                .toList();
    }

    public AdminOrganizationDetailResponse getOrganizationDetail(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Şirket bulunamadı"));

        List<Subscription> subscriptions = subscriptionRepository.findByOrganization_Id(id);
        long activeSubscriptionCount = subscriptions.stream()
                .filter(s -> s.getStatus() == Status.ACTIVE)
                .count();

        List<Invoice> invoices = invoiceRepository.findBySubscription_Organization_IdOrderByIssueDateDesc(id);
        BigDecimal totalBilledAmount = invoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<SubscriptionResponse> subscriptionResponses = subscriptions.stream()
                .map(this::toSubscriptionResponse)
                .toList();

        List<CorporateInvoiceSummaryResponse> invoiceHistory = invoices.stream()
                .map(this::toCorporateInvoiceSummary)
                .toList();

        List<MonthlyInvoiceTrendPoint> monthlyInvoiceTrend = buildMonthlyInvoiceTrend(invoices);

        return new AdminOrganizationDetailResponse(
                organization.getId(),
                organization.getTaxIdentityNumber(),
                organization.getName(),
                organization.getSector(),
                organization.getEmployeeCount(),
                organization.getCity(),
                organization.getStatus().name(),
                subscriptions.size(),
                activeSubscriptionCount,
                totalBilledAmount,
                subscriptionResponses,
                invoiceHistory,
                monthlyInvoiceTrend
        );
    }

    @Transactional
    public AdminOrganizationSummaryResponse createOrganization(CreateOrganizationRequest request) {
        if (organizationRepository.findByTaxIdentityNumber(request.taxIdentityNumber()).isPresent()) {
            throw new DuplicateResourceException("Bu vergi kimlik numarası zaten kayıtlı");
        }

        Organization organization = new Organization();
        organization.setOrganizationNumber(nextOrganizationNumber());
        organization.setTaxIdentityNumber(request.taxIdentityNumber());
        organization.setName(request.name());
        organization.setPassword(passwordEncoder.encode(request.password()));
        organization.setSector(request.sector());
        organization.setEmployeeCount(request.employeeCount());
        organization.setCity(request.city());
        organization.setStatus(Status.ACTIVE);
        organization.setCreatedAt(LocalDateTime.now());
        organization.setUpdatedAt(LocalDateTime.now());

        Organization saved = organizationRepository.save(organization);
        return toSummary(saved, 0);
    }

    @Transactional
    public AdminOrganizationSummaryResponse updateOrganization(Long id, UpdateOrganizationRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Şirket bulunamadı"));

        organization.setName(request.name());
        organization.setSector(request.sector());
        organization.setEmployeeCount(request.employeeCount());
        organization.setCity(request.city());
        organization.setUpdatedAt(LocalDateTime.now());

        Organization saved = organizationRepository.save(organization);
        return toSummary(saved, subscriptionRepository.findByOrganization_Id(id).size());
    }

    @Transactional
    public void deleteOrganization(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Şirket bulunamadı"));

        organization.setStatus(Status.DELETED);
        organization.setUpdatedAt(LocalDateTime.now());
        organizationRepository.save(organization);
    }

    private String nextOrganizationNumber() {
        int max = organizationRepository.findAll().stream()
                .map(Organization::getOrganizationNumber)
                .filter(number -> number != null && number.chars().allMatch(Character::isDigit))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(0);
        return String.valueOf(max + 1);
    }

    private AdminOrganizationSummaryResponse toSummary(Organization organization, long subscriptionCount) {
        return new AdminOrganizationSummaryResponse(
                organization.getId(),
                organization.getName(),
                organization.getTaxIdentityNumber(),
                organization.getSector(),
                organization.getCity(),
                subscriptionCount,
                organization.getStatus().name()
        );
    }

    private SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        Customers customer = subscription.getCustomer();
        TariffPackage tariffPackage = subscription.getTariffPackage();

        return new SubscriptionResponse(
                subscription.getId(),
                subscription.getSubscriptionNumber(),
                subscription.getPhoneNumber(),
                customer.getFirstName() + " " + customer.getLastName(),
                new PackageResponse(
                        tariffPackage.getId(),
                        tariffPackage.getPackageCode(),
                        tariffPackage.getPackageName(),
                        tariffPackage.getInternetLimitGb(),
                        tariffPackage.getMinuteLimit(),
                        tariffPackage.getSmsLimit(),
                        tariffPackage.getMonthlyFee()
                ),
                subscription.getStatus().name(),
                subscription.getCommitmentStartDate(),
                subscription.getCommitmentEndDate()
        );
    }

    private CorporateInvoiceSummaryResponse toCorporateInvoiceSummary(Invoice invoice) {
        Subscription subscription = invoice.getSubscription();
        Customers customer = subscription.getCustomer();

        return new CorporateInvoiceSummaryResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                customer.getFirstName() + " " + customer.getLastName(),
                subscription.getPhoneNumber(),
                invoice.getInvoiceMonth(),
                invoice.getInvoiceYear(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getTotalAmount(),
                invoice.getStatus().name()
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
}
