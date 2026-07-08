package invoice_insight_api.dto;

public record AdminOrganizationSummaryResponse(
        Long id,
        String name,
        String taxIdentityNumber,
        String sector,
        String city,
        long subscriptionCount,
        String status
) {
}
