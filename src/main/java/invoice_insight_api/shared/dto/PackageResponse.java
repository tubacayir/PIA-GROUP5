package invoice_insight_api.shared.dto;

import java.math.BigDecimal;

public record PackageResponse(
        Long id,
        String packageCode,
        String packageName,
        BigDecimal internetLimitGb,
        Integer minuteLimit,
        Integer smsLimit,
        BigDecimal monthlyFee
) {
}
