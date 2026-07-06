package invoice_insight_api.service;

import invoice_insight_api.dto.InvoiceDetailResponse;
import invoice_insight_api.dto.InvoiceLineResponse;
import invoice_insight_api.dto.InvoiceSummaryResponse;
import invoice_insight_api.exception.ResourceNotFoundException;
import invoice_insight_api.model.Invoice;
import invoice_insight_api.model.Subscription;
import invoice_insight_api.repository.InvoiceLineRepository;
import invoice_insight_api.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    public List<InvoiceSummaryResponse> getInvoicesForOrganization(Long organizationId) {
        return invoiceRepository.findBySubscription_Organization_IdOrderByIssueDateDesc(organizationId).stream()
                .map(this::toSummary)
                .toList();
    }

    public InvoiceDetailResponse getInvoiceDetail(Long customerId, Long invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndSubscription_Customers_Id(invoiceId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Fatura bulunamadı"));

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
}
