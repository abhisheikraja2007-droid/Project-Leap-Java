package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_number", unique = true, nullable = false, length = 32)
    private String poNumber; // e.g. PO-2025-0841

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Contact vendor;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "delivery_required_date")
    private LocalDate deliveryRequiredDate;

    @Column(name = "analytic_cost_center")
    private String analyticCostCenter; // e.g. Sector 4-B Irrigation Upgrade

    @Column(columnDefinition = "TEXT")
    private String specification;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private POStatus status;

    @Column(name = "payment_terms")
    private String paymentTerms; // Net 30, Due on Receipt

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (orderDate == null) orderDate = LocalDate.now();
    }

    public enum POStatus {
        DRAFT,
        APPROVED,
        DISPATCHED,
        BILL_READY,
        PAID_AND_RECEIVED
    }
}
