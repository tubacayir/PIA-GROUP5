package invoice_insight_api.admin.service;

import invoice_insight_api.admin.dto.AdminRecommendationResponse;
import invoice_insight_api.shared.dto.BatchRecalculationSummary;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.Recommendation;
import invoice_insight_api.shared.model.TariffPackage;
import invoice_insight_api.shared.repository.RecommendationRepository;
import invoice_insight_api.shared.service.RecommendationBatchService;
import invoice_insight_api.shared.service.RecommendationCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminRecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationCalculationService recommendationCalculationService;
    private final RecommendationBatchService recommendationBatchService;

    public List<AdminRecommendationResponse> getRecommendations(RecommendationStatus status, RecommendationType type, boolean highPriorityOnly) {
        return recommendationRepository.findForAdmin(status, type, highPriorityOnly).stream()
                .map(this::toResponse)
                .toList();
    }

    public AdminRecommendationResponse getRecommendation(Long id) {
        return toResponse(requireRecommendation(id));
    }

    @Transactional
    public AdminRecommendationResponse approve(Long id, Long adminId) {
        Recommendation recommendation = requireRecommendation(id);
        recommendation.setStatus(RecommendationStatus.APPROVED);
        recommendation.setReviewedBy(adminId);
        recommendation.setReviewedAt(LocalDateTime.now());
        return toResponse(recommendationRepository.save(recommendation));
    }

    @Transactional
    public AdminRecommendationResponse reject(Long id, Long adminId) {
        Recommendation recommendation = requireRecommendation(id);
        recommendation.setStatus(RecommendationStatus.REJECTED);
        recommendation.setReviewedBy(adminId);
        recommendation.setReviewedAt(LocalDateTime.now());
        return toResponse(recommendationRepository.save(recommendation));
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BatchRecalculationSummary recalculateAll() {
        // Deliberately runs without an ambient transaction (the class-level readOnly=true
        // would otherwise propagate down and make every per-customer/organization insert
        // fail with "cannot execute INSERT in a read-only transaction"). Each call inside
        // RecommendationBatchService.recalculateAll() opens and commits its own transaction.
        return recommendationBatchService.recalculateAll();
    }

    @Transactional
    public AdminRecommendationResponse recalculateCustomer(Long customerId) {
        Recommendation recommendation = recommendationCalculationService.recalculateForCustomer(customerId);
        if (recommendation == null) {
            throw new ResourceNotFoundException("Bu müşteri için hesaplama yapılamadı (aktif abonelik veya kullanım verisi yok)");
        }
        return toResponse(recommendation);
    }

    @Transactional
    public AdminRecommendationResponse recalculateOrganization(Long organizationId) {
        Recommendation recommendation = recommendationCalculationService.recalculateForOrganization(organizationId);
        if (recommendation == null) {
            throw new ResourceNotFoundException("Bu organizasyon için hesaplama yapılamadı (kurumsal paket atanmamış veya kullanım verisi yok)");
        }
        return toResponse(recommendation);
    }

    private Recommendation requireRecommendation(Long id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Öneri bulunamadı"));
    }

    private AdminRecommendationResponse toResponse(Recommendation recommendation) {
        String customerName = recommendation.getCustomer() != null
                ? recommendation.getCustomer().getFirstName() + " " + recommendation.getCustomer().getLastName()
                : null;
        String organizationName = recommendation.getOrganization() != null
                ? recommendation.getOrganization().getName()
                : null;

        return new AdminRecommendationResponse(
                recommendation.getId(),
                customerName,
                organizationName,
                toPackageResponse(recommendation.getCurrentPackage()),
                toPackageResponse(recommendation.getSuggestedPackage()),
                recommendation.getRecommendationType().name(),
                recommendation.isHighPriority(),
                recommendation.getAverageUsageRatio(),
                recommendation.getConsecutiveOverageMonths(),
                recommendation.getReason(),
                recommendation.getExpectedSavingAmount(),
                recommendation.getConfidenceScore(),
                recommendation.getStatus().name(),
                recommendation.getCalculationPeriodStart(),
                recommendation.getCalculationPeriodEnd(),
                recommendation.getReviewedBy(),
                recommendation.getReviewedAt(),
                recommendation.getCreatedAt(),
                recommendation.getUpdatedAt()
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
