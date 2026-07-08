package invoice_insight_api.corporate.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        long totalEmployees,
        long totalActiveSubscriptions,
        BigDecimal totalMonthlyInvoiceAmount,
        BigDecimal totalInternetUsageGb,
        long totalVoiceMinutes,
        long totalSmsUsage,
        long subscriptionsExceedingLimits,
        long recommendationOpportunities
) {
}
