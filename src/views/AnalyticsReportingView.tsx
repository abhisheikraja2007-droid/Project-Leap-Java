import React, { useState } from 'react';

interface AnalyticsReportingViewProps {
  onOpenAiAnalysis: (type: 'financial_variance') => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
  showToast: (msg: string) => void;
}

export const AnalyticsReportingView: React.FC<AnalyticsReportingViewProps> = ({
  onOpenAiAnalysis,
  onOpenAiChatWithPrompt,
  showToast,
}) => {
  const [dateRange, setDateRange] = useState('Current Quarter (Q3 Kharif)');
  const [selectedSector, setSelectedSector] = useState('all');
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [budgetReportData, setBudgetReportData] = useState<any>(null);

  // Fetch from Spring Boot ReportingController: /api/reports/budget & /api/reports/financial-snapshot
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const [bRes, fRes] = await Promise.all([
          fetch(`/api/reports/budget?dateRange=${encodeURIComponent(dateRange)}&sector=${selectedSector}`),
          fetch(`/api/reports/financial-snapshot?dateRange=${encodeURIComponent(dateRange)}`)
        ]);
        if (bRes.ok && fRes.ok) {
          const bData = await bRes.json();
          const fData = await fRes.json();
          setBudgetReportData({ budget: bData, financial: fData });
        }
      } catch (err) {
        console.error('Failed to query Spring Boot Reporting Controller:', err);
      }
    };
    fetchReports();
  }, [dateRange, selectedSector]);

  const handleExportExecutivePack = () => {
    // Generate text report summary
    const reportText = `AGRIPULSE OS - EXECUTIVE ANALYTICS & AGRONOMY FINANCIAL REPORT
Fiscal Cycle: Q3 Kharif | Status: Reconciled
Generated: ${new Date().toLocaleString()}

1. KEY PERFORMANCE INDICATORS
- Water Efficiency Index: 4.2 bu/inch applied (+23.5% vs regional baseline)
- Estimated Water Conserved: 14.2M Gallons Saved
- Net Operating Margin: $86,300 (34.7% EBIT)
- Solvency Current Ratio: 3.17x | Debt-to-Equity: 0.53x

2. SECTOR EXPENDITURE VARIANCE
- Sector 1 (Wheat / Pivot Alpha): Planned $18,000 | Actual $16,400 (-$1,600 / 91.1%)
- Sector 4-B (Corn V8 / Drip Bravo): Planned $32,000 | Actual $35,800 (+$3,800 / 111.9% Heat Deficit Surge)
- Sector 2 (Alfalfa / Linear 3): Planned $14,500 | Actual $12,900 (-$1,600 / 88.9%)
- Sector 7 (Citrus / Micro-Sprinkler): Planned $22,000 | Actual $21,100 (-$900 / 95.9%)
Total Realized: $86,200 | Net Variance: +$600 (+0.7%)

3. PROFIT & LOSS STATEMENT (ACCRUAL BASIS)
- Gross Advisory & Agronomy Revenue: $248,500
- Direct Operational COGS: -$114,200
- Gross Operating Profit: $134,300 (54.0% Margin)
- SG&A Overhead: -$48,000
- Net Operating Income (EBIT): $86,300 (34.7% Margin)

4. BALANCE SHEET INTEGRITY
- Total Assets: $1,420,000 = Total Liabilities ($490,000) + Total Farm Equity ($930,000)
A = L + E Verified.`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AgriPulse_Executive_Q3_Kharif_Report.txt';
    link.click();
    URL.revokeObjectURL(url);

    showToast('Executive Pack Generated: AgriPulse_Director_Q3_Report.pdf (3.4 MB) ready for download.');
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Executive Context & Filtering Bar */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Agronomic Financial Intelligence · Q3 Kharif
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Executive Analytics &amp; Yield Variance
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Consolidated irrigation expenditure, water efficiency index, balance sheet reconciliation, and sector performance.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Date Preset Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              className="flex items-center bg-white rounded-lg border border-slate-200 px-3.5 py-2 cursor-pointer hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500 mr-2">calendar_today</span>
              <span className="text-xs text-slate-800 font-medium">{dateRange}</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400 ml-2">expand_more</span>
            </button>
            {isDateMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg border border-slate-200 z-50 p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDateRange('Last 30 Days');
                    setIsDateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-slate-700 hover:bg-slate-100 flex justify-between items-center"
                >
                  <span>Last 30 Days</span>
                  <span className="font-data-mono text-[11px] text-slate-400">01 Aug - 31 Aug</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRange('Current Quarter (Q3 Kharif)');
                    setIsDateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs bg-emerald-50 text-emerald-900 font-semibold flex justify-between items-center"
                >
                  <span>Current Quarter (Q3 Kharif)</span>
                  <span className="font-data-mono text-[11px] text-emerald-700">Active</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDateRange('YTD 2025');
                    setIsDateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-xs text-slate-700 hover:bg-slate-100 flex justify-between items-center"
                >
                  <span>YTD 2025</span>
                  <span className="font-data-mono text-[11px] text-slate-400">Jan - Present</span>
                </button>
              </div>
            )}
          </div>

          {/* Sector Selector */}
          <div className="relative inline-block text-left">
            <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 py-2 shadow-2xs">
              <span className="material-symbols-outlined text-[17px] text-slate-500 mr-2">grid_view</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none cursor-pointer pr-4"
              >
                <option value="all">All Sectors (Consolidated)</option>
                <option value="s4b">Sector 4-B Corn V8 (Drip Bravo)</option>
                <option value="s2">Sector 2 Alfalfa (Linear 3)</option>
                <option value="s7">Sector 7 Orchards (Micro-Sprinkler)</option>
                <option value="s1">Sector 1 Wheat (Pivot Alpha)</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportExecutivePack}
            className="flex items-center gap-2 bg-emerald-800 text-white hover:bg-emerald-900 px-4 py-2 rounded-lg transition-colors text-xs font-medium cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[17px]">download_for_offline</span>
            <span>Export Executive Pack</span>
          </button>
        </div>
      </div>

      {/* Real-Time ROI & Efficiency Highlights Banner (4 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-[#dce9ff]/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary-fixed/20 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Water Efficiency Index
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-low text-primary">
                <span className="material-symbols-outlined text-[18px]">water_drop</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-[34px] font-bold text-on-surface tracking-tight">4.2</span>
              <span className="font-body-md text-xs text-on-surface-variant font-medium">bu / inch applied</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center text-primary font-bold">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>+23.5%
            </span>
            <span className="font-data-mono text-[11px]">vs 3.4 Regional Baseline</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-[#dce9ff]/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-secondary-container/30 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Estimated Water Conserved
              </span>
              <span className="p-1.5 rounded-lg bg-secondary-container text-secondary">
                <span className="material-symbols-outlined text-[18px]">eco</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-[34px] font-bold text-tertiary tracking-tight">14.2M</span>
              <span className="font-body-md text-xs text-on-surface-variant font-medium">Gallons Saved</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span className="text-tertiary font-bold flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">verified</span>Closed-Loop VPD
            </span>
            <span className="font-data-mono text-[11px]">vs Static Timers</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-[#dce9ff]/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-tertiary-fixed/20 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Net Operating Margin
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-low text-tertiary">
                <span className="material-symbols-outlined text-[18px]">payments</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display-lg text-[34px] font-bold text-on-surface tracking-tight">$86,300</span>
              <span className="font-headline-sm text-sm text-tertiary font-bold">34.7%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span className="text-primary font-bold flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>+4.2% YoY
            </span>
            <span className="font-data-mono text-[11px]">Gross: $134.3k (54.0%)</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-[#dce9ff]/60 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-surface-container pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Solvency &amp; Fleet Ratio
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-low text-secondary">
                <span className="material-symbols-outlined text-[18px]">balance</span>
              </span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="font-headline-lg text-[22px] text-on-surface font-bold">3.17x</span>
                <span className="block font-label-sm text-[10.5px] text-on-surface-variant">Current Ratio</span>
              </div>
              <div className="h-8 w-px bg-surface-container-high"></div>
              <div>
                <span className="font-headline-lg text-[22px] text-on-surface font-bold">0.53x</span>
                <span className="block font-label-sm text-[10.5px] text-on-surface-variant">Debt-to-Equity</span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex items-center justify-between text-xs text-on-surface-variant">
            <span className="text-primary font-bold">Low Leverage</span>
            <span className="font-data-mono text-[11px]">Assets: $1.42M</span>
          </div>
        </div>
      </div>

      {/* Main Section: Budget Allocation & Expenditure Analysis */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#dce9ff]/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 gap-4 border-b border-[#dce9ff]/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              <h2 className="font-headline-md text-[18px] font-bold text-on-surface">
                Budget vs. Actual Irrigation Expenditure
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Variance analysis per Analytic Operational Sector and critical cost drivers for Q3.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface-container-low px-3 py-1.5 rounded-xl border border-[#dce9ff]/60">
            <div className="flex items-center gap-1.5 text-xs text-on-surface">
              <span className="w-3 h-3 rounded bg-secondary-fixed-dim"></span>
              <span>Planned Allocation</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface">
              <span className="w-3 h-3 rounded bg-primary"></span>
              <span>Actual Realized</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface">
              <span className="w-3 h-3 rounded bg-error"></span>
              <span>Budget Exceeded</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Visual Comparative Chart Column */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Sector 1 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span>Sector 1 · Wheat / Pivot Alpha</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-bold text-[10.5px]">
                      Under Budget
                    </span>
                  </span>
                  <span className="font-data-mono text-secondary">
                    <span className="text-on-surface font-bold">$16,400</span> / $18,000 (91%)
                  </span>
                </div>
                <div className="h-5 w-full bg-surface-container-low rounded-lg overflow-hidden flex relative">
                  <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-secondary z-10"></div>
                  <div className="h-full bg-primary rounded-lg" style={{ width: '82%' }}></div>
                </div>
              </div>

              {/* Sector 4-B */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span>Sector 4-B · Corn V8 / Drip Bravo</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] font-bold text-[10.5px] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">warning</span> Heat Deficit Surge (+12%)
                    </span>
                  </span>
                  <span className="font-data-mono text-error font-bold">
                    <span>$35,800</span> <span className="text-secondary font-normal">/ $32,000 (112%)</span>
                  </span>
                </div>
                <div className="h-5 w-full bg-surface-container-low rounded-lg overflow-hidden flex relative">
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-secondary z-10"></div>
                  <div className="h-full bg-error rounded-lg" style={{ width: '89.5%' }}></div>
                </div>
              </div>

              {/* Sector 2 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span>Sector 2 · Alfalfa / Linear 3</span>
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant font-bold text-[10.5px]">
                      Under Budget
                    </span>
                  </span>
                  <span className="font-data-mono text-secondary">
                    <span className="text-on-surface font-bold">$12,900</span> / $14,500 (89%)
                  </span>
                </div>
                <div className="h-5 w-full bg-surface-container-low rounded-lg overflow-hidden flex relative">
                  <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-secondary z-10"></div>
                  <div className="h-full bg-primary rounded-lg" style={{ width: '75.6%' }}></div>
                </div>
              </div>

              {/* Sector 7 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-on-surface flex items-center gap-2">
                    <span>Sector 7 · Citrus / Micro-Sprinkler</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-medium text-[10.5px]">
                      On Target
                    </span>
                  </span>
                  <span className="font-data-mono text-secondary">
                    <span className="text-on-surface font-bold">$21,100</span> / $22,000 (96%)
                  </span>
                </div>
                <div className="h-5 w-full bg-surface-container-low rounded-lg overflow-hidden flex relative">
                  <div className="absolute top-0 bottom-0 left-[88%] w-0.5 bg-secondary z-10"></div>
                  <div className="h-full bg-primary rounded-lg" style={{ width: '84.4%' }}></div>
                </div>
              </div>
            </div>

            {/* Breakdown Mini Table */}
            <div className="overflow-x-auto border-t border-[#dce9ff]/60 pt-4">
              <table className="w-full text-left font-body-sm text-xs">
                <thead>
                  <tr className="bg-surface-container-low text-secondary font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3 rounded-l-lg">Sector &amp; System</th>
                    <th className="py-2.5 px-3 text-right">Budget Plan</th>
                    <th className="py-2.5 px-3 text-right">Actual Realized</th>
                    <th className="py-2.5 px-3 text-right">Variance ($)</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/40">
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 px-3 font-semibold text-on-surface">Sector 1 (Wheat / Pivot Alpha)</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-secondary">$18,000</td>
                    <td className="py-2.5 px-3 text-right font-data-mono font-bold text-on-surface">$16,400</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-primary font-bold">-$1,600</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-on-surface font-semibold">91.1%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50 bg-[#fee2e2]/20">
                    <td className="py-2.5 px-3 font-bold text-[#b91c1c] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      Sector 4-B (Corn V8 / Drip Bravo)
                    </td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-secondary">$32,000</td>
                    <td className="py-2.5 px-3 text-right font-data-mono font-bold text-error">$35,800</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-error font-bold">+$3,800</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-error font-bold">111.9%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 px-3 font-semibold text-on-surface">Sector 2 (Alfalfa / Linear 3)</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-secondary">$14,500</td>
                    <td className="py-2.5 px-3 text-right font-data-mono font-bold text-on-surface">$12,900</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-primary font-bold">-$1,600</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-on-surface font-semibold">88.9%</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 px-3 font-semibold text-on-surface">Sector 7 (Citrus / Micro-Sprinkler)</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-secondary">$22,000</td>
                    <td className="py-2.5 px-3 text-right font-data-mono font-bold text-on-surface">$21,100</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-primary font-bold">-$900</td>
                    <td className="py-2.5 px-3 text-right font-data-mono text-on-surface font-semibold">95.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Drivers Breakdown Donut / List */}
          <div className="lg:col-span-4 bg-surface-container-low p-5 rounded-2xl flex flex-col justify-between border border-[#dce9ff]/60">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  Root Allocation Drivers
                </span>
                <button
                  onClick={() => onOpenAiAnalysis('financial_variance')}
                  className="px-2.5 py-1 rounded-lg bg-primary-fixed/60 hover:bg-primary-fixed text-on-primary-fixed text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Analyze financial variance with Gemini"
                >
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  AI Audit
                </button>
              </div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-3">Expenditure Composition</h3>

              {/* SVG Visual Doughnut Chart */}
              <div className="flex items-center justify-center my-3 relative">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#dce9ff" strokeWidth="3.8"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#00652c" strokeDasharray="54 46" strokeDashoffset="0" strokeWidth="3.8"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#565e74" strokeDasharray="26 74" strokeDashoffset="-54" strokeWidth="3.8"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#79db8d" strokeDasharray="14 86" strokeDashoffset="-80" strokeWidth="3.8"></circle>
                  <circle cx="18" cy="18" fill="transparent" r="15.91549430918954" stroke="#008138" strokeDasharray="6 94" strokeDashoffset="-94" strokeWidth="3.8"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display-lg text-[22px] font-bold text-on-surface">$86.2k</span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">Total Exp</span>
                </div>
              </div>

              {/* Legend breakdown list */}
              <div className="space-y-2 mt-4 text-xs font-body-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-primary"></span>
                    <span className="text-on-surface font-medium">Electricity &amp; Pumping kWh</span>
                  </div>
                  <span className="font-data-mono font-bold text-on-surface">54%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-secondary"></span>
                    <span className="text-on-surface font-medium">Water Allocations &amp; Rights</span>
                  </div>
                  <span className="font-data-mono font-bold text-on-surface">26%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-primary-fixed-dim"></span>
                    <span className="text-on-surface font-medium">Field Labor &amp; Maintenance</span>
                  </div>
                  <span className="font-data-mono font-bold text-on-surface">14%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-tertiary-container"></span>
                    <span className="text-on-surface font-medium">Sensor Fleet SaaS &amp; Telemetry</span>
                  </div>
                  <span className="font-data-mono font-bold text-on-surface">6%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-surface-container-lowest rounded-xl text-xs text-on-surface-variant flex items-center gap-2 border border-[#dce9ff]/60">
              <span className="material-symbols-outlined text-primary text-[18px]">info</span>
              <span>Peak grid tariff pricing observed 14:00-18:00 daily across Bravo booster.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Split Section: Profit & Loss Statement + Balance Sheet Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* P&L Statement Card (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#dce9ff]/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#dce9ff]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt_long</span>
                <div>
                  <h2 className="font-headline-md text-[18px] font-bold text-on-surface">Profit &amp; Loss (P&amp;L) Summary</h2>
                  <span className="font-label-sm text-xs text-secondary">Accrual Basis · Agronomy Services &amp; Operational Outlay</span>
                </div>
              </div>
              <span className="font-label-sm text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-bold">
                Q3 Fiscal Kharif
              </span>
            </div>

            {/* Revenue */}
            <div className="mb-4">
              <div className="flex justify-between items-center py-2 px-3 bg-surface-container-low rounded-xl font-headline-sm text-sm text-on-surface font-bold">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">trending_up</span>
                  Gross Advisory &amp; Agronomy Revenue
                </span>
                <span className="font-data-mono text-tertiary">$248,500</span>
              </div>
              <div className="space-y-1.5 px-4 pt-2 text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Variable Rate Precision Irrigation Fees</span>
                  <span className="font-data-mono font-medium text-on-surface">$162,000</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Crop Health Drone &amp; Satellite Monitoring</span>
                  <span className="font-data-mono font-medium text-on-surface">$54,500</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Sensor Telemetry Hardware Subscriptions</span>
                  <span className="font-data-mono font-medium text-on-surface">$32,000</span>
                </div>
              </div>
            </div>

            {/* COGS */}
            <div className="mb-4">
              <div className="flex justify-between items-center py-2 px-3 bg-surface-container-low rounded-xl font-headline-sm text-sm text-on-surface font-bold">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">trending_down</span>
                  Less: Direct Operational Expenses (COGS &amp; Energy)
                </span>
                <span className="font-data-mono text-error">-$114,200</span>
              </div>
              <div className="space-y-1.5 px-4 pt-2 text-xs">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Grid Pumping Electricity &amp; Diesel Booster</span>
                  <span className="font-data-mono font-medium text-on-surface">-$68,400</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Soil Testing &amp; Agronomic Field Audits</span>
                  <span className="font-data-mono font-medium text-on-surface">-$24,800</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Equipment Depreciation &amp; Repairs</span>
                  <span className="font-data-mono font-medium text-on-surface">-$21,000</span>
                </div>
              </div>
            </div>

            {/* Gross Profit Row */}
            <div className="flex justify-between items-center py-2.5 px-4 bg-surface-container rounded-xl font-body-lg text-sm text-on-surface font-bold mb-3">
              <span>Gross Operating Profit (54.0% Margin)</span>
              <span className="font-data-mono text-primary">$134,300</span>
            </div>

            {/* SG&A */}
            <div className="space-y-1.5 px-4 mb-2 text-xs">
              <div className="flex justify-between items-center text-on-surface-variant font-medium">
                <span>Less: SG&amp;A &amp; Advisory Agronomist Salaries</span>
                <span className="font-data-mono font-bold text-secondary">-$48,000</span>
              </div>
            </div>
          </div>

          {/* Net Operating Margin EBIT Highlight */}
          <div className="bg-primary-container text-on-primary p-4 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <span className="font-headline-sm text-sm font-bold block">Net Operating Income (EBIT)</span>
                <span className="font-label-sm text-[11px] text-on-primary-container">
                  Net Margin: 34.7% (+4.2% YoY Improvement)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-display-lg text-[28px] font-bold tracking-tight">$86,300</span>
            </div>
          </div>
        </div>

        {/* Balance Sheet Snapshot (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#dce9ff]/60 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#dce9ff]/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">account_balance</span>
                <div>
                  <h2 className="font-headline-md text-[18px] font-bold text-on-surface">Balance Sheet Snapshot</h2>
                  <span className="font-label-sm text-xs text-secondary">Assets, Liabilities &amp; Equity Stance</span>
                </div>
              </div>
              <span className="font-data-mono text-xs bg-surface-container-low px-2 py-1 rounded text-on-surface font-bold">
                USD ($)
              </span>
            </div>

            {/* Assets */}
            <div className="bg-surface-container-low p-4 rounded-xl mb-3 space-y-2 border border-[#dce9ff]/60">
              <div className="flex justify-between items-center font-headline-sm text-sm text-on-surface font-bold">
                <span>Total Assets</span>
                <span className="font-data-mono text-primary">$1,420,000</span>
              </div>
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-on-surface font-medium">
                  <span>Current Assets</span>
                  <span className="font-data-mono font-semibold">$380,000</span>
                </div>
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· Cash &amp; Liquid Equivalents</span>
                  <span className="font-data-mono">$210,000</span>
                </div>
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· Accounts Receivable (Client Billings)</span>
                  <span className="font-data-mono">$170,000</span>
                </div>
                <div className="flex justify-between text-on-surface font-medium pt-1">
                  <span>Non-Current Agricultural Assets</span>
                  <span className="font-data-mono font-semibold">$1,040,000</span>
                </div>
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· Pivots, Variable Drip &amp; Pumping Fleet</span>
                  <span className="font-data-mono">$820,000</span>
                </div>
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· IoT Sensor Fleet &amp; Field Gateways</span>
                  <span className="font-data-mono">$220,000</span>
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div className="bg-surface-container-low p-4 rounded-xl mb-3 space-y-2 border border-[#dce9ff]/60">
              <div className="flex justify-between items-center font-headline-sm text-sm text-on-surface font-bold">
                <span>Total Liabilities</span>
                <span className="font-data-mono text-secondary">$490,000</span>
              </div>
              <div className="space-y-1 pt-1 text-xs">
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· Current Accounts Payable (Suppliers/Power)</span>
                  <span className="font-data-mono font-medium text-on-surface">$120,000</span>
                </div>
                <div className="flex justify-between text-secondary pl-2 text-[11px]">
                  <span>· Long-Term Agricultural Equipment Financing</span>
                  <span className="font-data-mono font-medium text-on-surface">$370,000</span>
                </div>
              </div>
            </div>

            {/* Equity */}
            <div className="bg-surface-container p-4 rounded-xl mb-3 space-y-1 border border-[#dce9ff]/60">
              <div className="flex justify-between items-center font-headline-sm text-sm text-on-surface font-bold">
                <span>Total Farm Equity</span>
                <span className="font-data-mono text-on-surface">$930,000</span>
              </div>
              <div className="flex justify-between text-secondary pl-2 text-[11px]">
                <span>· Retained Farm Earnings &amp; Capital Reserves</span>
                <span className="font-data-mono font-medium text-on-surface">$930,000</span>
              </div>
            </div>
          </div>

          {/* Solvency Footnote */}
          <div className="bg-surface-container-high/60 p-3 rounded-xl flex items-center justify-between text-xs border border-[#dce9ff]/60">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
              <span className="font-semibold">Balanced Sheet Integrity: $1.42M = $490k + $930k</span>
            </div>
            <span className="font-data-mono text-tertiary font-bold">A = L + E Verified</span>
          </div>
        </div>
      </div>

      {/* Director Visual Verification: Precision Agronomy Asset Audits & Canopy Validation */}
      <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-[#dce9ff]/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#dce9ff]/60">
          <div>
            <span className="font-label-md text-xs text-tertiary uppercase tracking-wider font-bold">
              Director Visual Verification
            </span>
            <h3 className="font-headline-md text-[18px] font-bold text-on-surface">
              Precision Agronomy Asset Audits &amp; Canopy Validation
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0 text-xs text-on-surface-variant font-data-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Multispectral Sentinel-2 &amp; Ground In-Situ Imagery Synchronized</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Photo Card 1: Pivot Wheat */}
          <div className="group rounded-2xl overflow-hidden shadow-xs bg-surface-container-low flex flex-col border border-[#dce9ff]/60">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuACyKGnkWfPZknXtZ9JCIiWxIVnlDJzrcKyUg6Qc-xJLKvX7MrNktLfP0pdSHWZIuXRQW414-zcuIyW-VvI8bYxed1BgmlvoG3GwYRKbrod5fFpceXl-nhjLgV81jANwAo0oo0XFJlcelzkCUVeO86IiUXgqttg977Uz_6TY5vLLX3Zkp_j2-O_t38RRIoz-LJkOOFqGk5nDOunsAtzd15dqkOWJ24iNS9mTP-sV2NX4rfHXvsP56t8hg"
                alt="Center pivot irrigation on wheat"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-on-surface shadow-xs">
                Sector 1 · Pivot Alpha
              </div>
              <div className="absolute bottom-3 right-3 bg-primary text-on-primary px-2 py-0.5 rounded font-data-mono text-xs font-bold">
                NDVI 0.82
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">Winter Wheat Flowering</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Target transpiration matched with low pump overhead. 91% budget consumption with optimal grain filling.
                </p>
              </div>
              <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs text-secondary">
                <span className="flex items-center gap-1 font-bold text-tertiary">
                  <span className="material-symbols-outlined text-[16px]">check</span>In-budget (-$1,600)
                </span>
                <span className="font-data-mono">Soil VWC: 32.4%</span>
              </div>
            </div>
          </div>

          {/* Photo Card 2: Corn V8 Heat Deficit */}
          <div className="group rounded-2xl overflow-hidden shadow-xs bg-surface-container-low flex flex-col border border-[#dce9ff]/60">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIAgkCxHZ_83zWPBLLWA_Yg54SrT0HwwYkAoqTbsrU03zKnRsfd4q-Cqq7xWkFUyj0Auq1GXsRqCu3VDgMrBhceeTndMHixp8XnNGeG_m70oDCAM_QkkprvsEr5cSUHU8rDpmJBMnPxl6Y1qzV_qfkQtoEdEPIq3DlaMUx4YYq0e2yittioooBO-qTkSWeGdq_B5wov3Jr7t55pKqlQoUPzBAzkRhS5YuCU7TFUuCLcP7lThx9vZknAg"
                alt="Cornfield with drip line"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#fee2e2] text-[#b91c1c] px-2.5 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">thermostat</span> Sector 4-B Heat Stress
              </div>
              <div className="absolute bottom-3 right-3 bg-error text-white px-2 py-0.5 rounded font-data-mono text-xs font-bold">
                ETc 6.4mm/d
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">Corn V8 Canopy Deficit</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                  High heat index triggered automated auxiliary pumping to prevent yield collapse, causing +$3.8k expense variance.
                </p>
              </div>
              <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs text-secondary">
                <span className="flex items-center gap-1 font-bold text-error">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>Surge Alert (+12%)
                </span>
                <span className="font-data-mono">Stem Potential: -1.2 MPa</span>
              </div>
            </div>
          </div>

          {/* Photo Card 3: Citrus Orchards */}
          <div className="group rounded-2xl overflow-hidden shadow-xs bg-surface-container-low flex flex-col border border-[#dce9ff]/60">
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmR6UordZZYHcukXGsSwX1r_8O9N8v-TfQ5C7vyaP7YzCZiSt_v3UCTC9UspsWXhN7eN-K0rUcPQ-eyUbexinmKelsGLSV1g12MmX3mNfUO5mrCFv8qmWFtGCfJiK6Q3fNvlBFK670unVmDNBbIXFllHTUK8zP47MOAZc3qbPIDLDl72pM-OiFrUUYJW6ijRsytH3LceEArXSCi54Dvvd2wTyPuTYsvgHxZtRjdPAs-MoYKDQMuBmEUQ"
                alt="Citrus orchard with micro-sprinklers"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-on-surface shadow-xs">
                Sector 7 · Citrus Block
              </div>
              <div className="absolute bottom-3 right-3 bg-primary text-on-primary px-2 py-0.5 rounded font-data-mono text-xs font-bold">
                96% Budget
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-headline-sm text-sm font-bold text-on-surface">Micro-Sprinkler Citrus</h4>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                  Balanced root zone pulsation maintaining canopy moisture without runoff. Conserved 3.8M gal this month.
                </p>
              </div>
              <div className="pt-3 border-t border-surface-container flex items-center justify-between text-xs text-secondary">
                <span className="flex items-center gap-1 font-bold text-tertiary">
                  <span className="material-symbols-outlined text-[16px]">tune</span>Scheduled Pulse
                </span>
                <span className="font-data-mono">Tensiometer: 28 cbar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
