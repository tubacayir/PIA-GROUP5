package invoice_insight_api.shared.config;

import java.math.BigDecimal;

public final class RecommendationThresholds {

    private RecommendationThresholds() {
    }

    public static final int EVALUATION_WINDOW_MONTHS = 6;
    public static final BigDecimal UPGRADE_THRESHOLD_RATIO = new BigDecimal("0.90");
    public static final BigDecimal DOWNGRADE_THRESHOLD_RATIO = new BigDecimal("0.40");
    public static final int HIGH_PRIORITY_CONSECUTIVE_OVERAGE_MONTHS = 6;
    public static final BigDecimal OVERAGE_RATIO_THRESHOLD = new BigDecimal("1.00");
}
