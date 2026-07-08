package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.model.Customers;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customers, Long> {

    Optional<Customers> findByTcIdentityNumber(String tcIdentityNumber);

    Optional<Customers> findByEmail(String email);

    Optional<Customers> findByPhoneNumber(String phoneNumber);

    @Query("SELECT DISTINCT s.customers FROM Subscription s WHERE s.organization.id = :organizationId")
    List<Customers> findByOrganizationId(@Param("organizationId") Long organizationId);

    List<Customers> findByStatusNot(Status status);

    long countByStatusNot(Status status);

    @Query("SELECT c.city, COUNT(c) FROM Customers c WHERE c.status <> invoice_insight_api.shared.enums.Status.DELETED " +
            "GROUP BY c.city ORDER BY COUNT(c) DESC")
    List<Object[]> countGroupedByCity(Pageable pageable);

    @Query("SELECT c.gender, COUNT(c) FROM Customers c WHERE c.status <> invoice_insight_api.shared.enums.Status.DELETED " +
            "GROUP BY c.gender")
    List<Object[]> countGroupedByGender();

    @Query("SELECT c.birthDate FROM Customers c WHERE c.status <> invoice_insight_api.shared.enums.Status.DELETED")
    List<LocalDate> findAllBirthDates();
}