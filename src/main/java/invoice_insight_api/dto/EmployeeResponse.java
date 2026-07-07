package invoice_insight_api.dto;

public record EmployeeResponse(
        Long id,
        String firstName,
        String lastName,
        String phoneNumber,
        PackageResponse currentPackage,
        String subscriptionStatus,
        java.time.LocalDate commitmentStartDate,
        java.time.LocalDate commitmentEndDate,
        InvoiceSummaryResponse latestInvoice,
        CurrentUsageResponse currentUsage
) {
}
