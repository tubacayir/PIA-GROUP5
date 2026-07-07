package invoice_insight_api.model;

import invoice_insight_api.enums.Status;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true,name = "taxIdentity_number", nullable = false,length = 10)
    private String taxIdentityNumber;
    @Column(name = "name")
    private String name;

    @Column(nullable = false)
    private String password;

    @Column(name = "sector")
    private String sector;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "city")
    private String city;

    @Enumerated(EnumType.STRING)
    private Status status;


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;






}
