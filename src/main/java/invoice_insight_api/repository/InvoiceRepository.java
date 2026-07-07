package invoice_insight_api.repository;

import invoice_insight_api.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findBySubscription_Customer_IdOrderByIssueDateDesc(Long customerId);

    Optional<Invoice> findByIdAndSubscription_Customer_Id(Long id, Long customerId);

    List<Invoice> findBySubscription_Organization_IdOrderByIssueDateDesc(Long organizationId);
}
