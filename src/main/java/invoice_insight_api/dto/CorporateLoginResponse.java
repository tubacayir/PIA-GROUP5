package invoice_insight_api.dto;

public record CorporateLoginResponse(
        String token,
        String tokenType,
        Long organizationId,
        String organizationName
) {
}
