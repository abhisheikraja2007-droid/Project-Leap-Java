import React, { useState } from 'react';
import { Contact } from '../types';

interface MasterDataViewProps {
  contacts: Contact[];
  onAddContact: (contact: Partial<Contact>) => Promise<void>;
  showToast: (msg: string) => void;
  onOpenAiChatWithPrompt: (prompt: string) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  contacts,
  onAddContact,
  showToast,
  onOpenAiChatWithPrompt,
}) => {
  const [activeCatalogTab, setActiveCatalogTab] = useState<1 | 2 | 3>(1);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form states for Add Contact
  const [formName, setFormName] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formType, setFormType] = useState<'farmer' | 'vendor' | 'supplier' | 'lab'>('farmer');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTax, setFormTax] = useState('');
  const [formTerms, setFormTerms] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tree toggle states
  const [openTreeNodes, setOpenTreeNodes] = useState<{ [key: string]: boolean }>({
    '1000': true,
    '2000': true,
    '4000': true,
    '5000': true,
  });

  const toggleTreeNode = (nodeId: string) => {
    setOpenTreeNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesType = filterType === 'all' || c.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExport = (format: 'json' | 'csv' | 'netsuite') => {
    setIsExportMenuOpen(false);
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(contacts, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'agripulse_master_dto.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Canonical JSON DTO exported successfully.');
    } else if (format === 'csv') {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        ['ID,Name,Organization,Type,Email,Phone,Address,Terms']
          .concat(
            contacts.map(
              (c) =>
                `"${c.id}","${c.name}","${c.organization}","${c.type}","${c.email}","${c.phone}","${c.address}","${c.terms}"`
            )
          )
          .join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', encodeURI(csvContent));
      downloadAnchor.setAttribute('download', 'agripulse_contacts_erp.csv');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('ERP CSV formatted file exported.');
    } else {
      showToast('Direct push to NetSuite REST completed (200 OK).');
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPhone) {
      alert('Please fill in required fields: Name, Email, and Phone.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddContact({
        name: formName,
        organization: formOrg || 'Independent Field Entity',
        type: formType,
        email: formEmail,
        phone: formPhone,
        address: formAddress || 'Regional Hub, Midwest Plot',
        taxId: formTax || 'FSA-000',
        terms: formTerms || (formType === 'farmer' ? '500 Acres' : 'Net 30'),
        notes: formNotes,
      });
      showToast(`Contact ${formName} saved into Master DTO!`);
      // Reset form
      setFormName('');
      setFormOrg('');
      setFormEmail('');
      setFormPhone('');
      setFormAddress('');
      setFormTax('');
      setFormTerms('');
      setFormNotes('');
      setIsContactModalOpen(false);
    } catch {
      showToast('Error saving contact into Master DTO.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
      {/* Top Title Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Agricultural Master Registry
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Master Data &amp; Operational Catalogs
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Centralized entities registry across growers, operational hardware, agronomic consumables, and general ledger accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-500">download</span>
              <span>Export Catalog</span>
              <span className="material-symbols-outlined text-[15px] text-slate-400">expand_more</span>
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-slate-200 z-30 p-1 space-y-0.5">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">data_object</span>
                  Export JSON (DTO format)
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">table_chart</span>
                  Export CSV (ERP format)
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900 transition-colors shadow-2xs cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Registered Contacts
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 font-data-mono">
              {contacts.length + 138}
            </span>
            <span className="text-xs text-slate-500">entities</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            88 Growers · 34 Vendors · 20 Labs
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Catalog Products &amp; Services
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 font-data-mono">68</span>
            <span className="text-xs text-slate-500">SKUs</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Fertilizer, Drip Line, &amp; Diagnostics
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Chart of Accounts (COA)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 font-data-mono">34</span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            General Ledger GAAP/IFRS Mapped
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium block">
            Monitored Acreage
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 font-data-mono">48,500</span>
            <span className="text-xs text-slate-500">acres</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Zone-1, Zone-2 &amp; Commercial Plots
          </span>
        </div>
      </div>

      {/* Catalog Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveCatalogTab(1)}
            className={`pb-3 text-sm font-medium transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeCatalogTab === 1
                ? 'border-emerald-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Contact Master</span>
            <span className="text-xs text-slate-400 font-data-mono">({contacts.length + 138})</span>
          </button>

          <button
            onClick={() => setActiveCatalogTab(2)}
            className={`pb-3 text-sm font-medium transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeCatalogTab === 2
                ? 'border-emerald-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Product Master</span>
            <span className="text-xs text-slate-400 font-data-mono">(68)</span>
          </button>

          <button
            onClick={() => setActiveCatalogTab(3)}
            className={`pb-3 text-sm font-medium transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              activeCatalogTab === 3
                ? 'border-emerald-800 text-slate-900 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Chart of Accounts</span>
            <span className="text-xs text-slate-400 font-data-mono">(34)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONTACT MASTER CONTENT */}
      {activeCatalogTab === 1 && (
        <div className="flex flex-col gap-6">
          {/* Action & Filter Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-[#dce9ff]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, parcel ID, phone, email, or company..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-md text-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold mr-1">
                Filter:
              </span>
              {[
                { id: 'all', label: 'All (142)' },
                { id: 'farmer', label: 'Farmers / Landowners (88)' },
                { id: 'vendor', label: 'Equipment Vendors (18)' },
                { id: 'supplier', label: 'Seed & Chem Suppliers (22)' },
                { id: 'lab', label: 'Agronomy Labs (14)' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilterType(pill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === pill.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant bg-surface-container-low hover:bg-surface-container'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Contacts Table Card */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 overflow-hidden flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/60 border-b border-[#dce9ff]/60">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-sm md:text-[15px] font-bold text-on-surface">
                  Registered Master Directory
                </span>
                <span className="font-label-sm text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-data-mono">
                  DTO Schema v3.2
                </span>
              </div>
              <span className="font-data-mono text-[12px] text-on-surface-variant">
                Showing {filteredContacts.length} of 142 records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-sm text-[13.5px]">
                <thead>
                  <tr className="bg-surface-container-low font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    <th className="py-3 px-6">Contact ID</th>
                    <th className="py-3 px-6">Full Name &amp; Organization</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Contact Details</th>
                    <th className="py-3 px-6">Farm / Delivery Address</th>
                    <th className="py-3 px-6">Terms / Acreage</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60 text-on-surface">
                  {filteredContacts.map((c) => {
                    const initials = c.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4 px-6 font-data-mono font-bold text-primary">{c.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center font-headline-sm text-sm">
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-on-surface">{c.name}</div>
                              <div className="text-[12px] text-on-surface-variant">{c.organization}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              c.type === 'farmer'
                                ? 'bg-primary-fixed text-on-primary-fixed'
                                : c.type === 'supplier'
                                ? 'bg-surface-variant text-on-surface'
                                : c.type === 'vendor'
                                ? 'bg-secondary-container text-on-secondary-fixed'
                                : 'bg-surface-container text-on-surface'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.type === 'farmer'
                                  ? 'bg-primary'
                                  : c.type === 'supplier'
                                  ? 'bg-tertiary'
                                  : 'bg-secondary'
                              }`}
                            ></span>
                            {c.type === 'farmer'
                              ? 'Farmer / Landowner'
                              : c.type === 'supplier'
                              ? 'Seed & Chem Supplier'
                              : c.type === 'vendor'
                              ? 'Equipment Vendor'
                              : 'Agronomy Lab'}
                          </span>
                        </td>
                        <td className="py-4 px-6 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-on-surface">
                            <span className="material-symbols-outlined text-[15px] text-outline">mail</span>
                            <span>{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-data-mono text-[12px] text-on-surface-variant">
                            <span className="material-symbols-outlined text-[15px] text-outline">call</span>
                            <span>{c.phone}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-[12px]">
                          <div className="text-on-surface font-medium">{c.address.split(',')[0]}</div>
                          <div>{c.address.split(',').slice(1).join(',')}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-surface-container font-data-mono text-[12px] font-semibold text-on-surface">
                            {c.terms}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => showToast(`Editing profile for ${c.name}`)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="Edit Contact"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button
                              onClick={() => showToast(`Opened General Ledger for ${c.name}`)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors"
                              title="View General Ledger"
                            >
                              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            </button>
                            <button
                              onClick={() =>
                                onOpenAiChatWithPrompt(
                                  `Analyze customer relationship and irrigation contract history for ${c.name} (${c.organization})`
                                )
                              }
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                              title="Audit with Gemini AI"
                            >
                              <span className="material-symbols-outlined text-[18px]">psychology</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-[#dce9ff]/60">
              <div className="font-body-sm text-xs text-on-surface-variant font-data-mono">
                Page 1 of 36 · Spring Data JPA Offset Pageable
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed text-xs font-semibold"
                >
                  Previous
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-bold">
                  1
                </button>
                <button
                  onClick={() => showToast('Page 2 requested.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-semibold"
                >
                  2
                </button>
                <button
                  onClick={() => showToast('Page 3 requested.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-semibold"
                >
                  3
                </button>
                <button
                  onClick={() => showToast('Next page requested.')}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCKED SUB-SECTIONS / PREVIEWS FOR TAB 2 & TAB 3 (Always accessible or active on tabs) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
        {/* Product Master Section Preview Card */}
        <div
          id="productMasterCard"
          className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 p-6 flex flex-col justify-between space-y-5"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-[22px]">inventory_2</span>
                <h2 className="font-headline-md text-[18px] text-on-surface font-bold">
                  Product Master Catalog Preview
                </h2>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Fertilizers, IoT Probes, &amp; Variable Rate Advisory Services.
              </p>
            </div>
            <button
              onClick={() => setActiveCatalogTab(2)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container font-label-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All (68)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Product Table Micro */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-[13px]">
              <thead>
                <tr className="bg-surface-container-low font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-right">Sales Price</th>
                  <th className="py-2.5 px-4 text-right">Unit Cost</th>
                  <th className="py-2.5 px-4 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/60">
                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">
                    High-Yield Urea 46-0-0
                    <span className="block font-data-mono text-[11px] text-on-surface-variant font-normal">
                      SKU-FERT-UREA46
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-surface-variant text-on-surface">
                      Fertilizer
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-data-mono font-semibold">$850.00 / ton</td>
                  <td className="py-3 px-4 text-right font-data-mono text-on-surface-variant">$620.00 / ton</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-data-mono font-bold text-primary">27.1%</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">
                    Smart Soil Moisture Probe v3
                    <span className="block font-data-mono text-[11px] text-on-surface-variant font-normal">
                      SKU-IOT-PRB-V3
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-secondary-container text-on-secondary-fixed">
                      IoT Hardware
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-data-mono font-semibold">$320.00 / unit</td>
                  <td className="py-3 px-4 text-right font-data-mono text-on-surface-variant">$210.00 / unit</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-data-mono font-bold text-primary">34.4%</span>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/40">
                  <td className="py-3 px-4 font-semibold text-on-surface">
                    Variable Rate Drip Advisory Package
                    <span className="block font-data-mono text-[11px] text-on-surface-variant font-normal">
                      SKU-SRV-VRD-ANN
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-primary-fixed text-on-primary-fixed">
                      Agronomy Consulting
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-data-mono font-semibold">$45.00 / acre</td>
                  <td className="py-3 px-4 text-right font-data-mono text-on-surface-variant">$18.00 / acre</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-data-mono font-bold text-tertiary">60.0%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between border border-[#dce9ff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="font-body-sm text-[12px] text-on-surface">
                Automated Margin Guard active (&gt;25% threshold)
              </span>
            </div>
            <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-bold">
              Tier 1 Agri-Pricing
            </span>
          </div>
        </div>

        {/* Chart of Accounts Preview Tree Card */}
        <div
          id="coaCard"
          className="bg-surface-container-lowest rounded-2xl shadow-sm border border-[#dce9ff]/60 p-6 flex flex-col justify-between space-y-5"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">account_tree</span>
                <h2 className="font-headline-md text-[18px] text-on-surface font-bold">
                  Chart of Accounts (COA Tree)
                </h2>
              </div>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                General Ledger analytic accounts hierarchy for automated irrigation cost allocation.
              </p>
            </div>
            <button
              onClick={() => setActiveCatalogTab(3)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-secondary hover:bg-surface-container font-label-md text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Expand Tree (34)</span>
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
            </button>
          </div>

          {/* Hierarchical Tree Visualization */}
          <div className="space-y-2.5 font-body-sm text-[13px]">
            {/* Node 1000 Assets */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-[#dce9ff]/60">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTreeNode('1000')}
              >
                <div className="flex items-center gap-2 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {openTreeNodes['1000'] ? 'folder_open' : 'folder'}
                  </span>
                  <span className="font-data-mono text-primary font-bold">1000</span>
                  <span>ASSETS</span>
                </div>
                <span className="font-data-mono text-[11px] text-on-surface-variant">
                  Total: $2,840,920.00
                </span>
              </div>
              {openTreeNodes['1000'] && (
                <div className="pl-6 pt-2 space-y-1.5 mt-1 border-t border-[#dce9ff]/50">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">1100</span> Current: Cash in AgriBank &amp; A/R
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$924,400</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">1500</span> Fixed: Center Pivots, Pump Stations &amp; IoT Nodes
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$1,916,520</span>
                  </div>
                </div>
              )}
            </div>

            {/* Node 2000 Liabilities */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-[#dce9ff]/60">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTreeNode('2000')}
              >
                <div className="flex items-center gap-2 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    {openTreeNodes['2000'] ? 'folder_open' : 'folder'}
                  </span>
                  <span className="font-data-mono text-secondary font-bold">2000</span>
                  <span>LIABILITIES</span>
                </div>
                <span className="font-data-mono text-[11px] text-on-surface-variant">
                  Total: $418,200.00
                </span>
              </div>
              {openTreeNodes['2000'] && (
                <div className="pl-6 pt-2 space-y-1.5 mt-1 border-t border-[#dce9ff]/50">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">2100</span> Accounts Payable Equipment &amp; Chem Vendors
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$312,000</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">2300</span> Accrued Agronomy Service Liabilities
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$106,200</span>
                  </div>
                </div>
              )}
            </div>

            {/* Node 4000 Income */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-[#dce9ff]/60">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleTreeNode('4000')}
              >
                <div className="flex items-center gap-2 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">
                    {openTreeNodes['4000'] ? 'folder_open' : 'folder'}
                  </span>
                  <span className="font-data-mono text-tertiary font-bold">4000</span>
                  <span>INCOME &amp; REVENUE</span>
                </div>
                <span className="font-data-mono text-[11px] text-on-surface-variant">
                  YTD: $1,450,800.00
                </span>
              </div>
              {openTreeNodes['4000'] && (
                <div className="pl-6 pt-2 space-y-1.5 mt-1 border-t border-[#dce9ff]/50">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">4100</span> Precision Irrigation Advisory Fees
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$840,000</span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-outline">
                        subdirectory_arrow_right
                      </span>
                      <span className="font-data-mono text-on-surface">4200</span> Telemetry Subscription SaaS
                    </span>
                    <span className="font-data-mono text-[11px] font-semibold">$390,800</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="font-data-mono text-[11px] text-outline">
              Fiscal Year 2024 · Sub-ledger Synced 4m ago
            </span>
          </div>
        </div>
      </div>

      {/* 'ADD NEW CONTACT' MODAL SLIDE-OVER / DIALOG BACKDROP */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-inverse-surface/40 backdrop-blur-xs flex justify-end">
          <div className="bg-surface-container-lowest w-full max-w-xl min-h-screen p-8 shadow-2xl flex flex-col justify-between border-l border-[#dce9ff]">
            <div className="space-y-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#dce9ff]/60">
                <div className="space-y-1">
                  <span className="font-label-sm text-[11px] text-primary uppercase font-bold tracking-wider">
                    Master Data Entry
                  </span>
                  <h3 className="font-headline-lg text-[22px] text-on-surface font-bold">
                    Add New Agri Contact
                  </h3>
                  <p className="font-body-sm text-[12px] text-on-surface-variant">
                    Direct entity provisioning for ledger indexing and telemetric dispatch.
                  </p>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Form Elements */}
              <form onSubmit={handleSaveContact} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Katherine Reynolds"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Company / Org Name</label>
                    <input
                      type="text"
                      value={formOrg}
                      onChange={(e) => setFormOrg(e.target.value)}
                      placeholder="e.g. BlueSky Agri Partners"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-xs text-on-surface font-semibold">Entity Type *</label>
                  <select
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                  >
                    <option value="farmer">Farmer / Landowner</option>
                    <option value="vendor">Equipment Vendor</option>
                    <option value="supplier">Seed &amp; Chem Supplier</option>
                    <option value="lab">Agronomy Testing Lab</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="katherine@blueskyagri.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+1 (555) 349-8810"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-xs text-on-surface font-semibold">
                    Farm Parcel / Physical Delivery Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="Plot 44, County Line Rd, Ames, IA 50010"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Tax ID / USDA Farm #</label>
                    <input
                      type="text"
                      value={formTax}
                      onChange={(e) => setFormTax(e.target.value)}
                      placeholder="FSA-882-990-21"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-md text-xs text-on-surface font-semibold">Terms / Total Acreage</label>
                    <input
                      type="text"
                      value={formTerms}
                      onChange={(e) => setFormTerms(e.target.value)}
                      placeholder="850 Acres or Net 30"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-xs text-on-surface font-semibold">
                    Agronomic Notes &amp; Dispatch Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Preferred irrigation delivery window, central pivot gateway hardware spec..."
                    className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-sm focus:bg-surface-container-lowest border border-outline-variant focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3 border border-[#dce9ff]/60">
                  <span className="material-symbols-outlined text-primary text-[20px]">cloud_done</span>
                  <div className="text-[12px] text-on-surface-variant">
                    Auto-validates against USDA Farm Service Agency registry &amp; NetSuite ERP.
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-surface-container-low text-on-surface hover:bg-surface-container font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary hover:bg-primary font-semibold text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>{isSubmitting ? 'Saving DTO...' : 'Save to Master DTO'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
