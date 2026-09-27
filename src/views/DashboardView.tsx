import React, { useState } from 'react';
import { ActiveTab, UserRole } from '../types';

interface DashboardViewProps {
  userRole: UserRole;
  onNavigate: (tab: ActiveTab) => void;
  onOpenAiAnalysis: (type: 'soil_deficit' | 'financial_variance') => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
  showToast: (msg: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userRole,
  onNavigate,
  onOpenAiAnalysis,
  onOpenAiChatWithPrompt,
  showToast,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'quarter'>('quarter');
  const [isDispatching, setIsDispatching] = useState(false);

  // Field Operator: Quick Trigger from Dashboard
  const handleQuickTriggerValve = async () => {
    setIsDispatching(true);
    try {
      const response = await fetch('/api/sensors/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectorId: 'Sector 4-B (Corn V8 Stage)',
          soilMoisture: 17.4,
          durationBelowThresholdMinutes: 165,
          cwsi: 0.68,
          evapotranspiration: 6.8,
          suppliesNeeded: true,
        }),
      });
      const data = await response.json();
      if (data.salesOrder) {
        showToast(`SCADA Valve 4-B actuated! SO #${data.salesOrder.orderNumber} ($750) created. PO #${data.purchaseOrder?.id} generated.`);
      } else {
        showToast('SCADA Valve Group 4-B Actuated! Deep-Root Recovery Pulse initiated.');
      }
    } catch {
      showToast('Valve Group 4-B Actuated (420 GPM @ 42 PSI).');
    } finally {
      setIsDispatching(false);
    }
  };

  const operatorMetrics = {
    today: {
      moisture: '19.2%', deficit: 'Stable',
      flowRate: '400 GPM', pressure: '41.0 PSI',
      et: '5.2 mm/d', temp: '31°C',
      sync: '24 / 24'
    },
    week: {
      moisture: '21.5%', deficit: 'Recovering',
      flowRate: '410 GPM', pressure: '41.5 PSI',
      et: '6.1 mm/d', temp: '32°C',
      sync: '24 / 24'
    },
    quarter: {
      moisture: '17.4%', deficit: 'Deficit',
      flowRate: '420 GPM', pressure: '42.0 PSI',
      et: '6.8 mm/d', temp: '34°C',
      sync: '24 / 24'
    }
  };

  const directorMetrics = {
    today: {
      noiPercent: '+5.2%', noiValue: '$12,400',
      assets: '$1,420,000',
      waterPercent: '+4.1%', waterValue: '1.2M Gal',
      budget: '+$100.00'
    },
    week: {
      noiPercent: '+14.1%', noiValue: '$45,200',
      assets: '$1,420,000',
      waterPercent: '+12.8%', waterValue: '4.8M Gal',
      budget: '+$250.00'
    },
    quarter: {
      noiPercent: '+34.7%', noiValue: '$86,300',
      assets: '$1,420,000',
      waterPercent: '+23.5%', waterValue: '14.2M Gal',
      budget: '+$600.00'
    }
  };

  const currentOp = operatorMetrics[selectedPeriod];
  const currentDir = directorMetrics[selectedPeriod];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* 1. Dynamic Executive / Operational Role Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <span>
              {userRole === 'Field Operator'
                ? 'Field Operations & SCADA Telemetry'
                : 'Executive Governance & Agronomy Financials'}
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className={userRole === 'Field Operator' ? 'text-blue-600 font-semibold' : 'text-emerald-700 font-semibold'}>
              {userRole === 'Field Operator' ? 'Operator Controls Active' : 'Director Financial Access Active'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {userRole === 'Field Operator'
              ? 'Field Operator SCADA & Actuation Cockpit'
              : 'Agronomy Director Executive & Financial Command'}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl">
            {userRole === 'Field Operator'
              ? 'Real-time soil sensor telemetry, immediate SCADA valve actuation overrides, and field hardware status.'
              : 'Consolidated fiscal budget execution, accrual P&L ledger performance, sector yield variance, and capital governance.'}
          </p>
        </div>

        {/* Global Controls & Period Filter */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setSelectedPeriod('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPeriod === 'today'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 24h
            </button>
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPeriod === 'week'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                selectedPeriod === 'quarter'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q3 Kharif
            </button>
          </div>

          {userRole === 'Field Operator' ? (
            <button
              onClick={handleQuickTriggerValve}
              disabled={isDispatching}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">water_drop</span>
              <span>{isDispatching ? 'Actuating...' : 'Trigger SCADA 4-B'}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('analytics-reporting')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              <span>Export Director Brief</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Confirmation Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        userRole === 'Field Operator'
          ? 'bg-blue-50/70 border-blue-200 text-blue-950'
          : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-blue-600">
            {userRole === 'Field Operator' ? 'tune' : 'verified_user'}
          </span>
          <div>
            <span className="font-semibold">
              {userRole === 'Field Operator' ? 'Field Operator Profile Active:' : 'Agronomy Director Profile Active:'}
            </span>{' '}
            <span>
              {userRole === 'Field Operator'
                ? 'Authorized for live valve pulse actuation, TDR probe calibration, and immediate irrigation dispatch.'
                : 'Authorized for purchase order approvals, P&L reporting, balance sheet ledger audits, and grower contracts.'}
            </span>
          </div>
        </div>
        <div className="font-data-mono font-medium text-slate-500 shrink-0">
          User ID: {userRole === 'Field Operator' ? 'OP-MARCUS-V4' : 'DIR-HAYES-E9'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CONDITIONAL ROLE CONTENT: FIELD OPERATOR VS AGRONOMY DIRECTOR             */}
      {/* ========================================================================= */}

      {userRole === 'Field Operator' ? (
        /* ================= FIELD OPERATOR COCKPIT ================= */
        <div className="space-y-8">
          {/* Key Field Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>SECTOR 4-B PROBE</span>
                <span className={currentOp.deficit === 'Deficit' ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                  {currentOp.deficit}
                </span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Volumetric Water Content</div>
              <div className={`text-3xl font-bold font-data-mono mt-1 ${currentOp.deficit === 'Deficit' ? 'text-rose-700' : 'text-slate-900'}`}>
                {currentOp.moisture}
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Safety floor: 20.0% · 2h 45m continuous</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>SCADA LINE PRESSURE</span>
                <span className="text-emerald-700 font-semibold">Online</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Hydraulic Flow Rate</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentOp.flowRate}</div>
              <div className="text-[11px] text-slate-500 mt-2">Operating at {currentOp.pressure} · Valve 4-B Open</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>WEATHER STATION #1</span>
                <span className="text-amber-700 font-semibold">High Heat</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Atmospheric Loss (ETc)</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentOp.et}</div>
              <div className="text-[11px] text-slate-500 mt-2">Solar: 820 W/m² · {currentOp.temp} Amb · RH: 26%</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>FLEET GATEWAY</span>
                <span className="text-emerald-700 font-semibold">100% Sync</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Probes Online</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentOp.sync}</div>
              <div className="text-[11px] text-slate-500 mt-2">LoRaWAN 915MHz · Latency: 38ms</div>
            </div>
          </div>

          {/* Quick Actuator Override Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  SCADA Field Actuator Overrides &amp; Presets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct physical commands dispatched to solenoid manifolds and center pivots
                </p>
              </div>
              <span className="text-xs font-data-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md font-semibold">
                SCADA Armed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900">VALVE-GRP-4B</span>
                    <span className="text-rose-700 font-semibold">Emergency</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-semibold">
                    Sector 4-B Corn V8 Root Recovery
                  </div>
                  <div className="text-[11px] text-slate-600 font-data-mono mt-2">
                    18,500 Gallons @ 420 GPM · 45 min pulse
                  </div>
                </div>
                <button
                  onClick={handleQuickTriggerValve}
                  disabled={isDispatching}
                  className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {isDispatching ? 'Actuating...' : 'Trigger Recovery Pulse'}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">PIVOT-SEC-02</span>
                    <span className="text-blue-700 font-semibold">Scheduled</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-semibold">
                    Sector 2 Alfalfa Center Pivot
                  </div>
                  <div className="text-[11px] text-slate-500 font-data-mono mt-2">
                    48,000 Gallons · 12 hour rotation cycle
                  </div>
                </div>
                <button
                  onClick={() => {
                    showToast('Pivot Sector 02 Scheduled rotation queued.');
                  }}
                  className="mt-4 w-full py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Start Pivot Rotation
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">VALVE-GRP-1A</span>
                    <span className="text-emerald-700 font-semibold">Fertigate</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1 font-semibold">
                    Sector 1-A Drip Fertigation Dosing
                  </div>
                  <div className="text-[11px] text-slate-500 font-data-mono mt-2">
                    22,000 Gal + 30 lbs/ac Nitrogen (UAN-32)
                  </div>
                </div>
                <button
                  onClick={() => {
                    showToast('Fertigation injection manifold primed for Sector 1-A.');
                  }}
                  className="mt-4 w-full py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Prime Fertigation
                </button>
              </div>
            </div>
          </div>

          {/* Sector Probe Telemetry Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Ground-Truth Field Telemetry Readouts
              </h3>
              <button
                onClick={() => onNavigate('telemetry-dispatch')}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Open Ground Logger Form →
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">Sector &amp; Hybrid Crop</th>
                    <th className="py-3 px-6 text-center">Depth</th>
                    <th className="py-3 px-6 text-center">Moisture (VWC)</th>
                    <th className="py-3 px-6 text-center">Soil Temp</th>
                    <th className="py-3 px-6 text-center">Salinity (EC)</th>
                    <th className="py-3 px-6 text-right">Field Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-rose-50/40">
                    <td className="py-3.5 px-6 font-semibold text-rose-950">
                      Sector 4-B (Corn V8 Hybrid)
                    </td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">30 cm</td>
                    <td className="py-3.5 px-6 text-center font-data-mono font-bold text-rose-700">{currentOp.moisture}</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-rose-900">28.9°C</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-rose-900">1.82 dS/m</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={handleQuickTriggerValve}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] cursor-pointer"
                      >
                        Actuate Valve
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      Sector 1-A (Alfalfa Center)
                    </td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">30 cm</td>
                    <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">31.2%</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">22.4°C</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">1.12 dS/m</td>
                    <td className="py-3.5 px-6 text-right font-medium text-emerald-700">Optimal</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      Sector 2-C (Soybean South)
                    </td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">60 cm</td>
                    <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">26.5%</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">24.1°C</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">1.35 dS/m</td>
                    <td className="py-3.5 px-6 text-right font-medium text-slate-600">Normal</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      Sector 7-C (Citrus Orchards)
                    </td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">90 cm</td>
                    <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">29.8%</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">21.8°C</td>
                    <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">1.05 dS/m</td>
                    <td className="py-3.5 px-6 text-right font-medium text-emerald-700">Optimal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ================= AGRONOMY DIRECTOR COCKPIT ================= */
        <div className="space-y-8">
          {/* Executive Capital & Financial Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>NET OPERATING INCOME</span>
                <span className="text-emerald-700 font-semibold font-data-mono">{currentDir.noiPercent} EBIT</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">EBIT Operating Run-Rate</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentDir.noiValue}</div>
              <div className="text-[11px] text-slate-500 mt-2">Gross Rev: $248.5k · Direct COGS: $114.2k</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>BALANCE SHEET INTEGRITY</span>
                <span className="text-blue-700 font-semibold font-data-mono">Verified</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Total Assets (A = L + E)</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentDir.assets}</div>
              <div className="text-[11px] text-slate-500 mt-2">Liabilities $490k + Farm Equity $930k</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>WATER CONSERVATION ROI</span>
                <span className="text-emerald-700 font-semibold font-data-mono">{currentDir.waterPercent}</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Water Conserved MTD</div>
              <div className="text-3xl font-bold text-blue-700 font-data-mono mt-1">{currentDir.waterValue}</div>
              <div className="text-[11px] text-slate-500 mt-2">4.2 bu / inch applied vs 3.4 baseline</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>BUDGET RECONCILIATION</span>
                <span className="text-emerald-700 font-semibold font-data-mono">Reconciled</span>
              </div>
              <div className="text-xs text-slate-700 mt-1">Q3 Budget Variance</div>
              <div className="text-3xl font-bold text-slate-900 font-data-mono mt-1">{currentDir.budget}</div>
              <div className="text-[11px] text-slate-500 mt-2">Planned $86.5k vs Actual $86.2k</div>
            </div>
          </div>

          {/* Sector Budget Variance Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Analytic Sector Expenditure Variance (Planned vs Actual)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cost center tracking for irrigation utilities, pumping energy, and agronomic consumables
                </p>
              </div>
              <button
                onClick={() => onNavigate('analytics-reporting')}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Executive Reporting Suite →
              </button>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">Cost Center / Sector</th>
                    <th className="py-3 px-6 text-right">Planned Budget</th>
                    <th className="py-3 px-6 text-right">Actual Realized</th>
                    <th className="py-3 px-6 text-right">Variance ($)</th>
                    <th className="py-3 px-6 text-right">Utilization</th>
                    <th className="py-3 px-6 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      Sector 1 (Wheat / Pivot Alpha)
                    </td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-600">$18,000.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono font-medium text-slate-900">$16,400.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-emerald-700 font-semibold">-$1,600.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-700">91.1%</td>
                    <td className="py-3.5 px-6 text-right font-medium text-emerald-700">Under Budget</td>
                  </tr>

                  <tr className="bg-amber-50/40">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      Sector 4-B (Corn V8 / Drip Bravo)
                    </td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-600">$32,000.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono font-medium text-slate-900">$35,800.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-amber-700 font-semibold">+$3,800.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-700">111.9%</td>
                    <td className="py-3.5 px-6 text-right font-medium text-amber-700">Heat Deficit Surge (+12%)</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      Sector 2 (Alfalfa / Linear 3)
                    </td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-600">$14,500.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono font-medium text-slate-900">$12,900.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-emerald-700 font-semibold">-$1,600.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-700">88.9%</td>
                    <td className="py-3.5 px-6 text-right font-medium text-emerald-700">Under Budget</td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      Sector 7 (Citrus / Micro-Sprinkler)
                    </td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-600">$22,000.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono font-medium text-slate-900">$21,100.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-600 font-semibold">-$900.00</td>
                    <td className="py-3.5 px-6 text-right font-data-mono text-slate-700">95.9%</td>
                    <td className="py-3.5 px-6 text-right font-medium text-slate-600">On Target</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Director Procurement Approval Queue */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Procurement Orders &amp; Vendor Authorization Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Director sign-off required for hardware spares &gt; $5,000 and fertilizer supply contracts
                </p>
              </div>
              <button
                onClick={() => onNavigate('financials')}
                className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
              >
                View Full Procurement Ledger →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono font-bold text-slate-900">PO-2025-0841</span>
                    <span className="font-semibold text-slate-800">Apex Pivot &amp; Pump Systems</span>
                    <span className="text-slate-500">· 12x Solenoid Manifolds</span>
                  </div>
                  <div className="text-slate-500">Analytic: Sector 4-B Irrigation Upgrade · Net 30 Days</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data-mono font-bold text-slate-900">$14,250.00</span>
                  <button
                    onClick={() => showToast('PO-2025-0841 Approved by Agronomy Director.')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium cursor-pointer"
                  >
                    Approve PO
                  </button>
                </div>
              </div>

              <div className="py-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-data-mono font-bold text-slate-900">PO-2025-0838</span>
                    <span className="font-semibold text-slate-800">BioNutrient Solutions LLC</span>
                    <span className="text-slate-500">· UAN-32 2,400 Gal Tanker</span>
                  </div>
                  <div className="text-slate-500">Analytic: East Acreage Fertigation · Batch #BIO-2025</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-data-mono font-bold text-slate-900">$8,600.00</span>
                  <button
                    onClick={() => showToast('PO-2025-0838 Authorized.')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium cursor-pointer"
                  >
                    Approve PO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
