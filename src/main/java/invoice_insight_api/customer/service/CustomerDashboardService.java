package invoice_insight_api.customer.service;

import invoice_insight_api.customer.dto.DashboardSummaryResponse;
import invoice_insight_api.shared.enums.InvoiceStatus;
import invoice_insight_api.shared.model.Invoice;
import invoice_insight_api.shared.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerDashboardService {

    private static final List<InvoiceStatus> UNPAID_STATUSES = List.of(InvoiceStatus.CREATED, InvoiceStatus.OVERDUE);

    private final InvoiceRepository invoiceRepository;

    public DashboardSummaryResponse getDashboardSummary(Long customerId) {
        List<Invoice> unpaidInvoices = invoiceRepository
                .findBySubscription_Customers_IdAndStatusInOrderByDueDateAsc(customerId, UNPAID_STATUSES);

        BigDecimal totalUnpaidAmount = unpaidInvoices.stream()
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate nextPaymentDueDate = unpaidInvoices.stream()
                .findFirst()
                .map(Invoice::getDueDate)
                .orElse(null);

        return new DashboardSummaryResponse(totalUnpaidAmount, nextPaymentDueDate);
    }
}
