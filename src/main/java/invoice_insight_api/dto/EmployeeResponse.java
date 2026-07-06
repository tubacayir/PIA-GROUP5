package invoice_insight_api.dto;

public record EmployeeResponse(
        Long id,
        String tcIdentityNumber,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String city,
        String status
) {
}
