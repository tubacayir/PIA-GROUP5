package invoice_insight_api.shared.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceSummaryResponse(
        Long id,
        String invoiceNumber,
        Integer invoiceMonth,
        Integer invoiceYear,
        LocalDate issueDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        String status
) {
}
