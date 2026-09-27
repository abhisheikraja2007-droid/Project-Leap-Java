package com.agripulse.projectleap.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry_readings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "node_sector_id", nullable = false, length = 32)
    private String nodeSectorId; // e.g. "Sector 4-B (Corn V8 Stage)"

    @Column(name = "soil_moisture_vwc", precision = 5, scale = 2, nullable = false)
    private BigDecimal soilMoistureVwc; // e.g. 17.40 (%)

    @Column(name = "threshold_floor", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal thresholdFloor = BigDecimal.valueOf(20.00); // 20.0% critical limit

    @Column(name = "duration_below_threshold_minutes")
    private Integer durationBelowThresholdMinutes; // e.g. 165 minutes (2h 45m)

    @Column(name = "crop_water_stress_index", precision = 4, scale = 2)
    private BigDecimal cropWaterStressIndex; // e.g. 0.68

    @Column(name = "evapotranspiration_mm_day", precision = 5, scale = 2)
    private BigDecimal evapotranspirationMmDay; // e.g. 6.80 mm/day

    @Column(name = "hydraulic_pressure_psi", precision = 5, scale = 2)
    private BigDecimal hydraulicPressurePsi; // e.g. 42.0 PSI

    @Column(name = "hydraulic_flow_gpm")
    private Integer hydraulicFlowGpm; // e.g. 420 GPM

    @Column(name = "pump_dispatch_triggered")
    private Boolean pumpDispatchTriggered;

    @Column(name = "triggered_valve_group")
    private String triggeredValveGroup; // e.g. "VALVE-GRP-4B"

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = LocalDateTime.now();
    }
}
