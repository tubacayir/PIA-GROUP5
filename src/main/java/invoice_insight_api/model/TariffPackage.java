package invoice_insight_api.model;

import invoice_insight_api.enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "packages")

@Getter
@Setter
@NoArgsConstructor
public class TariffPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "package_code", nullable = false, unique = true, length = 20)
    private String packageCode;

    @Column(name = "package_name")
    private String packageName;

    @Column(name = "description")
    private String description;

    @Column(name = "internet_limit_gb", nullable = false, precision = 10, scale = 2)
    private BigDecimal internetLimitGb;

    @Column(name = "minute_limit", nullable = false)
    private Integer minuteLimit;

    @Column(name = "sms_limit", nullable = false)
    private Integer smsLimit;

    @Column(name = "monthly_fee")
    private BigDecimal monthlyFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}