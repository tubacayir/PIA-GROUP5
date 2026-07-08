package invoice_insight_api.admin.dto;

public record AdminMonthlyCountPoint(
        int year,
        int month,
        long count
) {
}
