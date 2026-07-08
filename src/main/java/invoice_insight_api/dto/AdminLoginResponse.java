package invoice_insight_api.dto;

public record AdminLoginResponse(
        String token,
        String tokenType,
        Long adminId,
        String fullName,
        boolean canCreateInvoices
) {
}
