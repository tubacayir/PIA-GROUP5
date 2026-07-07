package invoice_insight_api.dto;

import java.math.BigDecimal;

public record CurrentUsageResponse(
        Integer usageMonth,
        Integer usageYear,
        BigDecimal usedInternetGb,
        Integer usedMinutes,
        Integer usedSms,
        BigDecimal internetLimitGb,
        Integer minuteLimit,
        Integer smsLimit,
        boolean exceedsLimit
) {
}
