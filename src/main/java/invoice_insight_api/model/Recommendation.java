package invoice_insight_api.model;

import invoice_insight_api.enums.RecommendationStatus;
import invoice_insight_api.enums.RecommendationType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "current_package_id", nullable = false)
    private TariffPackage currentPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_package_id")
    private TariffPackage suggestedPackage;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_type", nullable = false, length = 30)
    private RecommendationType recommendationType;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(name = "expected_saving_amount", precision = 12, scale = 2)
    private BigDecimal expectedSavingAmount;

    @Column(name = "confidence_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationStatus status = RecommendationStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}