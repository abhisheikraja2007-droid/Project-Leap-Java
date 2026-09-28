package com.agripulse.projectleap.controller;

import com.agripulse.projectleap.service.TelemetryService;



import com.agripulse.projectleap.dto.TelemetryRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sensors")
@CrossOrigin(origins = "*")
public class TelemetryController {

    private final TelemetryService telemetryService;

    public TelemetryController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    /**
     * Requirement: POST /api/sensors/telemetry
     * Ingests sensor data, evaluates thresholds, triggers pump dispatch & generates orders/bills.
     */
    @PostMapping("/telemetry")
    public ResponseEntity<Map<String, Object>> ingestSensorTelemetry(@RequestBody TelemetryRequestDTO telemetryDTO) {
        Map<String, Object> result = telemetryService.processTelemetry(telemetryDTO);
        return ResponseEntity.ok(result);
    }
}



