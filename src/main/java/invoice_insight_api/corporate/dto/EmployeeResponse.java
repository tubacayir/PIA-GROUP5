package invoice_insight_api.corporate.dto;

import invoice_insight_api.shared.dto.CurrentUsageResponse;
import invoice_insight_api.shared.dto.InvoiceSummaryResponse;
import invoice_insight_api.shared.dto.PackageResponse;

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
