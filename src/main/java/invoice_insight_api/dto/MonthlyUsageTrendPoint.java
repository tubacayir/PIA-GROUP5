package invoice_insight_api.dto;

import java.math.BigDecimal;

public record MonthlyUsageTrendPoint(
        int year,
        int month,
        BigDecimal internetGb,
        long voiceMinutes,
        long smsCount
) {
}
