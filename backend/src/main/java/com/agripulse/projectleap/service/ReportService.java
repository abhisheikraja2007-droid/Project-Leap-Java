package com.agripulse.projectleap.service;



import com.agripulse.projectleap.dto.BudgetReportView;
import com.agripulse.projectleap.dto.FinancialSnapshotView;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ReportService {

    /**
     * Executes the Budget Report comparing planned vs. actual irrigation expenditure per Analytic Account.
     */
    public BudgetReportView generateBudgetReport(String dateRange, String sector) {
        List<BudgetReportView.SectorBudgetItem> items = new ArrayList<>();

        items.add(BudgetReportView.SectorBudgetItem.builder()
                .sectorName("Sector 1 (Wheat / Pivot Alpha)")
                .plannedBudget(new BigDecimal("18000.00"))
                .actualRealized(new BigDecimal("16400.00"))
                .variance(new BigDecimal("-1600.00"))
                .utilizationPercentage(new BigDecimal("91.10"))
                .statusFlag("Under Budget")
                .build());

        items.add(BudgetReportView.SectorBudgetItem.builder()
                .sectorName("Sector 4-B (Corn V8 / Drip Bravo)")
                .plannedBudget(new BigDecimal("32000.00"))
                .actualRealized(new BigDecimal("35800.00"))
                .variance(new BigDecimal("+3800.00"))
                .utilizationPercentage(new BigDecimal("111.90"))
                .statusFlag("Heat Deficit Surge (+12%)")
                .build());

        items.add(BudgetReportView.SectorBudgetItem.builder()
                .sectorName("Sector 2 (Alfalfa / Linear 3)")
                .plannedBudget(new BigDecimal("14500.00"))
                .actualRealized(new BigDecimal("12900.00"))
                .variance(new BigDecimal("-1600.00"))
                .utilizationPercentage(new BigDecimal("88.90"))
                .statusFlag("Under Budget")
                .build());

        items.add(BudgetReportView.SectorBudgetItem.builder()
                .sectorName("Sector 7 (Citrus / Micro-Sprinkler)")
                .plannedBudget(new BigDecimal("22000.00"))
                .actualRealized(new BigDecimal("21100.00"))
                .variance(new BigDecimal("-900.00"))
                .utilizationPercentage(new BigDecimal("95.90"))
                .statusFlag("On Target")
                .build());

        BigDecimal totalPlanned = items.stream().map(BudgetReportView.SectorBudgetItem::getPlannedBudget).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalActual = items.stream().map(BudgetReportView.SectorBudgetItem::getActualRealized).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalVariance = totalActual.subtract(totalPlanned);

        return BudgetReportView.builder()
                .fiscalCycle("Fiscal Cycle Q3 Kharif")
                .auditState("RECONCILED")
                .totalPlanned(totalPlanned)
                .totalActual(totalActual)
                .totalVariance(totalVariance)
                .sectorBreakdowns(items)
                .build();
    }

    /**
     * Executes the Financial Snapshot (P&L and Balance Sheet) for the selected date range.
     */
    public FinancialSnapshotView generateFinancialSnapshot(String dateRange) {
        // Profit & Loss
        Map<String, BigDecimal> revLines = new LinkedHashMap<>();
        revLines.put("Variable Rate Precision Irrigation Fees", new BigDecimal("162000.00"));
        revLines.put("Crop Health Drone & Satellite Monitoring", new BigDecimal("54500.00"));
        revLines.put("Sensor Telemetry Hardware Subscriptions", new BigDecimal("32000.00"));

        Map<String, BigDecimal> cogsLines = new LinkedHashMap<>();
        cogsLines.put("Grid Pumping Electricity & Diesel Booster", new BigDecimal("-68400.00"));
        cogsLines.put("Soil Testing & Agronomic Field Audits", new BigDecimal("-24800.00"));
        cogsLines.put("Equipment Depreciation & Repairs", new BigDecimal("-21000.00"));

        FinancialSnapshotView.ProfitAndLossStatement pnl = FinancialSnapshotView.ProfitAndLossStatement.builder()
                .grossRevenue(new BigDecimal("248500.00"))
                .revenueLineItems(revLines)
                .directCogs(new BigDecimal("-114200.00"))
                .cogsLineItems(cogsLines)
                .grossOperatingProfit(new BigDecimal("134300.00"))
                .sgaExpenses(new BigDecimal("-48000.00"))
                .netOperatingIncomeEbit(new BigDecimal("86300.00"))
                .netMarginPercentage(new BigDecimal("34.70"))
                .build();

        // Balance Sheet
        FinancialSnapshotView.BalanceSheet bs = FinancialSnapshotView.BalanceSheet.builder()
                .totalAssets(new BigDecimal("1420000.00"))
                .currentAssets(new BigDecimal("380000.00"))
                .nonCurrentAssets(new BigDecimal("1040000.00"))
                .totalLiabilities(new BigDecimal("490000.00"))
                .currentLiabilities(new BigDecimal("120000.00"))
                .longTermLiabilities(new BigDecimal("370000.00"))
                .totalFarmEquity(new BigDecimal("930000.00"))
                .equationBalanced(true)
                .build();

        return FinancialSnapshotView.builder()
                .dateRange(dateRange != null ? dateRange : "Current Quarter (Q3 Kharif)")
                .profitAndLoss(pnl)
                .balanceSheet(bs)
                .build();
    }
}


