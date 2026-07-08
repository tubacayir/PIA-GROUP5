package invoice_insight_api.corporate.dto;

import invoice_insight_api.shared.enums.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateSubscriptionStatusRequest(
        @NotNull Status status
) {
}
