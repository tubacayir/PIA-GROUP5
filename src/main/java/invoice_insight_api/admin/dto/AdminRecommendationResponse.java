package invoice_insight_api.admin.dto;

import invoice_insight_api.shared.dto.PackageResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminRecommendationResponse(
        Long id,
        String customerName,
        String organizationName,
        PackageResponse currentPackage,
        PackageResponse suggestedPackage,
        String recommendationType,
        boolean isHighPriority,
        BigDecimal averageUsageRatio,
        Integer consecutiveOverageMonths,
        String reason,
        BigDecimal expectedSavingAmount,
        BigDecimal confidenceScore,
        String status,
        LocalDate calculationPeriodStart,
        LocalDate calculationPeriodEnd,
        Long reviewedBy,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
