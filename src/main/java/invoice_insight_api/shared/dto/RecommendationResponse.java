package invoice_insight_api.shared.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecommendationResponse(
        Long id,
        PackageResponse currentPackage,
        PackageResponse suggestedPackage,
        String recommendationType,
        String reason,
        BigDecimal expectedSavingAmount,
        BigDecimal confidenceScore,
        String status,
        LocalDateTime createdAt,
        boolean isHighPriority,
        BigDecimal averageUsageRatio
) {
}
