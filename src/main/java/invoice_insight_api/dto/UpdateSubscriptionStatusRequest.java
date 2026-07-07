package invoice_insight_api.dto;

import invoice_insight_api.enums.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateSubscriptionStatusRequest(
        @NotNull Status status
) {
}
