package invoice_insight_api.repository;

import invoice_insight_api.enums.RecommendationStatus;
import invoice_insight_api.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    long countBySubscription_Organization_IdAndStatus(Long organizationId, RecommendationStatus status);
}
