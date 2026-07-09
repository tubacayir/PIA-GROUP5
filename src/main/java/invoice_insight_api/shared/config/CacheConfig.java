package invoice_insight_api.shared.config;

import com.github.benmanes.caffeine.cache
        .Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class CacheConfig {

    // Admin dashboard/analytics data (AdminDashboardService) is expensive to compute
    // (a dozen-plus aggregate queries over the full customer/invoice/subscription tables)
    // but tolerates a little staleness. Short TTL bounds staleness; explicit @CacheEvict
    // calls on the customer/organization write paths keep it fresh on the writes that matter.
    public static final String ADMIN_DASHBOARD_SUMMARY_CACHE = "adminDashboardSummary";
    public static final String ADMIN_DASHBOARD_CHARTS_CACHE = "adminDashboardCharts";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                ADMIN_DASHBOARD_SUMMARY_CACHE,
                ADMIN_DASHBOARD_CHARTS_CACHE
        );
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .maximumSize(10));
        return cacheManager;
    }
}
