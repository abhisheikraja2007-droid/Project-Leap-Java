package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contact_code", unique = true, nullable = false, length = 32)
    private String contactCode; // e.g. AGR-C-8812

    @Column(name = "full_name", nullable = false)
    private String name;

    @Column(name = "organization_name")
    private String organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false)
    private ContactType type; // FARMER, VENDOR, SUPPLIER, LAB, BOTH

    @Column(nullable = false)
    private String email;

    @Column(name = "mobile_phone", nullable = false)
    private String mobile;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "tax_id_or_usda_farm_number")
    private String taxId;

    @Column(name = "payment_terms_or_acreage")
    private String terms;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum ContactType {
        FARMER,
        VENDOR,
        SUPPLIER,
        LAB,
        BOTH
    }
}

