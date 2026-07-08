package invoice_insight_api.dto;

public record AdminUserResponse(
        Long id,
        String email,
        String fullName,
        boolean canCreateInvoices,
        String status
) {
}
