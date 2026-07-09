package invoice_insight_api.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardSummaryResponse(
        BigDecimal totalUnpaidAmount,
        LocalDate nextPaymentDueDate
) {
}
