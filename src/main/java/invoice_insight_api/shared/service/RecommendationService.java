package invoice_insight_api.shared.service;

import invoice_insight_api.corporate.dto.RecommendationResponse;
import invoice_insight_api.shared.dto.PackageResponse;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import invoice_insight_api.shared.model.*;
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
                .findBySubscription_Customer_IdAndStatusOrderByCreatedAtDesc(customerId, RecommendationStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<RecommendationResponse> getRecommendationsForOrganization(Long organizationId, RecommendationType type) {
        return recommendationRepository
                .findBySubscription_Organization_IdAndRecommendationTypeAndStatusOrderByConfidenceScoreDesc(
                        organizationId, type, RecommendationStatus.ACTIVE)
                .stream()
                .map(this::toOrganizationResponse)
                .toList();
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
                recommendation.getCreatedAt()
        );
    }

    private RecommendationResponse toOrganizationResponse(Recommendation recommendation) {
        Subscription subscription = recommendation.getSubscription();
        Customers customer = subscription.getCustomer();

        return new RecommendationResponse(
                recommendation.getId(),
                customer.getFirstName() + " " + customer.getLastName(),
                subscription.getPhoneNumber(),
                toPackageResponse(recommendation.getCurrentPackage()),
                toPackageResponse(recommendation.getSuggestedPackage()),
                recommendation.getRecommendationType().name(),
                recommendation.getReason(),
                recommendation.getExpectedSavingAmount(),
                recommendation.getConfidenceScore(),
                recommendation.getStatus().name(),
                recommendation.getCreatedAt()
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
