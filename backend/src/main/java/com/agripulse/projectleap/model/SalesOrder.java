package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false, length = 32)
    private String orderNumber; // e.g. SO-IRR-8921

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_farmer_id", nullable = false)
    private Contact customer;

    @Column(name = "service_description", columnDefinition = "TEXT")
    private String serviceDescription; // e.g. "Automated Emergency Root Recovery Pulse 45m"

    @Column(name = "sector_name", nullable = false)
    private String sectorName; // e.g. "Sector 4-B (Corn V8 Stage)"

    @Column(name = "water_volume_gallons")
    private Integer waterVolumeGallons; // e.g. 18,500

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalesOrderStatus status;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @PrePersist
    protected void onCreate() {
        if (dispatchedAt == null) dispatchedAt = LocalDateTime.now();
    }

    public enum SalesOrderStatus {
        BOOKED,
        DISPATCHED,
        INVOICED,
        SETTLED
    }
}

