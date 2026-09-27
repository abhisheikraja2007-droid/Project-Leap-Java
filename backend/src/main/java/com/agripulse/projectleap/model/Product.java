package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 64)
    private String sku; // e.g. SKU-FERT-UREA46, SKU-IOT-PRB-V3

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType type; // GOODS or SERVICE

    @Column(nullable = false)
    private String category; // e.g. Fertilizer, IoT Hardware, Agronomy Consulting

    @Column(name = "sales_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal salesPrice;

    @Column(name = "cost_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal cost;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure; // e.g. ton, unit, acre

    @Column(name = "margin_percentage", precision = 5, scale = 2)
    private BigDecimal marginPercentage;

    @PrePersist
    @PreUpdate
    public void calculateMargin() {
        if (salesPrice != null && cost != null && salesPrice.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profit = salesPrice.subtract(cost);
            this.marginPercentage = profit.divide(salesPrice, 4, java.math.RoundingMode.HALF_UP)
                                         .multiply(BigDecimal.valueOf(100));
        }
    }

    public enum ProductType {
        GOODS,
        SERVICE
    }
}
