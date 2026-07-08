package invoice_insight_api.corporate.dto;

public record CorporateLoginResponse(
        String token,
        String tokenType,
        Long organizationId,
        String organizationName
) {
}
