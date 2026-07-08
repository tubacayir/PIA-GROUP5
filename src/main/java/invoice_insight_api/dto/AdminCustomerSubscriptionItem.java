package invoice_insight_api.dto;

import java.time.LocalDate;

public record AdminCustomerSubscriptionItem(
        Long id,
        String subscriptionNumber,
        String phoneNumber,
        String packageName,
        String status,
        LocalDate startDate,
        String organizationName
) {
}
