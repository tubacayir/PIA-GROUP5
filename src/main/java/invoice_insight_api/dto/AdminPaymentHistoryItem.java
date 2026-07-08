package invoice_insight_api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AdminPaymentHistoryItem(
        String invoiceNumber,
        LocalDate paymentDate,
        String paymentChannel,
        BigDecimal amount,
        boolean onTime
) {
}
