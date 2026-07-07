package invoice_insight_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CorporateInvoiceSummaryResponse(
        Long id,
        String invoiceNumber,
        String employeeName,
        String phoneNumber,
        Integer invoiceMonth,
        Integer invoiceYear,
        LocalDate issueDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        String status
) {
}
