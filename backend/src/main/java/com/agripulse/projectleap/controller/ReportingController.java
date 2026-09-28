package com.agripulse.projectleap.controller;

import com.agripulse.projectleap.service.ReportService;



import com.agripulse.projectleap.dto.BudgetReportView;
import com.agripulse.projectleap.dto.FinancialSnapshotView;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportingController {

    private final ReportService reportService;

    public ReportingController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Requirement 5.D:
     * Allows Admin (Agronomy Director) to query date ranges for Water Budget Reports.
     */
    @GetMapping("/budget")
    public ResponseEntity<BudgetReportView> getBudgetReport(
            @RequestParam(defaultValue = "Current Quarter (Q3 Kharif)") String dateRange,
            @RequestParam(defaultValue = "all") String sector) {
        BudgetReportView report = reportService.generateBudgetReport(dateRange, sector);
        return ResponseEntity.ok(report);
    }

    /**
     * Requirement 5.D:
     * Generates P&L and Balance Sheet reports for the selected date range.
     */
    @GetMapping("/financial-snapshot")
    public ResponseEntity<FinancialSnapshotView> getFinancialSnapshot(
            @RequestParam(defaultValue = "Current Quarter (Q3 Kharif)") String dateRange) {
        FinancialSnapshotView snapshot = reportService.generateFinancialSnapshot(dateRange);
        return ResponseEntity.ok(snapshot);
    }
}



