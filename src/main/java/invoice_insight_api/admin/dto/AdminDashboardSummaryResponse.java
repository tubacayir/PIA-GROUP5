package invoice_insight_api.admin.dto;

import java.math.BigDecimal;

public record AdminDashboardSummaryResponse(
        long totalCustomers,
        long totalSubscriptions,
        long totalCompanies,
        long corporateLineCount,
        long totalInvoices,
        BigDecimal monthlyRevenue,
        double digitalInvoiceRatePercent,
        double paperInvoiceRatePercent,
        double paidOnTimeRatePercent,
        double latePaymentRatePercent,
        BigDecimal averageInvoiceAmount,
        BigDecimal averageInternetUsageGb
) {
}
