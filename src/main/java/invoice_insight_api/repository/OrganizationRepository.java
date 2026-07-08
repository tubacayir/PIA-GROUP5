package invoice_insight_api.repository;

import invoice_insight_api.enums.Status;
import invoice_insight_api.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findByTaxIdentityNumber(String taxIdentityNumber);

    List<Organization> findByStatusNot(Status status);
}
