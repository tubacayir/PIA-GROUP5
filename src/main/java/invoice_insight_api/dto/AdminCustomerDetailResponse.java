package invoice_insight_api.dto;

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
