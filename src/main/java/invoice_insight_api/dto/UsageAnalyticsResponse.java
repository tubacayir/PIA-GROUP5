package invoice_insight_api.dto;

import java.util.List;

public record UsageAnalyticsResponse(
        List<UsageRankingItem> highestInternetConsumers,
        List<UsageRankingItem> highestVoiceConsumers,
        List<UsageRankingItem> highestSmsConsumers,
        List<UsageRankingItem> exceedingLimits,
        List<UsageRankingItem> underutilized
) {
}
