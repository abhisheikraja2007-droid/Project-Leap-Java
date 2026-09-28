package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_reference", unique = true, nullable = false, length = 64)
    private String paymentReference; // e.g. "ACH-99214-WELLSFARGO"

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_direction", nullable = false)
    private PaymentDirection direction; // INCOMING_REVENUE or OUTGOING_DISBURSEMENT

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "clearing_method")
    private String clearingMethod; // NACHA Automated Cleared, Wire Transfer

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    public enum PaymentDirection {
        INCOMING_REVENUE,
        OUTGOING_DISBURSEMENT
    }
}

