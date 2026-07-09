package invoice_insight_api.shared.service;

import invoice_insight_api.corporate.dto.RecommendationResponse;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.model.Recommendation;
import invoice_insight_api.shared.model.TariffPackage;
import invoice_insight_api.shared.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    public List<invoice_insight_api.shared.dto.RecommendationResponse> getRecommendationsForCustomer(Long customerId) {
        return recommendationRepository
                .findByCustomer_IdAndStatus(customerId, RecommendationStatus.APPROVED)
                .map(this::toResponse)
                .map(List::of)
                .orElse(List.of());
    }

    public List<RecommendationResponse> getRecommendationsForOrganization(Long organizationId) {
        return recommendationRepository
                .findByOrganization_IdAndStatus(organizationId, RecommendationStatus.APPROVED)
                .map(this::toOrganizationResponse)
                .map(List::of)
                .orElse(List.of());
    }

    private invoice_insight_api.shared.dto.RecommendationResponse toResponse(Recommendation recommendation) {
        return new invoice_insight_api.shared.dto.RecommendationResponse(
                recommendation.getId(),
                toPackageResponse(recommendation.getCurrentPackage()),
                toPackageResponse(recommendation.getSuggestedPackage()),
                recommendation.getRecommendationType().name(),
                recommendation.getReason(),
                recommendation.getExpectedSavingAmount(),
                recommendation.getConfidenceScore(),
                recommendation.getStatus().name(),
                recommendation.getCreatedAt(),
                recommendation.isHighPriority(),
                recommendation.getAverageUsageRatio()
        );
    }

    private RecommendationResponse toOrganizationResponse(Recommendation recommendation) {
        return new RecommendationResponse(
                recommendation.getId(),
                toPackageResponse(recommendation.getCurrentPackage()),
                toPackageResponse(recommendation.getSuggestedPackage()),
                recommendation.getRecommendationType().name(),
                recommendation.getReason(),
                recommendation.getExpectedSavingAmount(),
                recommendation.getConfidenceScore(),
                recommendation.getStatus().name(),
                recommendation.getCreatedAt(),
                recommendation.isHighPriority(),
                recommendation.getAverageUsageRatio()
        );
    }

    private PackageResponse toPackageResponse(TariffPackage tariffPackage) {
        if (tariffPackage == null) {
            return null;
        }

        return new PackageResponse(
                tariffPackage.getId(),
                tariffPackage.getPackageCode(),
                tariffPackage.getPackageName(),
                tariffPackage.getInternetLimitGb(),
                tariffPackage.getMinuteLimit(),
                tariffPackage.getSmsLimit(),
                tariffPackage.getMonthlyFee()
        );
    }
}
