package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import invoice_insight_api.shared.model.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    // Upsert lookup — one Recommendation row per customer (individual) or per organization (corporate).
    Optional<Recommendation> findByCustomer_Id(Long customerId);

    Optional<Recommendation> findByOrganization_Id(Long organizationId);

    // Customer/corporate-facing read: visible once suggested (actionable) or already approved.
    Optional<Recommendation> findByCustomer_IdAndStatusIn(Long customerId, List<RecommendationStatus> statuses);

    Optional<Recommendation> findByOrganization_IdAndStatusIn(Long organizationId, List<RecommendationStatus> statuses);

    // Dashboard counter used by CorporateService.getDashboardSummary.
    long countByOrganization_IdAndStatus(Long organizationId, RecommendationStatus status);

    // Admin list with optional filters. LEFT JOIN FETCH avoids an N+1 lazy-load per row
    // (customer/organization/currentPackage/suggestedPackage) when mapping to the response DTO.
    @Query("""
            SELECT r FROM Recommendation r
            LEFT JOIN FETCH r.customer
            LEFT JOIN FETCH r.organization
            LEFT JOIN FETCH r.currentPackage
            LEFT JOIN FETCH r.suggestedPackage
            WHERE (:status IS NULL OR r.status = :status)
              AND (:type IS NULL OR r.recommendationType = :type)
              AND (:highPriorityOnly = FALSE OR r.highPriority = TRUE)
            ORDER BY r.updatedAt DESC
            """)
    List<Recommendation> findForAdmin(@Param("status") RecommendationStatus status,
                                       @Param("type") RecommendationType type,
                                       @Param("highPriorityOnly") boolean highPriorityOnly);

    // Batch recalculation entry points.
    @Query("SELECT DISTINCT s.customer.id FROM Subscription s " +
            "WHERE s.organization IS NULL AND s.status = invoice_insight_api.shared.enums.Status.ACTIVE")
    List<Long> findAllIndividualCustomerIdsWithActiveSubscriptions();

    @Query("SELECT DISTINCT s.organization.id FROM Subscription s " +
            "WHERE s.organization IS NOT NULL AND s.status = invoice_insight_api.shared.enums.Status.ACTIVE")
    List<Long> findAllOrganizationIdsWithActiveSubscriptions();
}
