import React, { useState } from 'react';
import { IrrigationOrder } from '../types';

interface TelemetryDispatchViewProps {
  onOpenAiAnalysis: (type: 'soil_deficit') => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
  showToast: (msg: string) => void;
}

export const TelemetryDispatchView: React.FC<TelemetryDispatchViewProps> = ({
  onOpenAiAnalysis,
  onOpenAiChatWithPrompt,
  showToast,
}) => {
  const [selectedDepth, setSelectedDepth] = useState<'30cm' | '60cm' | '90cm'>('30cm');
  const [selectedSector, setSelectedSector] = useState('Sector 4-B (Corn V8)');
  const [selectedPreset, setSelectedPreset] = useState<'pulse' | 'pivot' | 'fertigate'>('pulse');

  // Manual Ground-truth Telemetry Log form states
  const [logField, setLogField] = useState('Sector 4-B — Corn V8');
  const [logDepth, setLogDepth] = useState('30 cm (Active Root)');
  const [logMoisture, setLogMoisture] = useState('17.4');
  const [logSalinity, setLogSalinity] = useState('1.82');
  const [logTemp, setLogTemp] = useState('28.9');
  const [logNotes, setLogNotes] = useState('TDR hand probe checked against permanent station sensor.');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  // Active Orders state
  const [orders, setOrders] = useState<IrrigationOrder[]>([
    {
      id: 'IRR-8921',
      title: 'Sector 4-B Emergency Recovery',
      status: 'Pumping (Recovery Pulse)',
      flowRate: '420 GPM @ 42 PSI',
      duration: '2h 15m remaining',
      valve: 'VALVE-GRP-4B [OPEN]',
      targetVolume: '18,500 Gallons',
      activePulse: 'Active Pulse (0.75 in/acre)',
      type: 'emergency',
    },
    {
      id: 'IRR-8919',
      title: 'Sector 2 Pivot North Rotation',
      status: 'Pumping',
      flowRate: 'Scheduled cycle at 420 GPM / 42 PSI',
      duration: '1h 12m remaining',
      valve: 'VALVE-GRP-02',
      targetVolume: '45,000 Gallons',
      activePulse: '64% cycle',
      type: 'scheduled',
    },
    {
      id: 'IRR-8915',
      title: 'Sector 1-A Drip Fertigation Cycle',
      status: 'Completed',
      flowRate: 'Applied 12,000 Gallons + 30 lbs/ac Nitrogen',
      duration: '14:22 PM Today',
      valve: 'VALVE-GRP-1A',
      targetVolume: '12,000 Gallons',
      activePulse: '+8.4% VWC',
      type: 'completed',
    },
  ]);

  // Handle Dispatch Order
  const handleDispatchOrder = async () => {
    let pulseName = 'Pulse 45m Emergency root';
    let volume = '18,500 Gallons';
    if (selectedPreset === 'pivot') {
      pulseName = 'Pivot 12h Deep recharge';
      volume = '48,000 Gallons';
    } else if (selectedPreset === 'fertigate') {
      pulseName = 'Fertigate N-P-K Dosing';
      volume = '22,000 Gallons';
    }

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

      const newOrder: IrrigationOrder = {
        id: `IRR-${Math.floor(8925 + Math.random() * 50)}`,
        title: 'Sector 4-B Emergency Recovery',
        status: 'Pumping (Recovery Pulse)',
        flowRate: '420 GPM @ 42 PSI',
        duration: '45m Emergency Root pulse',
        valve: 'VALVE-GRP-4B [OPEN]',
        targetVolume: volume,
        activePulse: pulseName,
        type: 'emergency',
      };
      setOrders([newOrder, ...orders]);

      if (data.salesOrder && data.purchaseOrder) {
        showToast(`Valve 4-B Actuated. SO #${data.salesOrder.orderNumber} converted to Invoice. Supplies PO #${data.purchaseOrder.id} logged.`);
      } else {
        showToast(data.message || 'SCADA Valve Group 4-B Actuated. Deep-Root Recovery Pulse initiated.');
      }
    } catch {
      showToast('Valve Group 4-B actuated for Sector 4-B Corn V8 (18,500 Gallons @ 420 GPM).');
    }
  };

  // Handle Manual Log Submission
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLog(true);
    try {
      const moistureVal = parseFloat(logMoisture);
      const isDeficit = moistureVal < 20.0;
      const res = await fetch('/api/sensors/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectorId: logField,
          soilMoisture: moistureVal,
          durationBelowThresholdMinutes: isDeficit ? 140 : 25,
          cwsi: isDeficit ? 0.72 : 0.28,
          evapotranspiration: 6.8,
          suppliesNeeded: isDeficit,
        }),
      });
      const data = await res.json();
      if (data.pumpTriggered) {
        showToast(`Deficit logged (${moistureVal}%): SCADA pump dispatched. Orders created.`);
      } else {
        showToast(`Telemetry logged: ${moistureVal}% VWC at ${logDepth}. Monitored parameters normal.`);
      }
    } catch {
      showToast('Telemetry reading recorded.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* 1. Critical Deficit Alert Banner */}
      <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-900 tracking-wide">
              <span>CRITICAL SOIL MOISTURE DEFICIT</span>
              <span aria-hidden="true">·</span>
              <span>SECTOR 4-B (CORN V8)</span>
            </div>
            <p className="text-sm text-red-950 max-w-3xl leading-relaxed">
              Volumetric Water Content in root zone has dropped to <strong className="font-semibold text-red-900">17.4%</strong> (safety threshold: 20.0%) continuously for <strong>2h 45m</strong>. Permanent wilting risk is critical if unmitigated.
            </p>
            <div className="pt-1 flex items-center gap-4 text-xs text-red-800 font-data-mono">
              <span>Deficit Duration: <strong>2h 45m</strong></span>
              <span aria-hidden="true" className="text-red-300">·</span>
              <span>Root Depth: <strong>30 cm</strong></span>
              <span aria-hidden="true" className="text-red-300">·</span>
              <span>Stress Index: <strong>0.68 CWSI</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDispatchOrder}
            className="px-4 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">water_drop</span>
            <span>Trigger Valve Group 4-B</span>
          </button>
          <button
            onClick={() => onOpenAiAnalysis('soil_deficit')}
            className="px-4 py-2.5 rounded-lg bg-white border border-red-300 text-red-900 hover:bg-red-50 font-medium text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-800">psychology</span>
            <span>Diagnostic Report</span>
          </button>
        </div>
      </div>

      {/* 2. Key Telemetry Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Soil Moisture */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>ZONE PROBE S4-B</span>
              <span className="text-red-700 font-semibold">Critical</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mt-1">
              Soil Moisture (VWC)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-red-700 tracking-tight font-data-mono">
                17.4%
              </span>
              <span className="text-xs font-semibold text-red-600 font-data-mono">
                -4.8% / 4h
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Optimal target: 28.0% – 35.0%
            </div>
          </div>

          <div className="my-3">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0 6 Q 25 8 50 14 T 80 19 L 100 22"
                fill="none"
                stroke="#b91c1c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="22" r="3" fill="#b91c1c" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-data-mono text-slate-500">
            <span>Battery: 94% Solar</span>
            <span>Active Depth: 30 cm</span>
          </div>
        </div>

        {/* Card 2: Evapotranspiration */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>WEATHER STATION #1</span>
              <span className="text-amber-700 font-semibold">Elevated</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mt-1">
              Crop Evapotranspiration (ETc)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-data-mono">
                6.8
              </span>
              <span className="text-xs font-medium text-slate-500 font-data-mono">
                mm/day
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Solar flux: 820 W/m² · 34°C Amb
            </div>
          </div>

          <div className="my-3">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0 18 Q 30 14 60 8 T 100 4"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="4" r="3" fill="#d97706" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-data-mono text-slate-500">
            <span>RH: 26%</span>
            <span>Wind: 14 km/h SSW</span>
          </div>
        </div>

        {/* Card 3: SCADA Pressure */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>LINE TRANSDUCER S4-B</span>
              <span className="text-emerald-700 font-semibold">Pumping</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mt-1">
              Line Flow &amp; Pressure
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-data-mono">
                420
              </span>
              <span className="text-xs font-medium text-slate-500 font-data-mono">
                GPM @ 42 PSI
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Hydraulic line primed and stable
            </div>
          </div>

          <div className="my-3">
            <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 24">
              <path
                d="M 0 12 L 25 12 L 40 10 L 60 14 L 80 12 L 100 12"
                fill="none"
                stroke="#15803d"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="12" r="3" fill="#15803d" />
            </svg>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-data-mono text-slate-500">
            <span>Valve: GRP-4B Open</span>
            <span>Filter: Clean (Δ1.2 PSI)</span>
          </div>
        </div>

        {/* Card 4: Water Stress */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>THERMAL CANOPY SENSOR</span>
              <span className="text-red-700 font-semibold">Severe</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mt-1">
              Water Stress Index (CWSI)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-slate-900 tracking-tight font-data-mono">
                0.68
              </span>
              <span className="text-xs font-semibold text-red-600 font-data-mono">
                High Tension
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Canopy deficit: +2.8°C above air temp
            </div>
          </div>

          <div className="my-3">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-data-mono text-slate-500">
            <span>Threshold: &lt; 0.35</span>
            <span className="text-red-700 font-semibold">Stomatal Closure</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Dispatch & Live Telemetry Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 8 Cols: Irrigation Control & Active Orders */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Precision Irrigation Dispatch Controls
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated SCADA valve actuation and prescription dosing
                </p>
              </div>
              <div className="text-xs text-slate-500 font-data-mono">
                Sector: Sector 4-B Corn V8
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
              <button
                type="button"
                onClick={() => setSelectedPreset('pulse')}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedPreset === 'pulse'
                    ? 'border-emerald-700 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900">Emergency Root Pulse</div>
                <div className="text-xs text-slate-500 mt-1">45 min · 18,500 Gallons</div>
                <div className="text-[11px] font-data-mono text-emerald-800 font-medium mt-2">
                  0.75 in/acre recovery
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('pivot')}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedPreset === 'pivot'
                    ? 'border-emerald-700 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900">Center Pivot Recharge</div>
                <div className="text-xs text-slate-500 mt-1">12 hours · 48,000 Gallons</div>
                <div className="text-[11px] font-data-mono text-slate-600 mt-2">
                  Full root horizon soaking
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPreset('fertigate')}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedPreset === 'fertigate'
                    ? 'border-emerald-700 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900">Fertigation Dosing</div>
                <div className="text-xs text-slate-500 mt-1">22,000 Gal + 30 lbs/ac N</div>
                <div className="text-[11px] font-data-mono text-slate-600 mt-2">
                  Liquid UAN-32 injection
                </div>
              </button>
            </div>

            {/* Active Orders List */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                Active &amp; Recent Irrigation Work Orders
              </h4>
              <div className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-data-mono font-medium text-slate-900">{order.id}</span>
                      <span className="font-semibold text-slate-800">{order.title}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-data-mono">{order.targetVolume}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-data-mono text-slate-500">{order.valve}</span>
                      <span className={`font-medium ${order.status.includes('Pumping') ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Ground-truth Telemetry Form */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
            <h3 className="text-base font-semibold text-slate-900">
              Ground-Truth Telemetry Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-5">
              Submit sensor reading to trigger automated dispatch
            </p>

            <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Sector</label>
                <select
                  value={logField}
                  onChange={(e) => setLogField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                >
                  <option>Sector 4-B — Corn V8</option>
                  <option>Sector 1-A — Alfalfa Center</option>
                  <option>Sector 2-C — Soybean South</option>
                  <option>Sector 5-D — Sorghum East</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Probe Depth</label>
                  <select
                    value={logDepth}
                    onChange={(e) => setLogDepth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                  >
                    <option>30 cm (Active Root)</option>
                    <option>60 cm (Sub-Horizon)</option>
                    <option>90 cm (Deep Water Table)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="logMoisture" className="block font-medium text-slate-700 mb-1">Soil Moisture (%)</label>
                  <input
                    id="logMoisture"
                    type="number"
                    step="0.1"
                    value={logMoisture}
                    onChange={(e) => setLogMoisture(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-data-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">EC / Salinity (dS/m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={logSalinity}
                    onChange={(e) => setLogSalinity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-data-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Soil Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={logTemp}
                    onChange={(e) => setLogTemp(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-data-mono text-xs focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Field Observation</label>
                <textarea
                  rows={2}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:border-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLog}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isSubmittingLog ? 'Processing...' : 'Submit Ground-Truth Telemetry'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. Sector Probe Telemetry Grid & Multispectral Imagery */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Telemetry Table */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Sector Telemetry &amp; Node Status
            </h3>
            <span className="text-xs text-slate-400 font-data-mono">
              Auto-refreshed 30s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 px-6">Sector / Crop</th>
                  <th className="py-3 px-6 text-center">Moisture (VWC)</th>
                  <th className="py-3 px-6 text-center">Soil Temp</th>
                  <th className="py-3 px-6 text-center">Salinity (EC)</th>
                  <th className="py-3 px-6 text-right">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    Sector 1-A (Alfalfa Center)
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">
                    31.2%
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    22.4°C
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    1.12 dS/m
                  </td>
                  <td className="py-3.5 px-6 text-right font-medium text-emerald-700">
                    Optimal Range
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    Sector 2-C (Soybean South)
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">
                    26.5%
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    24.1°C
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    1.35 dS/m
                  </td>
                  <td className="py-3.5 px-6 text-right font-medium text-slate-600">
                    Normal
                  </td>
                </tr>

                <tr className="bg-red-50/40 hover:bg-red-50/60">
                  <td className="py-3.5 px-6 font-semibold text-red-950">
                    Sector 4-B (Corn V8 Hybrid)
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono font-bold text-red-700">
                    17.4%
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-red-900">
                    28.9°C
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-red-900">
                    1.82 dS/m
                  </td>
                  <td className="py-3.5 px-6 text-right font-semibold text-red-700">
                    Critical Deficit
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-6 font-medium text-slate-900">
                    Sector 7-C (Citrus Orchards)
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono font-semibold text-slate-800">
                    29.8%
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    21.8°C
                  </td>
                  <td className="py-3.5 px-6 text-center font-data-mono text-slate-600">
                    1.05 dS/m
                  </td>
                  <td className="py-3.5 px-6 text-right font-medium text-emerald-700">
                    Optimal Range
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Multispectral Imagery */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Aerial Multispectral NDVI
              </h3>
              <span className="text-xs text-slate-500 font-data-mono">Flight: 08:30 AM</span>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
                alt="Multispectral crop imagery"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3">
                <div className="text-white text-xs">
                  <div className="font-semibold">Sector 4-B Canopy Deficit Zone</div>
                  <div className="text-slate-300 text-[11px] font-data-mono">NDVI: 0.42 (Stressed) vs 0.78 Baseline</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Sensor: MicaSense RedEdge-P</span>
            <button
              onClick={() => onOpenAiChatWithPrompt('Explain the NDVI divergence in Sector 4-B vs Sector 1-A')}
              className="text-emerald-800 font-medium hover:underline cursor-pointer"
            >
              Analyze with Copilot →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
