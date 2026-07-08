package invoice_insight_api.shared.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record
InvoiceDetailResponse(
        Long id,
        String invoiceNumber,
        Integer invoiceMonth,
        Integer invoiceYear,
        LocalDate issueDate,
        LocalDate dueDate,
        BigDecimal totalAmount,
        String status,
        String subscriptionNumber,
        String phoneNumber,
        String packageName,
        List<InvoiceLineResponse> lines
) {
}
