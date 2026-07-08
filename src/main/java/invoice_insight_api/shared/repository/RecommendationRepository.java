package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    long countBySubscription_Organization_IdAndStatus(Long organizationId, RecommendationStatus status);
}
