package invoice_insight_api.corporate.dto;

import java.math.BigDecimal;
import java.util.List;

public record InvoiceAnalyticsResponse(
        BigDecimal averageInvoiceAmount,
        List<TopSpenderItem> mostExpensiveSubscriptions
) {
}
