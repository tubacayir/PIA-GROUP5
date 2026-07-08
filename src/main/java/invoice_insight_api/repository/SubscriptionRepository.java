package invoice_insight_api.repository;

import invoice_insight_api.enums.Status;
import invoice_insight_api.enums.SubscriptionType;
import invoice_insight_api.model.Subscription;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByOrganization_Id(Long organizationId);

    Optional<Subscription> findByIdAndOrganization_Id(Long id, Long organizationId);

    List<Subscription> findByOrganization_IdAndCustomers_Id(Long organizationId, Long customerId);

    List<Subscription> findByCustomers_Id(Long customerId);

    long countByOrganization_IdAndStatus(Long organizationId, Status status);

    long countBySubscriptionType(SubscriptionType subscriptionType);

    long countByCustomers_Id(Long customerId);

    @Query("SELECT s.subscriptionType, COUNT(s) FROM Subscription s GROUP BY s.subscriptionType")
    List<Object[]> countBySubscriptionTypeGrouped();

    @Query("SELECT s.tariffPackage.id, s.tariffPackage.packageName, COUNT(s) FROM Subscription s " +
            "GROUP BY s.tariffPackage.id, s.tariffPackage.packageName ORDER BY COUNT(s) DESC")
    List<Object[]> countBySubscriptionsGroupedByPackage(Pageable pageable);
}
