package invoice_insight_api.corporate.dto;

import invoice_insight_api.shared.dto.PackageResponse;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long totalEmployees,
        long totalActiveSubscriptions,
        BigDecimal totalMonthlyInvoiceAmount,
        BigDecimal totalInternetUsageGb,
        long totalVoiceMinutes,
        long totalSmsUsage,
        long subscriptionsExceedingLimits,
        long recommendationOpportunities,
        PackageResponse currentCorporatePackage
) {
}
