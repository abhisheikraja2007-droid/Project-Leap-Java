package com.agripulse.projectleap.view;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetReportView {

    private String fiscalCycle; // "Fiscal Cycle Q3 Kharif"
    private String auditState; // "RECONCILED"
    private BigDecimal totalPlanned;
    private BigDecimal totalActual;
    private BigDecimal totalVariance;
    private List<SectorBudgetItem> sectorBreakdowns;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SectorBudgetItem {
        private String sectorName;
        private BigDecimal plannedBudget;
        private BigDecimal actualRealized;
        private BigDecimal variance;
        private BigDecimal utilizationPercentage;
        private String statusFlag; // "Under Budget", "Heat Deficit Surge (+12%)", "On Target"
    }
}
