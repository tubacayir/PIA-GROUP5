package invoice_insight_api.admin.dto;

public record AdminLoginResponse(
        String token,
        String tokenType,
        Long adminId,
        String fullName,
        boolean canCreateInvoices
) {
}
