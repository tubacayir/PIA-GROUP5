package invoice_insight_api.corporate.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateSubscriptionPackageRequest(
        @NotNull Long packageId
) {
}
