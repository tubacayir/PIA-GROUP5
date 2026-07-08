package invoice_insight_api.admin.dto;

import invoice_insight_api.corporate.dto.MonthlyUsageTrendPoint;
import invoice_insight_api.shared.dto.CurrentUsageResponse;
import invoice_insight_api.shared.dto.InvoiceSummaryResponse;
import invoice_insight_api.shared.dto.MonthlyInvoiceTrendPoint;

import java.time.LocalDate;
import java.util.List;

public record AdminCustomerDetailResponse(
        Long id,
        String tcIdentityNumber,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        LocalDate birthDate,
        String gender,
        String city,
        String status,
        List<AdminCustomerSubscriptionItem> subscriptions,
        List<InvoiceSummaryResponse> invoiceHistory,
        List<CurrentUsageResponse> currentUsage,
        List<MonthlyInvoiceTrendPoint> monthlyInvoiceTrend,
        List<MonthlyUsageTrendPoint> usageTrend,
        List<AdminPaymentHistoryItem> paymentHistory
) {
}
