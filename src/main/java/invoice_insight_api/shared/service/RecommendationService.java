package invoice_insight_api.shared.service;

import invoice_insight_api.corporate.dto.RecommendationResponse;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.Recommendation;
import invoice_insight_api.shared.model.TariffPackage;
import invoice_insight_api.shared.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private static final List<RecommendationStatus> VISIBLE_TO_OWNER =
            List.of(RecommendationStatus.SUGGESTED, RecommendationStatus.APPROVED);

    private final RecommendationRepository recommendationRepository;

    public List<invoice_insight_api.shared.dto.RecommendationResponse> getRecommendationsForCustomer(Long customerId) {
        return recommendationRepository
                .findByCustomer_IdAndStatusIn(customerId, VISIBLE_TO_OWNER)
                .map(this::toResponse)
                .map(List::of)
                .orElse(List.of());
    }

    public List<RecommendationResponse> getRecommendationsForOrganization(Long organizationId) {
        return recommendationRepository
                .findByOrganization_IdAndStatusIn(organizationId, VISIBLE_TO_OWNER)
                .map(this::toOrganizationResponse)
                .map(List::of)
                .orElse(List.of());
    }

    @Transactional
    public invoice_insight_api.shared.dto.RecommendationResponse approveForCustomer(Long customerId, Long recommendationId) {
        Recommendation recommendation = requireOwnedByCustomer(customerId, recommendationId);
        requireSuggested(recommendation);
        recommendation.setStatus(RecommendationStatus.APPROVED);
        recommendation.setUpdatedAt(LocalDateTime.now());
        return toResponse(recommendationRepository.save(recommendation));
    }

    @Transactional
    public invoice_insight_api.shared.dto.RecommendationResponse rejectForCustomer(Long customerId, Long recommendationId) {
        Recommendation recommendation = requireOwnedByCustomer(customerId, recommendationId);
        requireSuggested(recommendation);
        recommendation.setStatus(RecommendationStatus.REJECTED);
        recommendation.setUpdatedAt(LocalDateTime.now());
        return toResponse(recommendationRepository.save(recommendation));
    }

    @Transactional
    public RecommendationResponse approveForOrganization(Long organizationId, Long recommendationId) {
        Recommendation recommendation = requireOwnedByOrganization(organizationId, recommendationId);
        requireSuggested(recommendation);
        recommendation.setStatus(RecommendationStatus.APPROVED);
        recommendation.setUpdatedAt(LocalDateTime.now());
        return toOrganizationResponse(recommendationRepository.save(recommendation));
    }

    @Transactional
    public RecommendationResponse rejectForOrganization(Long organizationId, Long recommendationId) {
        Recommendation recommendation = requireOwnedByOrganization(organizationId, recommendationId);
        requireSuggested(recommendation);
        recommendation.setStatus(RecommendationStatus.REJECTED);
        recommendation.setUpdatedAt(LocalDateTime.now());
        return toOrganizationResponse(recommendationRepository.save(recommendation));
    }

    private Recommendation requireOwnedByCustomer(Long customerId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Öneri bulunamadı"));
        if (recommendation.getCustomer() == null || !recommendation.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Öneri bulunamadı");
        }
        return recommendation;
    }

    private Recommendation requireOwnedByOrganization(Long organizationId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Öneri bulunamadı"));
        if (recommendation.getOrganization() == null || !recommendation.getOrganization().getId().equals(organizationId)) {
            throw new ResourceNotFoundException("Öneri bulunamadı");
        }
        return recommendation;
    }

    private void requireSuggested(Recommendation recommendation) {
        if (recommendation.getStatus() != RecommendationStatus.SUGGESTED) {
            throw new IllegalStateException("Bu öneri şu anda onaylanabilir/reddedilebilir durumda değil");
        }
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
