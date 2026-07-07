package invoice_insight_api.dto;

import java.time.LocalDate;

public record SubscriptionResponse(
        Long id,
        String subscriptionNumber,
        String phoneNumber,
        String employeeName,
        PackageResponse tariffPackage,
        String status,
        LocalDate commitmentStartDate,
        LocalDate commitmentEndDate
) {
}
