package invoice_insight_api.dto;

public record AdminCustomerSummaryResponse(
        Long id,
        String firstName,
        String lastName,
        String city,
        String gender,
        int age,
        long subscriptionCount,
        String status,
        String customerType
) {
}
