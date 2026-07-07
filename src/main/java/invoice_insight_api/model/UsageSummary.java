package invoice_insight_api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_summaries")
@Getter
@Setter
@NoArgsConstructor
public class UsageSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "usage_month")
    private Integer usageMonth;

    @Column(name = "usage_year")
    private Integer usageYear;

    @Column(name = "used_internet_gb", nullable = false)
    private BigDecimal usedInternetGb;

    @Column(name = "used_minutes", nullable = false)
    private Integer usedMinutes;

    @Column(name = "used_sms", nullable = false)
    private Integer usedSms;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}