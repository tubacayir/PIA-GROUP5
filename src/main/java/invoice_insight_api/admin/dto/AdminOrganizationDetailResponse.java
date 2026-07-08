package invoice_insight_api.admin.dto;

import invoice_insight_api.corporate.dto.CorporateInvoiceSummaryResponse;
import invoice_insight_api.corporate.dto.SubscriptionResponse;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;

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
