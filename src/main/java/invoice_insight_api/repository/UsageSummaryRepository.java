package invoice_insight_api.repository;

import invoice_insight_api.model.UsageSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UsageSummaryRepository extends JpaRepository<UsageSummary, Long> {

    List<UsageSummary> findBySubscription_Organization_Id(Long organizationId);

    List<UsageSummary> findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(Long subscriptionId);
}
