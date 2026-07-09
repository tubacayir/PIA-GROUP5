package invoice_insight_api.admin.dto;

import java.util.List;

public record AdminDashboardChartsResponse(
        List<AdminMonthlyRevenuePoint> monthlyRevenueTrend,
        List<AdminMonthlyCountPoint> monthlyInvoiceCountTrend,
        List<NameCountItem> packageDistribution,
        List<NameCountItem> corporateVsIndividual,
        List<NameCountItem> invoiceStatusDistribution,
        List<NameCountItem> paymentChannelDistribution,
        List<NameCountItem> digitalVsPaper,
        List<NameCountItem> topCities,
        List<NameCountItem> ageDistribution,
        List<NameCountItem> genderDistribution,
        List<NameCountItem> topPackages,
        List<NameAmountItem> topCompanies,
        List<NameCountItem> usageDistribution,
        List<NameAmountItem> invoiceAmountByAgeGroup,
        List<NameAmountItem> invoiceAmountByPaymentChannel,
        List<NameAmountItem> invoiceAmountByDeliveryMethod,
        List<NameAmountItem> invoiceAmountByPackageUsage,
        List<AdminMonthlyCountPoint> latePaymentTrend
) {
}
