package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import invoice_insight_api.shared.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    long countBySubscription_Organization_IdAndStatus(Long organizationId, RecommendationStatus status);

    List<Recommendation> findBySubscription_Customers_IdAndStatusOrderByCreatedAtDesc(Long customerId, RecommendationStatus status);

    List<Recommendation> findBySubscription_Organization_IdAndRecommendationTypeAndStatusOrderByConfidenceScoreDesc(
            Long organizationId, RecommendationType recommendationType, RecommendationStatus status);
}
