package invoice_insight_api.shared.model;

import invoice_insight_api.shared.enums.RecommendationStatus;
import invoice_insight_api.shared.enums.RecommendationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customers customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_package_id")
    private TariffPackage currentPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_package_id")
    private TariffPackage suggestedPackage;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false, length = 30)
    private RecommendationType recommendationType;

    @Column(name = "is_high_priority", nullable = false)
    private boolean highPriority = false;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(name = "expected_saving_amount", precision = 12, scale = 2)
    private BigDecimal expectedSavingAmount;

    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "average_usage_ratio", precision = 6, scale = 2)
    private BigDecimal averageUsageRatio;

    @Column(name = "consecutive_overage_months")
    private Integer consecutiveOverageMonths;

    @Column(name = "calculation_period_start")
    private LocalDate calculationPeriodStart;

    @Column(name = "calculation_period_end")
    private LocalDate calculationPeriodEnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationStatus status = RecommendationStatus.PENDING;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
