package invoice_insight_api.shared.service;

import invoice_insight_api.shared.dto.BatchRecalculationSummary;
import invoice_insight_api.shared.model.Recommendation;
import invoice_insight_api.shared.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Orchestrates recalculation across every customer/organization. Deliberately NOT
 * {@code @Transactional} itself, and calls {@link RecommendationCalculationService} through its
 * injected (proxied) bean reference rather than self-invocation, so each customer/organization
 * commits in its own transaction — a failure or client timeout partway through a batch of
 * thousands does not roll back work already done for earlier records.
 */
@Service
@RequiredArgsConstructor
public class RecommendationBatchService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationBatchService.class);

    private final RecommendationRepository recommendationRepository;
    private final RecommendationCalculationService recommendationCalculationService;

    public BatchRecalculationSummary recalculateAll() {
        int customersProcessed = 0;
        int organizationsProcessed = 0;
        int upgraded = 0;
        int downgraded = 0;
        int noChange = 0;
        int highPriority = 0;

        for (Long customerId : recommendationRepository.findAllIndividualCustomerIdsWithActiveSubscriptions()) {
            try {
                Recommendation result = recommendationCalculationService.recalculateForCustomer(customerId);
                if (result != null) {
                    customersProcessed++;
                    if (result.isHighPriority()) {
                        highPriority++;
                    }
                    switch (result.getRecommendationType()) {
                        case UPGRADE -> upgraded++;
                        case DOWNGRADE -> downgraded++;
                        case NO_CHANGE -> noChange++;
                    }
                }
            } catch (Exception e) {
                log.warn("Recommendation recalculation failed for customer {}", customerId, e);
            }
        }

        for (Long organizationId : recommendationRepository.findAllOrganizationIdsWithActiveSubscriptions()) {
            try {
                Recommendation result = recommendationCalculationService.recalculateForOrganization(organizationId);
                if (result != null) {
                    organizationsProcessed++;
                    if (result.isHighPriority()) {
                        highPriority++;
                    }
                    switch (result.getRecommendationType()) {
                        case UPGRADE -> upgraded++;
                        case DOWNGRADE -> downgraded++;
                        case NO_CHANGE -> noChange++;
                    }
                }
            } catch (Exception e) {
                log.warn("Recommendation recalculation failed for organization {}", organizationId, e);
            }
        }

        return new BatchRecalculationSummary(customersProcessed, organizationsProcessed, upgraded, downgraded, noChange, highPriority);
    }
}
