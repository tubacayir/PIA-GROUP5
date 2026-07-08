package invoice_insight_api.shared.dto;

import java.math.BigDecimal;

public record MonthlyInvoiceTrendPoint(
        int year,
        int month,
        BigDecimal totalAmount
) {
}
