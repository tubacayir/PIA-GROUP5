package invoice_insight_api.dto;

import java.math.BigDecimal;

public record InvoiceLineResponse(
        String lineType,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount
) {
}
