package invoice_insight_api.shared.dto;

import java.math.BigDecimal;

public record InvoiceLineResponse(
        String lineType,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount
) {
}
