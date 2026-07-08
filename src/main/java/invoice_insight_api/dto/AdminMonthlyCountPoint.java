package invoice_insight_api.dto;

public record AdminMonthlyCountPoint(
        int year,
        int month,
        long count
) {
}
