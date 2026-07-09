package invoice_insight_api.shared.service;

import invoice_insight_api.shared.config.RecommendationThresholds;
import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import invoice_insight_api.shared.enums.Status;
import invoice_insight_api.shared.exception.ResourceNotFoundException;
import invoice_insight_api.shared.model.*;
import invoice_insight_api.shared.repository.CustomerRepository;
import invoice_insight_api.shared.repository.OrganizationRepository;
import invoice_insight_api.shared.repository.RecommendationRepository;
import invoice_insight_api.shared.repository.SubscriptionRepository;
import invoice_insight_api.shared.repository.TariffPackageRepository;
import invoice_insight_api.shared.repository.UsageSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecommendationCalculationService {

    private final RecommendationRepository recommendationRepository;
    private final UsageSummaryRepository usageSummaryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TariffPackageRepository tariffPackageRepository;
    private final CustomerRepository customerRepository;
    private final OrganizationRepository organizationRepository;

    public Recommendation recalculateForCustomer(Long customerId) {
        Subscription subscription = subscriptionRepository.findByCustomer_Id(customerId).stream()
                .filter(s -> s.getStatus() == Status.ACTIVE)
                .findFirst()
                .orElse(null);
        if (subscription == null) {
            return null;
        }

        TariffPackage currentPackage = subscription.getTariffPackage();
        List<UsageSummary> window = usageSummaryRepository
                .findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(subscription.getId()).stream()
                .limit(RecommendationThresholds.EVALUATION_WINDOW_MONTHS)
                .toList();
        if (window.isEmpty()) {
            return null;
        }

        List<BigDecimal> ratios = window.stream()
                .map(usage -> monthlyRatio(usage, currentPackage))
                .toList();

        BigDecimal averageRatio = average(ratios);
        int consecutiveOverageMonths = countConsecutiveOverage(ratios);
        boolean fullWindow = window.size() >= RecommendationThresholds.EVALUATION_WINDOW_MONTHS;

        boolean highPriority = fullWindow && consecutiveOverageMonths >= RecommendationThresholds.HIGH_PRIORITY_CONSECUTIVE_OVERAGE_MONTHS;
        RecommendationType type = highPriority ? RecommendationType.UPGRADE : classify(averageRatio);

        TariffPackage suggestedPackage = suggestPackage(currentPackage, type);
        BigDecimal expectedSaving = expectedSaving(currentPackage, suggestedPackage, type, 1);
        String reason = buildIndividualReason(type, highPriority, averageRatio, suggestedPackage);
        BigDecimal confidence = confidenceScore(window.size(), ratios);

        Customers customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Müşteri bulunamadı"));

        Recommendation recommendation = recommendationRepository.findByCustomer_Id(customerId)
                .orElseGet(Recommendation::new);

        LocalDateTime now = LocalDateTime.now();
        if (recommendation.getId() == null) {
            recommendation.setCreatedAt(now);
        }

        recommendation.setCustomer(customer);
        recommendation.setOrganization(null);
        recommendation.setSubscription(subscription);
        recommendation.setCurrentPackage(currentPackage);
        recommendation.setSuggestedPackage(suggestedPackage);
        recommendation.setRecommendationType(type);
        recommendation.setHighPriority(highPriority);
        recommendation.setReason(reason);
        recommendation.setExpectedSavingAmount(expectedSaving);
        recommendation.setConfidenceScore(confidence);
        recommendation.setAverageUsageRatio(percentage(averageRatio));
        recommendation.setConsecutiveOverageMonths(consecutiveOverageMonths);
        recommendation.setCalculationPeriodStart(periodStart(window));
        recommendation.setCalculationPeriodEnd(periodEnd(window));
        recommendation.setStatus(RecommendationStatus.PENDING);
        recommendation.setReviewedBy(null);
        recommendation.setReviewedAt(null);
        recommendation.setUpdatedAt(now);

        return recommendationRepository.save(recommendation);
    }

    public Recommendation recalculateForOrganization(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organizasyon bulunamadı"));

        TariffPackage corporatePackage = organization.getCorporatePackage();
        if (corporatePackage == null) {
            return null;
        }

        List<Subscription> subscriptions = subscriptionRepository.findByOrganization_Id(organizationId).stream()
                .filter(s -> s.getStatus() == Status.ACTIVE)
                .toList();
        if (subscriptions.isEmpty()) {
            return null;
        }

        record LineMonth(int periodKey, BigDecimal ratio) {
        }

        List<LineMonth> pool = new ArrayList<>();
        for (Subscription subscription : subscriptions) {
            List<UsageSummary> lineWindow = usageSummaryRepository
                    .findBySubscription_IdOrderByUsageYearDescUsageMonthDesc(subscription.getId()).stream()
                    .limit(RecommendationThresholds.EVALUATION_WINDOW_MONTHS)
                    .toList();
            for (UsageSummary usage : lineWindow) {
                BigDecimal ratio = monthlyRatio(usage, corporatePackage);
                pool.add(new LineMonth(usage.getUsageYear() * 100 + usage.getUsageMonth(), ratio));
            }
        }
        if (pool.isEmpty()) {
            return null;
        }

        BigDecimal averageRatio = average(pool.stream().map(LineMonth::ratio).toList());

        Map<Integer, List<BigDecimal>> ratiosByPeriod = pool.stream()
                .collect(Collectors.groupingBy(LineMonth::periodKey,
                        Collectors.mapping(LineMonth::ratio, Collectors.toList())));

        List<Integer> periodsDesc = ratiosByPeriod.keySet().stream()
                .sorted(Comparator.reverseOrder())
                .toList();

        int consecutiveOverageMonths = 0;
        for (Integer period : periodsDesc) {
            BigDecimal periodAverage = average(ratiosByPeriod.get(period));
            if (periodAverage.compareTo(RecommendationThresholds.OVERAGE_RATIO_THRESHOLD) > 0) {
                consecutiveOverageMonths++;
            } else {
                break;
            }
        }
        boolean fullWindow = periodsDesc.size() >= RecommendationThresholds.EVALUATION_WINDOW_MONTHS;

        boolean highPriority = fullWindow && consecutiveOverageMonths >= RecommendationThresholds.HIGH_PRIORITY_CONSECUTIVE_OVERAGE_MONTHS;
        RecommendationType type = highPriority ? RecommendationType.UPGRADE : classify(averageRatio);

        TariffPackage suggestedPackage = suggestPackage(corporatePackage, type);
        BigDecimal expectedSaving = expectedSaving(corporatePackage, suggestedPackage, type, subscriptions.size());
        String reason = buildOrganizationReason(type, highPriority, averageRatio, suggestedPackage);
        BigDecimal confidence = confidenceScore(periodsDesc.size(), pool.stream().map(LineMonth::ratio).toList());

        Recommendation recommendation = recommendationRepository.findByOrganization_Id(organizationId)
                .orElseGet(Recommendation::new);

        LocalDateTime now = LocalDateTime.now();
        if (recommendation.getId() == null) {
            recommendation.setCreatedAt(now);
        }

        recommendation.setCustomer(null);
        recommendation.setOrganization(organization);
        recommendation.setSubscription(null);
        recommendation.setCurrentPackage(corporatePackage);
        recommendation.setSuggestedPackage(suggestedPackage);
        recommendation.setRecommendationType(type);
        recommendation.setHighPriority(highPriority);
        recommendation.setReason(reason);
        recommendation.setExpectedSavingAmount(expectedSaving);
        recommendation.setConfidenceScore(confidence);
        recommendation.setAverageUsageRatio(percentage(averageRatio));
        recommendation.setConsecutiveOverageMonths(consecutiveOverageMonths);
        recommendation.setCalculationPeriodStart(periodKeyToDate(periodsDesc.get(periodsDesc.size() - 1)));
        recommendation.setCalculationPeriodEnd(periodKeyToDate(periodsDesc.get(0)));
        recommendation.setStatus(RecommendationStatus.PENDING);
        recommendation.setReviewedBy(null);
        recommendation.setReviewedAt(null);
        recommendation.setUpdatedAt(now);

        return recommendationRepository.save(recommendation);
    }

    private RecommendationType classify(BigDecimal averageRatio) {
        if (averageRatio.compareTo(RecommendationThresholds.UPGRADE_THRESHOLD_RATIO) > 0) {
            return RecommendationType.UPGRADE;
        }
        if (averageRatio.compareTo(RecommendationThresholds.DOWNGRADE_THRESHOLD_RATIO) < 0) {
            return RecommendationType.DOWNGRADE;
        }
        return RecommendationType.NO_CHANGE;
    }

    private BigDecimal monthlyRatio(UsageSummary usage, TariffPackage tariffPackage) {
        BigDecimal internetRatio = usage.getUsedInternetGb()
                .divide(tariffPackage.getInternetLimitGb(), 4, RoundingMode.HALF_UP);
        BigDecimal minuteRatio = BigDecimal.valueOf(usage.getUsedMinutes())
                .divide(BigDecimal.valueOf(tariffPackage.getMinuteLimit()), 4, RoundingMode.HALF_UP);
        BigDecimal smsRatio = BigDecimal.valueOf(usage.getUsedSms())
                .divide(BigDecimal.valueOf(tariffPackage.getSmsLimit()), 4, RoundingMode.HALF_UP);

        return internetRatio.max(minuteRatio).max(smsRatio);
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
    }

    private int countConsecutiveOverage(List<BigDecimal> ratiosMostRecentFirst) {
        int count = 0;
        for (BigDecimal ratio : ratiosMostRecentFirst) {
            if (ratio.compareTo(RecommendationThresholds.OVERAGE_RATIO_THRESHOLD) > 0) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    private TariffPackage suggestPackage(TariffPackage current, RecommendationType type) {
        if (type == RecommendationType.NO_CHANGE) {
            return null;
        }

        List<TariffPackage> ordered = tariffPackageRepository.findByStatusOrderByInternetLimitGbAsc(Status.ACTIVE);

        if (type == RecommendationType.UPGRADE) {
            return ordered.stream()
                    .filter(p -> p.getInternetLimitGb().compareTo(current.getInternetLimitGb()) > 0)
                    .findFirst()
                    .orElse(null);
        }

        TariffPackage best = null;
        for (TariffPackage p : ordered) {
            if (p.getInternetLimitGb().compareTo(current.getInternetLimitGb()) < 0) {
                best = p;
            } else {
                break;
            }
        }
        return best;
    }

    private BigDecimal expectedSaving(TariffPackage current, TariffPackage suggested, RecommendationType type, int multiplier) {
        if (type != RecommendationType.DOWNGRADE || suggested == null) {
            return null;
        }
        BigDecimal currentFee = current.getMonthlyFee() == null ? BigDecimal.ZERO : current.getMonthlyFee();
        BigDecimal suggestedFee = suggested.getMonthlyFee() == null ? BigDecimal.ZERO : suggested.getMonthlyFee();
        BigDecimal saving = currentFee.subtract(suggestedFee);
        if (saving.compareTo(BigDecimal.ZERO) < 0) {
            saving = BigDecimal.ZERO;
        }
        return saving.multiply(BigDecimal.valueOf(multiplier));
    }

    private BigDecimal confidenceScore(int dataPoints, List<BigDecimal> ratios) {
        double completeness = Math.min(1.0, dataPoints / (double) RecommendationThresholds.EVALUATION_WINDOW_MONTHS);
        BigDecimal base = BigDecimal.valueOf(completeness);

        BigDecimal max = ratios.stream().max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal min = ratios.stream().min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO);
        BigDecimal spread = max.subtract(min);
        BigDecimal penalty = spread.compareTo(new BigDecimal("0.5")) > 0 ? new BigDecimal("0.2") : BigDecimal.ZERO;

        BigDecimal score = base.subtract(penalty);
        if (score.compareTo(BigDecimal.ZERO) < 0) {
            score = BigDecimal.ZERO;
        }
        return score.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal percentage(BigDecimal ratio) {
        return ratio.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
    }

    private LocalDate periodStart(List<UsageSummary> windowMostRecentFirst) {
        UsageSummary oldest = windowMostRecentFirst.get(windowMostRecentFirst.size() - 1);
        return LocalDate.of(oldest.getUsageYear(), oldest.getUsageMonth(), 1);
    }

    private LocalDate periodEnd(List<UsageSummary> windowMostRecentFirst) {
        UsageSummary mostRecent = windowMostRecentFirst.get(0);
        return LocalDate.of(mostRecent.getUsageYear(), mostRecent.getUsageMonth(), 1);
    }

    private LocalDate periodKeyToDate(int periodKey) {
        return LocalDate.of(periodKey / 100, periodKey % 100, 1);
    }

    private String buildIndividualReason(RecommendationType type, boolean highPriority, BigDecimal averageRatio, TariffPackage suggested) {
        int percent = percentage(averageRatio).setScale(0, RoundingMode.HALF_UP).intValue();

        if (highPriority) {
            return suggested != null
                    ? "Son 6 ayda her ay paket limiti aşıldı (ortalama kullanım %" + percent + "); acil yükseltme öneriliyor: " + suggested.getPackageName() + " paketine geçiş önerilir."
                    : "Son 6 ayda her ay paket limiti aşıldı (ortalama kullanım %" + percent + "); acil yükseltme öneriliyor, ancak daha üst bir paket bulunamadı.";
        }

        return switch (type) {
            case UPGRADE -> suggested != null
                    ? "Son 6 ayda ortalama kullanım paket limitinin %" + percent + "'ine ulaştı; " + suggested.getPackageName() + " paketine geçiş önerilir."
                    : "Son 6 ayda ortalama kullanım paket limitinin %" + percent + "'ine ulaştı, ancak daha üst bir paket bulunamadı.";
            case DOWNGRADE -> suggested != null
                    ? "Son 6 ayda ortalama kullanım paket limitinin sadece %" + percent + "'i kadar; " + suggested.getPackageName() + " paketine geçerek tasarruf sağlanabilir."
                    : "Son 6 ayda ortalama kullanım paket limitinin sadece %" + percent + "'i kadar, ancak daha alt bir paket bulunamadı.";
            case NO_CHANGE -> "Son 6 ayda ortalama kullanım paket limitinin %" + percent + "'i seviyesinde, mevcut paket uygun.";
        };
    }

    private String buildOrganizationReason(RecommendationType type, boolean highPriority, BigDecimal averageRatio, TariffPackage suggested) {
        int percent = percentage(averageRatio).setScale(0, RoundingMode.HALF_UP).intValue();

        if (highPriority) {
            return suggested != null
                    ? "Şirket genelinde son 6 ayda her ay paket limiti aşıldı (ortalama kullanım %" + percent + "); acil yükseltme öneriliyor: " + suggested.getPackageName() + " paketine geçiş önerilir."
                    : "Şirket genelinde son 6 ayda her ay paket limiti aşıldı (ortalama kullanım %" + percent + "); acil yükseltme öneriliyor, ancak daha üst bir paket bulunamadı.";
        }

        return switch (type) {
            case UPGRADE -> suggested != null
                    ? "Şirket genelinde son 6 ayda ortalama kullanım paket limitinin %" + percent + "'ine ulaştı; " + suggested.getPackageName() + " paketine geçiş önerilir."
                    : "Şirket genelinde son 6 ayda ortalama kullanım paket limitinin %" + percent + "'ine ulaştı, ancak daha üst bir paket bulunamadı.";
            case DOWNGRADE -> suggested != null
                    ? "Şirket genelinde son 6 ayda ortalama kullanım paket limitinin sadece %" + percent + "'i kadar; " + suggested.getPackageName() + " paketine geçerek tasarruf sağlanabilir."
                    : "Şirket genelinde son 6 ayda ortalama kullanım paket limitinin sadece %" + percent + "'i kadar, ancak daha alt bir paket bulunamadı.";
            case NO_CHANGE -> "Şirket genelinde son 6 ayda ortalama kullanım paket limitinin %" + percent + "'i seviyesinde, mevcut paket uygun.";
        };
    }
}
