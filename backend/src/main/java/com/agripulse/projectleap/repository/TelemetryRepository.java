package com.agripulse.projectleap.repository;

import com.agripulse.projectleap.model.TelemetryReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TelemetryRepository extends JpaRepository<TelemetryReading, Long> {
}
