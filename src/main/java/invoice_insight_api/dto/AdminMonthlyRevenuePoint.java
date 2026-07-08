package invoice_insight_api.dto;

import java.math.BigDecimal;

public record AdminMonthlyRevenuePoint(
        int year,
        int month,
        BigDecimal totalAmount
) {
}
