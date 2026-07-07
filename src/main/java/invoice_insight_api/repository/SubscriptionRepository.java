package invoice_insight_api.repository;

import invoice_insight_api.enums.Status;
import invoice_insight_api.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByOrganization_Id(Long organizationId);

    Optional<Subscription> findByIdAndOrganization_Id(Long id, Long organizationId);

    List<Subscription> findByOrganization_IdAndCustomers_Id(Long organizationId, Long customerId);

    long countByOrganization_IdAndStatus(Long organizationId, Status status);
}
