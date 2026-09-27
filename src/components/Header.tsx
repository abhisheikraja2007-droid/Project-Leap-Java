import React from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  openAiChat: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  openAiChat,
  unreadCount = 1,
}) => {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40">
      <div className="w-full h-full px-8 flex items-center justify-between gap-6">
        {/* Left Section: Role switcher & unboxed live status */}
        <div className="flex items-center gap-5 flex-1">
          {/* High-visibility Role Toggle Segmented Control */}
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setUserRole('Field Operator')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                userRole === 'Field Operator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">sensors</span>
              <span>Field Operator</span>
            </button>
            <button
              onClick={() => setUserRole('Agronomy Director')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                userRole === 'Agronomy Director'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
              <span>Agronomy Director</span>
            </button>
          </div>

          {/* Dynamic Role-specific Live Metadata */}
          {userRole === 'Field Operator' ? (
            <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-500 font-normal">
              <span className="font-semibold text-slate-800">SCADA Active: Valve 4-B</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-data-mono text-blue-600 font-medium">420 GPM @ 42 PSI</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-data-mono text-rose-700 font-semibold">VWC 17.4% (Deficit)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>LoRaWAN 38ms</span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-2.5 text-xs text-slate-500 font-normal">
              <span className="font-semibold text-slate-800">Fiscal Q3 Kharif</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-data-mono text-emerald-700 font-semibold">EBIT $86.3k (+34.7%)</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>Solvency 3.17x</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-medium text-blue-700">GAAP / IFRS Mapped</span>
            </div>
          )}
        </div>

        {/* Right Section: Action Controls, Notifications & Profile */}
        <div className="flex items-center gap-3.5">
          {/* Restrained AI Advisor Trigger */}
          <button
            onClick={openAiChat}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            title="Open Agronomy AI Intelligence"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">psychology</span>
            <span>Agronomy Copilot</span>
          </button>

          <div className="h-5 w-px bg-slate-200"></div>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            type="button"
            title="System Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-600"></span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
              userRole === 'Field Operator' ? 'bg-blue-600' : 'bg-slate-900'
            }`}>
              {userRole === 'Field Operator' ? 'FO' : 'AD'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-900 leading-none">
                {userRole === 'Field Operator' ? 'Marcus Vance' : 'Dr. Evelyn Hayes'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {userRole === 'Field Operator' ? 'Lead Field Operator' : 'Director of Agronomy'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
