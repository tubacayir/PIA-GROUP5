package invoice_insight_api.dto;

public record LoginResponse(
        String token,
        String tokenType,
        Long customerId,
        String fullName,
        String email
) {
}
