package invoice_insight_api.admin.dto;

import java.math.BigDecimal;

public record NameAmountItem(
        String name,
        BigDecimal amount
) {
}
