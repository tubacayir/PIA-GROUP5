package invoice_insight_api.shared.service;

import invoice_insight_api.shared.dto.BatchRecalculationSummary;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecommendationScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecommendationScheduler.class);

    private final RecommendationBatchService recommendationBatchService;

    @Scheduled(cron = "0 0 3 * * *")
    public void runNightlyRecalculation() {
        BatchRecalculationSummary summary = recommendationBatchService.recalculateAll();
        log.info("Nightly recommendation recalculation complete: {}", summary);
    }
}
