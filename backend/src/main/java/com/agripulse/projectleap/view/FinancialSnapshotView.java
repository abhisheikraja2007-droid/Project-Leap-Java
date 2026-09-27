package com.agripulse.projectleap.view;

import lombok.*;
import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialSnapshotView {

    private String dateRange;
    private ProfitAndLossStatement profitAndLoss;
    private BalanceSheet balanceSheet;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfitAndLossStatement {
        private BigDecimal grossRevenue;
        private Map<String, BigDecimal> revenueLineItems;
        private BigDecimal directCogs;
        private Map<String, BigDecimal> cogsLineItems;
        private BigDecimal grossOperatingProfit;
        private BigDecimal sgaExpenses;
        private BigDecimal netOperatingIncomeEbit;
        private BigDecimal netMarginPercentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BalanceSheet {
        private BigDecimal totalAssets;
        private BigDecimal currentAssets;
        private BigDecimal nonCurrentAssets;
        private BigDecimal totalLiabilities;
        private BigDecimal currentLiabilities;
        private BigDecimal longTermLiabilities;
        private BigDecimal totalFarmEquity;
        private Boolean equationBalanced; // A = L + E verified
    }
}
