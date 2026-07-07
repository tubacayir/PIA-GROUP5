package invoice_insight_api.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateSubscriptionPackageRequest(
        @NotNull Long packageId
) {
}
