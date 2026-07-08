package invoice_insight_api.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminOrganizationDetailResponse(
        Long id,
        String taxIdentityNumber,
        String name,
        String sector,
        Integer employeeCount,
        String city,
        String status,
        long subscriptionCount,
        long activeSubscriptionCount,
        BigDecimal totalBilledAmount,
        List<SubscriptionResponse> subscriptions,
        List<CorporateInvoiceSummaryResponse> invoiceHistory,
        List<MonthlyInvoiceTrendPoint> monthlyInvoiceTrend
) {
}
