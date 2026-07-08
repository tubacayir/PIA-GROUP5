package invoice_insight_api.shared.service;

import invoice_insight_api.corporate.dto.CorporateInvoiceSummaryResponse;
import invoice_insight_api.corporate.dto.InvoiceAnalyticsResponse;
import invoice_insight_api.shared.dto.InvoiceDetailResponse;
import invoice_insight_api.shared.dto.InvoiceLineResponse;
import invoice_insight_api.shared.dto.InvoiceSummaryResponse;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;
import invoice_insight_api.corporate.dto.TopSpenderItem;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.Customers;
import invoice_insight_api.shared.model.Invoice;
import invoice_insight_api.shared.model.Subscription;
import invoice_insight_api.shared.repository.InvoiceLineRepository;
import invoice_insight_api.shared.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository invoiceLineRepository;

    public List<InvoiceSummaryResponse> getInvoicesForCustomer(Long customerId) {
        return invoiceRepository.findBySubscription_Customers_IdOrderByIssueDateDesc(customerId).stream()
                .map(this::toSummary)
                .toList();
    }

    public InvoiceDetailResponse getInvoiceDetail(Long customerId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndSubscription_Customers_Id(invoiceId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura bulunamadı"));

        return toDetail(invoice);
    }

    public List<CorporateInvoiceSummaryResponse> getInvoicesForOrganization(Long organizationId) {
        return invoiceRepository.findBySubscription_Organization_IdOrderByIssueDateDesc(organizationId).stream()
                .map(this::toCorporateSummary)
                .toList();
    }

    public InvoiceDetailResponse getInvoiceDetailForOrganization(Long organizationId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndSubscription_Organization_Id(invoiceId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura bulunamadı"));

        return toDetail(invoice);
    }

    public InvoiceAnalyticsResponse getInvoiceAnalyticsForOrganization(Long organizationId) {
        List<Invoice> invoices = invoiceRepository.findBySubscription_Organization_IdOrderByIssueDateDesc(organizationId);

        BigDecimal averageInvoiceAmount = invoices.isEmpty()
                ? BigDecimal.ZERO
                : invoices.stream()
                        .map(Invoice::getTotalAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(invoices.size()), 2, RoundingMode.HALF_UP);

        Map<Long, List<Invoice>> invoicesBySubscriptionId = invoices.stream()
                .collect(Collectors.groupingBy(invoice -> invoice.getSubscription().getId()));

        List<TopSpenderItem> mostExpensiveSubscriptions = invoicesBySubscriptionId.values().stream()
                .map(subscriptionInvoices -> {
                    Subscription subscription = subscriptionInvoices.get(0).getSubscription();
                    Customers customer = subscription.getCustomers();
                    BigDecimal total = subscriptionInvoices.stream()
                            .map(Invoice::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new TopSpenderItem(
                            subscription.getId(),
                            customer.getFirstName() + " " + customer.getLastName(),
                            subscription.getPhoneNumber(),
                            subscription.getTariffPackage().getPackageName(),
                            total
                    );
                })
                .sorted(Comparator.comparing(TopSpenderItem::totalBilledAmount).reversed())
                .limit(5)
                .toList();

        return new InvoiceAnalyticsResponse(averageInvoiceAmount, mostExpensiveSubscriptions);
    }

    public List<MonthlyInvoiceTrendPoint> getMonthlyInvoiceTrendForOrganization(Long organizationId) {
        List<Invoice> invoices = invoiceRepository.findBySubscription_Organization_IdOrderByIssueDateDesc(organizationId);

        Map<Integer, List<Invoice>> byPeriod = invoices.stream()
                .collect(Collectors.groupingBy(invoice -> invoice.getInvoiceYear() * 100 + invoice.getInvoiceMonth()));

        return byPeriod.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MonthlyInvoiceTrendPoint(
                        entry.getKey() / 100,
                        entry.getKey() % 100,
                        entry.getValue().stream()
                                .map(Invoice::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .toList();
    }

    public Optional<InvoiceSummaryResponse> getLatestInvoiceForSubscription(Long subscriptionId) {
        return invoiceRepository.findBySubscription_IdOrderByIssueDateDesc(subscriptionId).stream()
                .findFirst()
                .map(this::toSummary);
    }

    private InvoiceDetailResponse toDetail(Invoice invoice) {
        List<InvoiceLineResponse> lines = invoiceLineRepository.findByInvoice_Id(invoice.getId()).stream()
                .map(line -> new InvoiceLineResponse(
                        line.getLineType().name(),
                        line.getDescription(),
                        line.getQuantity(),
                        line.getUnitPrice(),
                        line.getAmount()
                ))
                .toList();

        Subscription subscription = invoice.getSubscription();

        return new InvoiceDetailResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceMonth(),
                invoice.getInvoiceYear(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getTotalAmount(),
                invoice.getStatus().name(),
                subscription.getSubscriptionNumber(),
                subscription.getPhoneNumber(),
                subscription.getTariffPackage().getPackageName(),
                lines
        );
    }

    private InvoiceSummaryResponse toSummary(Invoice invoice) {
        return new InvoiceSummaryResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getInvoiceMonth(),
                invoice.getInvoiceYear(),
                invoice.getIssueDate(),
                invoice.getDueDate(),
                invoice.getTotalAmount(),
                invoice.getStatus().name()
        );
    }

    private CorporateInvoiceSummaryResponse toCorporateSummary(Invoice invoice) {
        Subscription subscription = invoice.getSubscription();
        Customers customer = subscription.getCustomers();

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
}
