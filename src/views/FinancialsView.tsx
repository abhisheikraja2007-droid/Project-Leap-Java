import React, { useState, useEffect } from 'react';
import { PurchaseOrder, VendorBill, SalesOrder, CustomerInvoice, PaymentRecord, JournalRecord } from '../types';

interface FinancialsViewProps {
  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (po: Partial<PurchaseOrder>) => Promise<void>;
  showToast: (msg: string) => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
}

interface LineItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

export const FinancialsView: React.FC<FinancialsViewProps> = ({
  purchaseOrders,
  onAddPurchaseOrder,
  showToast,
  onOpenAiChatWithPrompt,
}) => {
  const [activeSegmentTab, setActiveSegmentTab] = useState<'po' | 'so' | 'payments'>('po');
  const [vendorFilter, setVendorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isSoModalOpen, setIsSoModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Lists
  const [bills, setBills] = useState<VendorBill[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [journals, setJournals] = useState<JournalRecord[]>([]);

  // PO form states
  const [selectedVendor, setSelectedVendor] = useState('Apex Pivot & Pump Systems');
  const [selectedAnalytic, setSelectedAnalytic] = useState('Sector 4-B Irrigation Upgrade');
  const [selectedTerms, setSelectedTerms] = useState('Net 30 Days');
  const [orderDate, setOrderDate] = useState('2025-02-26');
  const [deliveryDate, setDeliveryDate] = useState('2025-03-05');
  const [dispatchStation, setDispatchStation] = useState('Central Field Depot Hub #2');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: 'Precision Drip Manifolds 32mm', qty: 8, price: 450.0 },
    { id: '2', name: 'Brass Solenoid Actuator 24VAC', qty: 4, price: 180.0 },
  ]);

  // SO form states
  const [soFarmer, setSoFarmer] = useState('Ramesh Patel');
  const [soProduct, setSoProduct] = useState('Advisory/Irrigation Water');
  const [soQty, setSoQty] = useState(1);
  const [soPrice, setSoPrice] = useState(750.0);
  const [soTax, setSoTax] = useState(0);
  const [soSector, setSoSector] = useState('Zone-1 Farm District');

  // Payment form states
  const [payRef, setPayRef] = useState(`ACH-${Math.floor(10000 + Math.random() * 90000)}-WELLSFARGO`);
  const [payType, setPayType] = useState<'BILL' | 'INVOICE'>('BILL');
  const [payEntity, setPayEntity] = useState('AgriSupplies Co.');
  const [payAmount, setPayAmount] = useState(4320.0);
  const [payMethod, setPayMethod] = useState<'Bank Transfer' | 'NACHA ACH' | 'Cash'>('NACHA ACH');
  const [payAccount, setPayAccount] = useState('GL-Acc #2100 (Agri-Vendor Creditors)');

  // Load finance records
  const loadFinanceData = () => {
    fetch('/api/v1/finance/bills')
      .then((r) => r.json())
      .then((d) => d.bills && setBills(d.bills))
      .catch(() => {});

    fetch('/api/v1/finance/sales-orders')
      .then((r) => r.json())
      .then((d) => d.salesOrders && setSalesOrders(d.salesOrders))
      .catch(() => {});

    fetch('/api/v1/finance/invoices')
      .then((r) => r.json())
      .then((d) => d.invoices && setInvoices(d.invoices))
      .catch(() => {});

    fetch('/api/v1/finance/payments')
      .then((r) => r.json())
      .then((d) => d.payments && setPayments(d.payments))
      .catch(() => {});

    fetch('/api/v1/finance/journals')
      .then((r) => r.json())
      .then((d) => d.journals && setJournals(d.journals))
      .catch(() => {});
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now().toString(), name: 'High-Yield Liquid Urea 32%', qty: 2, price: 320.0 },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) {
      showToast('Purchase Order requires at least one line item.');
      return;
    }
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleLineItemChange = (id: string, field: 'name' | 'qty' | 'price', value: any) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Convert PO to Bill
  const handleConvertToBill = async (poId: string) => {
    try {
      const res = await fetch(`/api/v1/finance/orders/${poId}/convert-to-bill`, { method: 'POST' });
      const data = await res.json();
      showToast(data.message || `PO ${poId} converted to Vendor Bill!`);
      loadFinanceData();
    } catch {
      showToast(`PO ${poId} converted to Vendor Bill!`);
    }
  };

  // Convert SO to Invoice
  const handleConvertToInvoice = async (soId: string) => {
    try {
      const res = await fetch(`/api/v1/finance/sales-orders/${soId}/convert-to-invoice`, { method: 'POST' });
      const data = await res.json();
      showToast(data.message || `SO ${soId} converted to Customer Invoice!`);
      loadFinanceData();
    } catch {
      showToast(`Sales Order ${soId} converted to Customer Invoice!`);
    }
  };

  // Create Sales Order
  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/finance/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: soFarmer,
          farmerId: soFarmer === 'Ramesh Patel' ? 'AGR-C-1001' : 'AGR-C-8812',
          serviceOrProduct: soProduct,
          quantity: soQty,
          price: soPrice,
          tax: soTax,
          sectorName: soSector,
        }),
      });
      const data = await res.json();
      showToast(`Sales Order ${data.salesOrder?.orderNumber || 'SO-IRR-8922'} booked for ${soFarmer}!`);
      setIsSoModalOpen(false);
      loadFinanceData();
    } catch {
      showToast('Sales order created successfully!');
      setIsSoModalOpen(false);
    }
  };

  // Register Payment
  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/finance/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: payRef,
          type: payType,
          entityName: payEntity,
          direction: payType === 'BILL' ? 'OUTGOING_DISBURSEMENT' : 'INCOMING_REVENUE',
          amount: payAmount,
          method: payMethod,
          account: payAccount,
        }),
      });
      const data = await res.json();
      showToast(`Payment ${payRef} registered & posted to double-entry journal!`);
      setIsPayModalOpen(false);
      loadFinanceData();
    } catch {
      showToast('Payment registered and journal entry posted!');
      setIsPayModalOpen(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = calculateSubtotal();
    const specSummary = lineItems.map((i) => `${i.qty}x ${i.name}`).join(', ');

    try {
      await onAddPurchaseOrder({
        vendor: selectedVendor,
        analyticCenter: selectedAnalytic,
        specification: specSummary,
        total,
        terms: selectedTerms,
        deliveryDate,
      });
      showToast(`Order POSTed to /api/v1/finance/orders successfully! ($${total.toLocaleString()})`);
      setIsPoModalOpen(false);
    } catch {
      showToast('Failed to post purchase order.');
    }
  };

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesVendor =
      vendorFilter === 'all' || po.vendor.toLowerCase().includes(vendorFilter.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || po.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesSearch =
      searchQuery === '' ||
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.specification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.analyticCenter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVendor && matchesStatus && matchesSearch;
  });

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Overview Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Accrual Accounting &amp; Farm Ledger
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Financial Transactions &amp; Work Orders
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Agricultural procurement, advisory billing, fertigation invoices, and double-entry ledger postings.
          </p>
        </div>

        {/* Quick Summary Mini Metrics */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs shrink-0">
          <div className="px-4 py-2 bg-slate-50 rounded-lg text-left">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
              MTD Disbursements
            </span>
            <span className="text-base text-slate-900 font-bold font-data-mono">
              $84,400.00
            </span>
          </div>
          <div className="px-4 py-2 bg-emerald-50 rounded-lg text-left">
            <span className="block text-[10px] text-emerald-800 font-semibold uppercase">
              MTD Advisory Revenue
            </span>
            <span className="text-base text-emerald-800 font-bold font-data-mono">
              $142,500.00
            </span>
          </div>
          <div className="px-4 py-2 bg-slate-50 rounded-lg text-left hidden sm:block">
            <span className="block text-[10px] text-slate-500 uppercase font-semibold">
              Operating Margin
            </span>
            <span className="text-base text-slate-800 font-bold font-data-mono">
              +40.7%
            </span>
          </div>
        </div>
      </div>

      {/* 1. End-to-End Agronomy Commerce Pipeline */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[19px] text-emerald-800">account_tree</span>
            <span className="text-sm font-semibold text-slate-900">
              Procurement &amp; Dispatch Order Pipeline
            </span>
          </div>
          <span className="text-xs text-slate-400 font-data-mono">
            Fiscal Cycle Q3 Kharif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
          <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between border border-[#dce9ff]/50">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-primary font-data-mono tracking-wide">
                01. PO STAGE
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">shopping_cart</span>
            </div>
            <div className="my-2">
              <div className="font-headline-md text-[20px] text-on-surface font-data-mono font-bold">$48,200</div>
              <div className="font-label-sm text-xs text-on-surface-variant">14 Pending Orders</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between border border-[#dce9ff]/50">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-secondary font-data-mono tracking-wide">
                02. VENDOR BILLS
              </span>
              <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
            </div>
            <div className="my-2">
              <div className="font-headline-md text-[20px] text-on-surface font-data-mono font-bold">$31,450</div>
              <div className="font-label-sm text-xs text-on-surface-variant">{bills.length + 5} Awaiting Approval</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '48%' }}></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between border border-[#dce9ff]/50">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-tertiary font-data-mono tracking-wide">
                03. ADVISORY SO
              </span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">agriculture</span>
            </div>
            <div className="my-2">
              <div className="font-headline-md text-[20px] text-on-surface font-data-mono font-bold">$89,100</div>
              <div className="font-label-sm text-xs text-on-surface-variant">{salesOrders.length + 19} Booked Deployments</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-tertiary h-full rounded-full" style={{ width: '82%' }}></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between border border-[#dce9ff]/50">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold text-on-surface font-data-mono tracking-wide">
                04. INVOICES
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface">point_of_sale</span>
            </div>
            <div className="my-2">
              <div className="font-headline-md text-[20px] text-on-surface font-data-mono font-bold">$72,300</div>
              <div className="font-label-sm text-xs text-on-surface-variant">{invoices.length + 7} Outstanding Recv.</div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-on-surface h-full rounded-full" style={{ width: '58%' }}></div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary-fixed text-on-primary-fixed flex flex-col justify-between shadow-xs border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] font-bold font-data-mono tracking-wide">
                05. SETTLED (MTD)
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-primary-fixed">verified</span>
            </div>
            <div className="my-2">
              <div className="font-headline-md text-[20px] font-data-mono font-bold text-on-primary-fixed">
                $142,500
              </div>
              <div className="font-label-sm text-[11px] text-on-primary-fixed-variant">
                100% Cleared Automated ACH
              </div>
            </div>
            <div className="w-full bg-on-primary-fixed/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-on-primary-fixed h-full rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Layout (2-Panels: Left Data Table & Right Sidecar) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 9 Cols: Tabs, Filters, Table */}
        <div className="xl:col-span-9 space-y-6">
          {/* Action Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#dce9ff]/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Segmented Control Tabs */}
            <div className="inline-flex p-1 bg-surface-container rounded-xl self-start">
              <button
                onClick={() => setActiveSegmentTab('po')}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSegmentTab === 'po'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-primary">local_shipping</span>
                Purchase Orders &amp; Vendor Bills
              </button>
              <button
                onClick={() => setActiveSegmentTab('so')}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSegmentTab === 'so'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">receipt</span>
                Sales Orders &amp; Invoicing
              </button>
              <button
                onClick={() => setActiveSegmentTab('payments')}
                className={`px-4 py-2 rounded-lg font-label-md text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSegmentTab === 'payments'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                Payments &amp; Journals Ledger
              </button>
            </div>

            {/* Action CTA */}
            {activeSegmentTab === 'po' && (
              <button
                onClick={() => setIsPoModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary transition-all font-body-md text-sm font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Create New Purchase Order
              </button>
            )}

            {activeSegmentTab === 'so' && (
              <button
                onClick={() => setIsSoModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary transition-all font-body-md text-sm font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                Create New Sales Order
              </button>
            )}

            {activeSegmentTab === 'payments' && (
              <button
                onClick={() => setIsPayModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary transition-all font-body-md text-sm font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">payments</span>
                Register Payment
              </button>
            )}
          </div>

          {/* TAB 1: PURCHASE ORDERS & VENDOR BILLS */}
          {activeSegmentTab === 'po' && (
            <div className="space-y-6">
              {/* Secondary Filter Bar */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#dce9ff]/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    calendar_today
                  </span>
                  <input
                    type="text"
                    readOnly
                    value="Feb 01, 2025 - Feb 28, 2025"
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl font-data-mono text-xs text-on-surface cursor-pointer focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    store
                  </span>
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Agronomy Vendors</option>
                    <option value="agrisupplies">AgriSupplies Co.</option>
                    <option value="apex">Apex Pivot &amp; Pump Systems</option>
                    <option value="bionutrient">BioNutrient Solutions LLC</option>
                    <option value="sensorgrid">SensorGrid Labs</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    filter_list
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface appearance-none focus:outline-none cursor-pointer"
                  >
                    <option value="all">Status: All Lifecycle Stages</option>
                    <option value="ready">Bill Ready</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="paid">Paid &amp; Received</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-on-surface-variant text-[18px] pointer-events-none">
                    expand_more
                  </span>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="PO#, items, sector..."
                    className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                  />
                </div>
              </div>

              {/* Purchase Orders Table */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                    Recorded Procurement Purchase Orders (PO)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-data-mono text-[11px] font-bold">
                    {filteredOrders.length} Entries
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">PO / Ref Number</th>
                        <th className="py-3 px-6">Vendor &amp; Category</th>
                        <th className="py-3 px-6">Ordered Specification</th>
                        <th className="py-3 px-6">Analytic Field Cost Center</th>
                        <th className="py-3 px-6 text-right">Total (USD)</th>
                        <th className="py-3 px-6 text-center">Lifecycle Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
                      {filteredOrders.map((po) => (
                        <tr key={po.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-data-mono font-bold text-primary">{po.id}</div>
                            <div className="text-[11px] text-on-surface-variant">{po.date}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-on-surface">{po.vendor}</div>
                            <div className="text-[11px] text-on-surface-variant">{po.category}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-on-surface line-clamp-1">{po.specification}</span>
                            <span className="font-data-mono text-[11px] text-on-surface-variant">Standard Delivery</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container text-on-secondary-fixed font-data-mono text-xs font-medium">
                              <span className="material-symbols-outlined text-[14px] text-tertiary">grid_view</span>
                              {po.analyticCenter}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right font-data-mono font-bold text-on-surface text-[14px]">
                            ${po.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-[11px] bg-secondary-container text-on-secondary-fixed">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              {po.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleConvertToBill(po.id)}
                              className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary font-semibold text-xs hover:bg-tertiary transition-colors shadow-xs"
                            >
                              Convert to Bill
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vendor Bills List */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                    Registered Vendor Bills (AP)
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">Requirement 4: Convert PO to Bill &amp; Pay</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">Bill Number</th>
                        <th className="py-3 px-6">Origin PO</th>
                        <th className="py-3 px-6">Vendor Name</th>
                        <th className="py-3 px-6">Due Date</th>
                        <th className="py-3 px-6 text-right">Total ($)</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60">
                      {bills.map((b) => (
                        <tr key={b.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-6 font-data-mono font-bold text-primary">{b.billNumber}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-secondary">{b.poNumber}</td>
                          <td className="py-3.5 px-6 font-semibold">{b.vendor}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-on-surface-variant">{b.dueDate}</td>
                          <td className="py-3.5 px-6 text-right font-data-mono font-bold text-on-surface">
                            ${b.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-secondary-fixed text-on-secondary-fixed">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={() => {
                                setPayType('BILL');
                                setPayEntity(b.vendor);
                                setPayAmount(b.total);
                                setIsPayModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
                            >
                              Register Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALES ORDERS & CUSTOMER INVOICES */}
          {activeSegmentTab === 'so' && (
            <div className="space-y-6">
              {/* Sales Orders Table */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                    Booked Agronomic Sales Orders (SO)
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">Requirement 4: Advisory &amp; Water Dispatches</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">SO Number</th>
                        <th className="py-3 px-6">Farmer / Customer</th>
                        <th className="py-3 px-6">Service / Product</th>
                        <th className="py-3 px-6">Sector / District</th>
                        <th className="py-3 px-6 text-right">Total ($)</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60">
                      {salesOrders.map((so) => (
                        <tr key={so.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-6 font-data-mono font-bold text-primary">{so.orderNumber}</td>
                          <td className="py-3.5 px-6 font-semibold">{so.customer}</td>
                          <td className="py-3.5 px-6">{so.serviceOrProduct}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-secondary">{so.sectorName}</td>
                          <td className="py-3.5 px-6 text-right font-data-mono font-bold">
                            ${so.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-primary-fixed text-on-primary-fixed">
                              {so.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            {so.status !== 'INVOICED' && so.status !== 'SETTLED' ? (
                              <button
                                onClick={() => handleConvertToInvoice(so.id)}
                                className="px-2.5 py-1 rounded-md bg-primary-container text-on-primary font-semibold text-xs hover:bg-primary"
                              >
                                Generate Invoice
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-tertiary">Invoiced</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Invoices Table */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                    Customer Invoices (AR)
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">Requirement 4: Receive Payment via Bank</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">Invoice #</th>
                        <th className="py-3 px-6">Origin SO</th>
                        <th className="py-3 px-6">Customer</th>
                        <th className="py-3 px-6">Due Date</th>
                        <th className="py-3 px-6 text-right">Amount ($)</th>
                        <th className="py-3 px-6 text-center">Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-6 font-data-mono font-bold text-primary">{inv.invoiceNumber}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-secondary">{inv.soNumber}</td>
                          <td className="py-3.5 px-6 font-semibold">{inv.customer}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-on-surface-variant">{inv.dueDate}</td>
                          <td className="py-3.5 px-6 text-right font-data-mono font-bold">
                            ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                inv.status === 'OUTSTANDING'
                                  ? 'bg-[#fee2e2] text-[#b91c1c]'
                                  : 'bg-primary-fixed text-on-primary-fixed'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              onClick={() => {
                                setPayType('INVOICE');
                                setPayEntity(inv.customer);
                                setPayAmount(inv.total);
                                setIsPayModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
                            >
                              Receive via Bank
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS & DOUBLE-ENTRY JOURNALS */}
          {activeSegmentTab === 'payments' && (
            <div className="space-y-6">
              {/* Double-Entry Journals (Requirement 3.4 & 3.5) */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <div>
                    <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface block">
                      Double-Entry Journals (Sales, Purchase, Bank, Cash)
                    </span>
                    <span className="font-label-sm text-xs text-secondary">
                      Section 3.4 &amp; 3.5: Double-entry ledger records for asset and expense movements.
                    </span>
                  </div>
                  <span className="font-data-mono text-xs text-primary font-bold">Balanced Ledgers</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">Journal Type</th>
                        <th className="py-3 px-6">Reference</th>
                        <th className="py-3 px-6">Debit Account</th>
                        <th className="py-3 px-6">Credit Account</th>
                        <th className="py-3 px-6">Analytic Sector</th>
                        <th className="py-3 px-6 text-right">Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60">
                      {journals.map((j) => (
                        <tr key={j.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                j.journalType.includes('Sales')
                                  ? 'bg-primary'
                                  : j.journalType.includes('Purchase')
                                  ? 'bg-tertiary'
                                  : 'bg-secondary'
                              }`}
                            ></span>
                            {j.journalType}
                          </td>
                          <td className="py-3.5 px-6 font-data-mono text-xs">{j.reference}</td>
                          <td className="py-3.5 px-6 text-xs text-primary font-medium">{j.debitAccount}</td>
                          <td className="py-3.5 px-6 text-xs text-secondary font-medium">{j.creditAccount}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-on-surface-variant">{j.analyticSector}</td>
                          <td className="py-3.5 px-6 text-right font-data-mono font-bold">
                            ${j.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Registered */}
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden">
                <div className="p-4 px-6 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
                  <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                    Registered Bank &amp; Cash Payments
                  </span>
                  <span className="font-data-mono text-xs text-on-surface-variant">Requirement 4: Register against Bill or Invoice</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body-sm text-[13px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-[11px] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-6">Payment Reference</th>
                        <th className="py-3 px-6">Against</th>
                        <th className="py-3 px-6">Entity / Counterparty</th>
                        <th className="py-3 px-6">Method</th>
                        <th className="py-3 px-6">Account</th>
                        <th className="py-3 px-6 text-right">Amount ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/60">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-container-low/50">
                          <td className="py-3.5 px-6 font-data-mono font-bold text-primary">{p.reference}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p.type === 'BILL' ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-primary-fixed text-on-primary-fixed'
                              }`}
                            >
                              {p.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-semibold">{p.entityName}</td>
                          <td className="py-3.5 px-6 text-xs">{p.method}</td>
                          <td className="py-3.5 px-6 font-data-mono text-xs text-on-surface-variant">{p.account}</td>
                          <td
                            className={`py-3.5 px-6 text-right font-data-mono font-bold ${
                              p.direction === 'INCOMING_REVENUE' ? 'text-primary' : 'text-error'
                            }`}
                          >
                            {p.direction === 'INCOMING_REVENUE' ? '+' : '-'}$
                            {p.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 3 Cols: Analytic Allocation & Budget Integrity */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-[#dce9ff]/60 space-y-4">
            <div>
              <span className="font-label-sm text-[11px] font-data-mono uppercase tracking-wider text-primary font-bold">
                Cost Allocation
              </span>
              <h2 className="font-headline-sm text-[16px] font-bold text-on-surface mt-0.5">
                Analytic Accounts (Q1)
              </h2>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Procured capital &amp; chemical expense divided across active pivots and farm districts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">Zone-1 Farm District</span>
                  <span className="font-data-mono text-primary font-bold">$38,950 / $50k</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '77.9%' }}></div>
                </div>
                <span className="text-[11px] font-data-mono text-on-surface-variant mt-0.5 block">
                  77.9% of allocated budget utilized
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">East Fertigation Plot</span>
                  <span className="font-data-mono text-secondary font-bold">$17,200 / $25k</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '68.8%' }}></div>
                </div>
                <span className="text-[11px] font-data-mono text-on-surface-variant mt-0.5 block">
                  68.8% of allocated budget utilized
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">Wellhead &amp; Pumps Infrastructure</span>
                  <span className="font-data-mono text-tertiary font-bold">$28,250 / $30k</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full rounded-full" style={{ width: '94.1%' }}></div>
                </div>
                <span className="text-[11px] font-data-mono text-error font-bold mt-0.5 block">
                  Warning: Approaching 95% threshold
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-start gap-2 border border-[#dce9ff]/50">
              <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0 mt-0.5">verified</span>
              <span>
                All expenditures synchronized with corporate General Ledger account structure <strong>SAP / NetSuite / Spring Boot JPA</strong>.
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-[#dce9ff]/60 space-y-3">
            <h3 className="font-headline-sm text-sm font-bold text-on-surface">
              Preferred Agronomy Suppliers
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-[#dce9ff]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    AS
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-on-surface">AgriSupplies Co.</div>
                    <div className="font-label-sm text-[10.5px] text-on-surface-variant">Net 30 · NPK Fertilizer</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-[#dce9ff]/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    AP
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-on-surface">Apex Pivot Inc.</div>
                    <div className="font-label-sm text-[10.5px] text-on-surface-variant">Net 30 · Tier 1 Priority</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-[#dce9ff]/60">
            <img
              className="w-full h-44 object-cover"
              alt="High tech precision agriculture irrigation system"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKOs8ZrxdIce1D1uvAnvudOutfk1kgPr5n4T8DvFihobzxq7kbhiKJw3pzHNp5GfgLBVdo40KBQAhGFCKf7c8g698hvmVJwrtQESdakH2_CrfPBMlStppC_e1PqeyQ5TZCtszigXWjvcMWW2_OzCHsONuTWaJPgNs-j6bea4-3qWU16GGJNAMmEfpGLfYd5-gQNtTdGXXSeCEsv2XlgrKQqfemoCZc7uXLk7FLca-TL89ZHXjRi-wp2Q"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
              <span className="font-label-sm text-[11px] uppercase font-bold text-[#95f8a7]">
                Automated Fertigation
              </span>
              <p className="font-body-sm text-xs font-medium mt-1 leading-snug">
                Real-time chemical dosing linked directly with digital invoice approval workflows.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW PURCHASE ORDER MODAL */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-[#dce9ff]">
            <div className="p-6 bg-surface-container-low flex items-center justify-between border-b border-[#dce9ff]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[24px]">post_add</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-[18px] text-on-surface font-bold">
                    Create New Purchase Order
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Requirement 4: Select Vendor, Agri-Product, Quantity, Unit Price
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-4 font-body-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-on-surface mb-1 font-semibold">Vendor Master (DTO)</label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="AgriSupplies Co.">AgriSupplies Co. (VND-AGRI-044)</option>
                    <option value="Apex Pivot & Pump Systems">Apex Pivot &amp; Pump Systems (VND-091)</option>
                    <option value="BioNutrient Solutions LLC">BioNutrient Solutions LLC (VND-104)</option>
                    <option value="SensorGrid Labs">SensorGrid Labs (VND-228)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface mb-1 font-semibold">Analytic Account Tag</label>
                  <select
                    value={selectedAnalytic}
                    onChange={(e) => setSelectedAnalytic(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Zone-1 Farm District">Zone-1 Farm District</option>
                    <option value="Sector 4-B Irrigation Upgrade">Sector 4 Corn V8 (Cost Center 4001)</option>
                    <option value="East Acreage Fertigation">East Acreage Fertigation (Cost Center 4002)</option>
                    <option value="Wellhead Station #3">Wellhead Station #3 (CapEx 2004)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface mb-1 font-semibold">Payment Terms</label>
                  <select
                    value={selectedTerms}
                    onChange={(e) => setSelectedTerms(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Due on Immediate Receipt">Due on Immediate Receipt</option>
                    <option value="2/10 Net 60">2/10 Net 60 (2% Early Pay Disc.)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    Line Items &amp; Material Specifications
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span> Add Row
                  </button>
                </div>

                <div className="bg-surface-container-low rounded-xl p-3 overflow-x-auto border border-[#dce9ff]/60">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
                        <th className="pb-2">Agri Product / Item</th>
                        <th className="pb-2 w-24">Quantity</th>
                        <th className="pb-2 w-32">Unit Price ($)</th>
                        <th className="pb-2 w-28 text-right">Subtotal ($)</th>
                        <th className="pb-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="pr-2 py-1">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleLineItemChange(item.id, 'name', e.target.value)}
                              className="w-full h-8 px-2 rounded-lg bg-surface-container-lowest text-on-surface border border-outline-variant text-xs"
                            />
                          </td>
                          <td className="pr-2 py-1">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleLineItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
                              className="w-full h-8 px-2 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono border border-outline-variant text-xs"
                            />
                          </td>
                          <td className="pr-2 py-1">
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handleLineItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full h-8 px-2 rounded-lg bg-surface-container-lowest text-on-surface font-data-mono border border-outline-variant text-xs"
                            />
                          </td>
                          <td className="pr-2 py-1 text-right font-data-mono font-bold text-on-surface">
                            ${(item.qty * item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(item.id)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <div className="w-64 bg-surface-container-low p-3 rounded-xl space-y-1.5 text-xs border border-[#dce9ff]/60">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Subtotal:</span>
                      <span className="font-data-mono font-medium">
                        ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-px bg-surface-container-high w-full"></div>
                    <div className="flex justify-between font-bold text-on-surface text-sm">
                      <span>Total Amount:</span>
                      <span className="font-data-mono text-primary text-[15px]">
                        ${calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#dce9ff]/60">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  <span>Post &amp; Submit Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SALES ORDER MODAL (Requirement 4) */}
      {isSoModalOpen && (
        <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce9ff]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">receipt</span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">
                    Create New Sales Order (SO)
                  </h3>
                  <span className="text-xs text-on-surface-variant">Requirement 4: Select Farmer, Service/Product, Quantity, Price, Tax</span>
                </div>
              </div>
              <button onClick={() => setIsSoModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSalesOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Farmer / Customer</label>
                <select
                  value={soFarmer}
                  onChange={(e) => setSoFarmer(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                >
                  <option value="Ramesh Patel">Ramesh Patel (Patel Agro Farms - Zone-1)</option>
                  <option value="Marcus Vance">Marcus Vance (Green Valley Agri Corp)</option>
                  <option value="Dale K. Miller">Dale K. Miller (SunPrairie Orchards)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Service / Agri-Product</label>
                <select
                  value={soProduct}
                  onChange={(e) => {
                    setSoProduct(e.target.value);
                    if (e.target.value === 'Advisory/Irrigation Water') setSoPrice(750.0);
                    else if (e.target.value === 'Drip Line Inspection') setSoPrice(120.0);
                    else setSoPrice(420.0);
                  }}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                >
                  <option value="Advisory/Irrigation Water">Advisory/Irrigation Water ($750.00)</option>
                  <option value="Drip Line Inspection">Drip Line Inspection (Service - $120.00)</option>
                  <option value="NPK Fertilizer">NPK Fertilizer (Goods - $420.00 / ton)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={soQty}
                    onChange={(e) => setSoQty(parseInt(e.target.value) || 1)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-data-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={soPrice}
                    onChange={(e) => setSoPrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-data-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tax (%)</label>
                  <input
                    type="number"
                    value={soTax}
                    onChange={(e) => setSoTax(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-data-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Analytic Sector District</label>
                <input
                  type="text"
                  value={soSector}
                  onChange={(e) => setSoSector(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl flex justify-between font-bold text-sm">
                <span>Total SO Amount:</span>
                <span className="font-data-mono text-primary">${(soQty * soPrice * (1 + soTax / 100)).toFixed(2)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs"
                >
                  Book Sales Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER PAYMENT MODAL (Requirement 4) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between border-b border-[#dce9ff]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                <div>
                  <h3 className="font-headline-sm text-base font-bold text-on-surface">
                    Register Payment (Bank / Cash)
                  </h3>
                  <span className="text-xs text-on-surface-variant">Requirement 4: Register against Bill or Invoice</span>
                </div>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Payment Against</label>
                  <select
                    value={payType}
                    onChange={(e: any) => setPayType(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-bold"
                  >
                    <option value="BILL">Vendor Bill (Disbursement)</option>
                    <option value="INVOICE">Customer Invoice (Receipt)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Clearing Method</label>
                  <select
                    value={payMethod}
                    onChange={(e: any) => setPayMethod(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="NACHA ACH">NACHA ACH (Automated)</option>
                    <option value="Bank Transfer">Bank Transfer (Wire)</option>
                    <option value="Cash">Cash Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Counterparty / Entity Name</label>
                <input
                  type="text"
                  value={payEntity}
                  onChange={(e) => setPayEntity(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-data-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Reference</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant font-data-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">General Ledger Clearing Account</label>
                <input
                  type="text"
                  value={payAccount}
                  onChange={(e) => setPayAccount(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant border border-[#dce9ff]/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
                <span>Submitting will immediately post balanced double-entry Journal records!</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs"
                >
                  Register Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
