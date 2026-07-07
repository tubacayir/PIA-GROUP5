package invoice_insight_api.dto;

import java.math.BigDecimal;

public record TopSpenderItem(
        Long subscriptionId,
        String employeeName,
        String phoneNumber,
        String packageName,
        BigDecimal totalBilledAmount
) {
}
