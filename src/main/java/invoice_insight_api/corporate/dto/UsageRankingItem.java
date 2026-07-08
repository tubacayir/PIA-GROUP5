package invoice_insight_api.corporate.dto;

import java.math.BigDecimal;

public record UsageRankingItem(
        Long subscriptionId,
        String employeeName,
        String phoneNumber,
        String packageName,
        BigDecimal usedInternetGb,
        Integer usedMinutes,
        Integer usedSms,
        BigDecimal internetLimitGb,
        Integer minuteLimit,
        Integer smsLimit
) {
}
