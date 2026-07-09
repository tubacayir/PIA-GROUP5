package invoice_insight_api.shared.repository;

import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.model.TariffPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TariffPackageRepository extends JpaRepository<TariffPackage, Long> {

    List<TariffPackage> findByStatus(Status status);

    List<TariffPackage> findByStatusOrderByInternetLimitGbAsc(Status status);
}
