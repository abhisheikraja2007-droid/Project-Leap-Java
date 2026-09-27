import React, { useState, useEffect } from 'react';
import { ActiveTab, UserRole, Contact, PurchaseOrder } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { TelemetryDispatchView } from './views/TelemetryDispatchView';
import { MasterDataView } from './views/MasterDataView';
import { FinancialsView } from './views/FinancialsView';
import { AnalyticsReportingView } from './views/AnalyticsReportingView';
import { AiCopilotModal } from './components/AiCopilotModal';
import { AiAnalysisModal } from './components/AiAnalysisModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Field Operator');

  // AI Modal States
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatInitialPrompt, setAiChatInitialPrompt] = useState<string>('');
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [analysisType, setAnalysisType] = useState<'soil_deficit' | 'financial_variance'>('soil_deficit');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'Field Operator') {
      showToast('Switched to Field Operator mode: Real-time SCADA valve overrides & sensor telemetry active.');
    } else {
      showToast('Switched to Agronomy Director mode: Executive financials, P&L audit & PO approvals active.');
    }
  };

  // Contacts and Purchase Orders
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'AGR-C-8812',
      name: 'Marcus Vance',
      organization: 'Green Valley Agri Corp',
      type: 'farmer',
      email: 'marcus.vance@valleyagri.com',
      phone: '+1 (555) 234-8901',
      address: 'Parcel 12-B, Highway 44, Des Moines, IA 50309',
      terms: '1,200 Acres',
    },
    {
      id: 'AGR-C-4091',
      name: 'Helena Brandt',
      organization: 'BioNutrient Solutions LLC',
      type: 'supplier',
      email: 'h.brandt@bionutrient.com',
      phone: '+1 (555) 872-4412',
      address: '800 Agri-Commerce Way, Omaha, NE 68102',
      terms: 'Net 30 Days',
    },
    {
      id: 'AGR-C-3389',
      name: 'Apex Pivot & Pump Systems',
      organization: 'Irrigation Hardware & Telemetry',
      type: 'vendor',
      email: 'orders@apexpivots.com',
      phone: '+1 (555) 431-9080',
      address: '120 Industrial Pkwy, Lincoln, NE 68508',
      terms: 'Net 45 Days',
    },
    {
      id: 'AGR-C-6720',
      name: 'Dale K. Miller',
      organization: 'SunPrairie Orchards',
      type: 'farmer',
      email: 'dale@sunprairie.com',
      phone: '+1 (555) 902-1133',
      address: 'Sector 7-C, Fresno Road, Fresno, CA 93701',
      terms: '450 Acres',
    },
  ]);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-2025-0841',
      date: 'Feb 24, 2025',
      vendor: 'Apex Pivot & Pump Systems',
      category: 'Irrigation Hardware & Actuators',
      specification: '12x Precision Drip Manifolds, 4x Solenoid Valves (#APX-492-DRP)',
      analyticCenter: 'Sector 4-B Irrigation Upgrade',
      total: 14250.0,
      status: 'Bill Ready',
    },
    {
      id: 'PO-2025-0838',
      date: 'Feb 22, 2025',
      vendor: 'BioNutrient Solutions LLC',
      category: 'Fertigation & Micro-Nutrients',
      specification: 'Liquid Nitrogen (UAN 32), 2,400 Gal Tanker (Batch #BIO-2025-Q1-N32)',
      analyticCenter: 'East Acreage Fertigation',
      total: 8600.0,
      status: 'Dispatched',
    },
    {
      id: 'PO-2025-0833',
      date: 'Feb 18, 2025',
      vendor: 'SensorGrid Labs',
      category: 'IoT Telemetry & LoRa Probes',
      specification: '25x Soil Moisture Capacitive Probes (Multi-Depth) LoRaWAN 915MHz v3',
      analyticCenter: 'Gateway Expansion Q1',
      total: 6250.0,
      status: 'Paid & Received',
    },
    {
      id: 'PO-2025-0829',
      date: 'Feb 14, 2025',
      vendor: 'HydroFlow Electric Co',
      category: 'Heavy Pumping & High Voltage',
      specification: 'Deep Well Submersible Pump 75HP 460V 3PH Stainless Bronze',
      analyticCenter: 'Wellhead Station #3',
      total: 19100.0,
      status: 'Billed (Due Net 30)',
    },
  ]);

  // Initial fetch from backend if available
  useEffect(() => {
    fetch('/api/v1/contacts')
      .then((r) => r.json())
      .then((d) => {
        if (d.contacts && d.contacts.length > 0) setContacts(d.contacts);
      })
      .catch(() => {});

    fetch('/api/v1/finance/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.purchaseOrders && d.purchaseOrders.length > 0) setPurchaseOrders(d.purchaseOrders);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleAddContact = async (newContact: Partial<Contact>) => {
    try {
      const response = await fetch('/api/v1/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact),
      });
      const data = await response.json();
      if (data.contact) {
        setContacts([data.contact, ...contacts]);
      } else {
        const localC: Contact = {
          id: `AGR-C-${Math.floor(1000 + Math.random() * 9000)}`,
          name: newContact.name || 'Unknown',
          organization: newContact.organization || '',
          type: newContact.type || 'farmer',
          email: newContact.email || '',
          phone: newContact.phone || '',
          address: newContact.address || '',
          terms: newContact.terms || '',
        };
        setContacts([localC, ...contacts]);
      }
    } catch {
      const localC: Contact = {
        id: `AGR-C-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newContact.name || 'Unknown',
        organization: newContact.organization || '',
        type: newContact.type || 'farmer',
        email: newContact.email || '',
        phone: newContact.phone || '',
        address: newContact.address || '',
        terms: newContact.terms || '',
      };
      setContacts([localC, ...contacts]);
    }
  };

  const handleAddPurchaseOrder = async (newPO: Partial<PurchaseOrder>) => {
    try {
      const response = await fetch('/api/v1/finance/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPO),
      });
      const data = await response.json();
      if (data.order) {
        setPurchaseOrders([data.order, ...purchaseOrders]);
      } else {
        const localPO: PurchaseOrder = {
          id: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          vendor: newPO.vendor || 'Apex Pivot',
          category: newPO.category || 'Agri Hardware',
          specification: newPO.specification || 'Precision DTO Item',
          analyticCenter: newPO.analyticCenter || 'Sector 4-B',
          total: newPO.total || 4320.0,
          status: 'Bill Ready',
        };
        setPurchaseOrders([localPO, ...purchaseOrders]);
      }
    } catch {
      const localPO: PurchaseOrder = {
        id: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        vendor: newPO.vendor || 'Apex Pivot',
        category: newPO.category || 'Agri Hardware',
        specification: newPO.specification || 'Precision DTO Item',
        analyticCenter: newPO.analyticCenter || 'Sector 4-B',
        total: newPO.total || 4320.0,
        status: 'Bill Ready',
      };
      setPurchaseOrders([localPO, ...purchaseOrders]);
    }
  };

  const openAiChatWithPrompt = (prompt: string) => {
    setAiChatInitialPrompt(prompt);
    setIsAiChatOpen(true);
  };

  const openAiAnalysis = (type: 'soil_deficit' | 'financial_variance') => {
    setAnalysisType(type);
    setIsAiAnalysisOpen(true);
  };

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased font-body-md">
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAiChat={() => {
          setAiChatInitialPrompt('');
          setIsAiChatOpen(true);
        }}
      />

      {/* Main Container with 72 (18rem) left padding for fixed sidebar */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Persistent Top Header */}
        <Header
          userRole={userRole}
          setUserRole={handleRoleChange}
          openAiChat={() => {
            setAiChatInitialPrompt('');
            setIsAiChatOpen(true);
          }}
          unreadCount={activeTab === 'telemetry-dispatch' || activeTab === 'dashboard' ? 1 : 0}
        />

        {/* Dynamic View Body */}
        <main className="w-full pt-16 flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView
              userRole={userRole}
              onNavigate={setActiveTab}
              onOpenAiAnalysis={openAiAnalysis}
              onOpenAiChatWithPrompt={openAiChatWithPrompt}
              showToast={showToast}
            />
          )}

          {activeTab === 'telemetry-dispatch' && (
            <TelemetryDispatchView
              onOpenAiAnalysis={openAiAnalysis}
              onOpenAiChatWithPrompt={openAiChatWithPrompt}
              showToast={showToast}
            />
          )}

          {activeTab === 'master-data' && (
            <MasterDataView
              contacts={contacts}
              onAddContact={handleAddContact}
              showToast={showToast}
              onOpenAiChatWithPrompt={openAiChatWithPrompt}
            />
          )}

          {activeTab === 'financials' && (
            <FinancialsView
              purchaseOrders={purchaseOrders}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              showToast={showToast}
              onOpenAiChatWithPrompt={openAiChatWithPrompt}
            />
          )}

          {activeTab === 'analytics-reporting' && (
            <AnalyticsReportingView
              onOpenAiAnalysis={openAiAnalysis}
              onOpenAiChatWithPrompt={openAiChatWithPrompt}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Gemini AI Multi-turn Chatbot Modal */}
      <AiCopilotModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        userRole={userRole}
        initialPrompt={aiChatInitialPrompt}
      />

      {/* Gemini Deep Diagnostic Analysis Modal */}
      <AiAnalysisModal
        isOpen={isAiAnalysisOpen}
        onClose={() => setIsAiAnalysisOpen(false)}
        taskType={analysisType}
        onActionTrigger={(action) => {
          if (action === 'pulse-valve') {
            showToast('SCADA Valve Group 4-B Actuated! Deep-Root Recovery Pulse initiated (18,500 Gallons @ 420 GPM).');
          } else if (action === 'open-po') {
            setActiveTab('financials');
            showToast('Switched to Financials view to adjust procurement POs.');
          }
        }}
      />

      {/* Universal Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0f172a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-bounce [animation-duration:1s] [animation-iteration-count:1] border border-slate-700 max-w-lg">
          <span className="material-symbols-outlined text-[22px] text-[#95f8a7]">check_circle</span>
          <span className="text-[13px] font-medium leading-snug">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-auto text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
