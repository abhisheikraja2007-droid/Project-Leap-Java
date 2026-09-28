package com.agripulse.projectleap.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryRequestDTO {

    private String sectorId; // e.g. "Sector 4-B (Corn V8)"
    private BigDecimal soilMoisture; // e.g. 17.4
    private Integer durationBelowThresholdMinutes; // e.g. 165
    private BigDecimal cwsi; // e.g. 0.68
    private BigDecimal evapotranspiration; // e.g. 6.8
    private BigDecimal rootDepthCm; // e.g. 30.0
    private Boolean suppliesNeeded; // e.g. true if nitrogen or parts required
    private String operatorNotes;
}

