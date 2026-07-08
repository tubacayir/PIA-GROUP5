package invoice_insight_api.corporate.dto;

import java.math.BigDecimal;

public record MonthlyUsageTrendPoint(
        int year,
        int month,
        BigDecimal internetGb,
        long voiceMinutes,
        long smsCount
) {
}
