package invoice_insight_api.repository;

import invoice_insight_api.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByTcIdentityNumber(String tcIdentityNumber);

    @Query("SELECT DISTINCT s.customer FROM Subscription s WHERE s.organization.id = :organizationId")
    List<Customer> findByOrganizationId(@Param("organizationId") Long organizationId);
}