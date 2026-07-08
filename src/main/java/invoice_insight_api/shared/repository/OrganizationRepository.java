package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findByTaxIdentityNumber(String taxIdentityNumber);

    List<Organization> findByStatusNot(Status status);
}
