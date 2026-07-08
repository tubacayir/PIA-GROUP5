package invoice_insight_api.corporate.dto;

import invoice_insight_api.shared.dto.PackageResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecommendationResponse(
        Long id,
        String employeeName,
        String phoneNumber,
        PackageResponse currentPackage,
        PackageResponse suggestedPackage,
        String recommendationType,
        String reason,
        BigDecimal expectedSavingAmount,
        BigDecimal confidenceScore,
        String status,
        LocalDateTime createdAt
) {
}
