import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openAiChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openAiChat,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Operations Dashboard',
      icon: 'dashboard',
      badge: 'Live',
    },
    {
      id: 'telemetry-dispatch' as ActiveTab,
      label: 'Telemetry & Dispatch',
      icon: 'sensors',
      badge: null,
    },
    {
      id: 'master-data' as ActiveTab,
      label: 'Master Data Registry',
      icon: 'dataset',
      badge: null,
    },
    {
      id: 'financials' as ActiveTab,
      label: 'Financials & Orders',
      icon: 'account_balance_wallet',
      badge: null,
    },
    {
      id: 'analytics-reporting' as ActiveTab,
      label: 'Executive Analytics',
      icon: 'monitoring',
      badge: null,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand & Wordmark */}
        <div className="px-6 h-16 flex items-center gap-3 border-b border-slate-200/80">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            AP
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-base text-slate-900 font-bold tracking-tight">
              AgriPulse OS
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Precision Resource Platform
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[19px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Intelligence
          </div>

          {/* AI Advisor Button */}
          <button
            onClick={openAiChat}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-medium transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[19px] text-emerald-800 group-hover:scale-105 transition-transform">
                psychology
              </span>
              <span>Agronomy Copilot</span>
            </div>
            <span className="text-[11px] text-slate-400">⌘K</span>
          </button>
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 mx-3 mb-3 rounded-lg bg-slate-50 border border-slate-200/80">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-600 font-medium">Telemetry Nodes</span>
          <span className="text-emerald-700 font-semibold">24 Online</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Last sync: Just now</span>
          <span className="font-data-mono">420 GPM</span>
        </div>
      </div>
    </aside>
  );
};
