import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with user agent header for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Data Store with initial realistic data from AgriPulse OS
interface Contact {
  id: string;
  name: string;
  organization: string;
  type: 'farmer' | 'vendor' | 'supplier' | 'lab';
  email: string;
  phone: string;
  address: string;
  terms: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  date: string;
  vendor: string;
  category: string;
  specification: string;
  analyticCenter: string;
  total: number;
  status: 'Draft Order' | 'PO Approved' | 'Dispatched' | 'Bill Ready' | 'Paid & Received' | 'Billed (Due Net 30)';
  deliveryDate?: string;
  terms?: string;
}

interface TelemetryEntry {
  id: string;
  field: string;
  depth: string;
  moisture: number;
  salinity: number;
  soilTemp: number;
  operatorNotes: string;
  loggedAt: string;
}

let contacts: Contact[] = [
  {
    id: 'AGR-C-1001',
    name: 'Ramesh Patel',
    organization: 'Patel Agro Farms',
    type: 'farmer',
    email: 'ramesh.patel@patelagro.com',
    phone: '+1 (555) 381-9920',
    address: 'Plot 4, Canal Road, Zone-1 Farm District',
    terms: '850 Acres',
    taxId: 'USDA-FSA-8821',
    notes: 'Primary smallholder farmer in Zone-1. Automated drip & NPK fertigation regime.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'AGR-C-2001',
    name: 'AgriSupplies Co.',
    organization: 'AgriSupplies Wholesale Ltd',
    type: 'vendor',
    email: 'sales@agrisupplies.com',
    phone: '+1 (555) 492-3301',
    address: 'Warehouse Hub #2, Agri-Corridor',
    terms: 'Net 30 Days',
    taxId: 'VND-AGRI-044',
    notes: 'Major vendor for NPK fertilizer and precision drip line hardware.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'AGR-C-8812',
    name: 'Marcus Vance',
    organization: 'Green Valley Agri Corp',
    type: 'farmer',
    email: 'marcus.vance@valleyagri.com',
    phone: '+1 (555) 234-8901',
    address: 'Parcel 12-B, Highway 44, Des Moines, IA 50309',
    terms: '1,200 Acres',
    taxId: 'FSA-994-012',
    notes: 'Corn V8 hybrid test plot. Requires 24-hr advance notice before pivot cycle.',
    createdAt: new Date().toISOString(),
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
    taxId: 'NE-4429-BN',
    notes: 'Liquid nitrogen UAN-32 distributor and biological inoculation.',
    createdAt: new Date().toISOString(),
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
    taxId: 'VND-091-APX',
    notes: 'Center pivot spares, solenoid manifolds, LoRa motor control heads.',
    createdAt: new Date().toISOString(),
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
    taxId: 'CA-FSA-661-2',
    notes: 'Micro-sprinkler citrus block under closed-loop tensiometer dispatch.',
    createdAt: new Date().toISOString(),
  },
];

let purchaseOrders: PurchaseOrder[] = [
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
];

interface VendorBill {
  id: string;
  billNumber: string;
  poNumber: string;
  vendor: string;
  billDate: string;
  dueDate: string;
  total: number;
  status: 'AWAITING_APPROVAL' | 'APPROVED' | 'PAID' | 'VOIDED';
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  farmerId: string;
  serviceOrProduct: string; // "Advisory/Irrigation Water", "Drip Line Inspection", "NPK Fertilizer"
  quantity: number;
  price: number;
  tax: number;
  total: number;
  sectorName: string;
  status: 'BOOKED' | 'DISPATCHED' | 'INVOICED' | 'SETTLED';
  date: string;
}

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  soNumber: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: 'OUTSTANDING' | 'SETTLED_ACH' | 'PARTIALLY_PAID';
}

interface Payment {
  id: string;
  reference: string;
  type: 'BILL' | 'INVOICE';
  entityName: string;
  direction: 'INCOMING_REVENUE' | 'OUTGOING_DISBURSEMENT';
  amount: number;
  method: 'Bank Transfer' | 'NACHA ACH' | 'Cash';
  clearedAt: string;
  account: string;
}

interface JournalRecord {
  id: string;
  journalType: 'Sales Journal' | 'Purchase Journal' | 'Bank Journal' | 'Cash Journal';
  reference: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  analyticSector: string;
}

let vendorBills: VendorBill[] = [
  {
    id: 'VB-01',
    billNumber: 'BILL-2025-0921',
    poNumber: 'PO-2025-0841',
    vendor: 'Apex Pivot & Pump Systems',
    billDate: 'Feb 24, 2025',
    dueDate: 'Mar 26, 2025',
    total: 14250.0,
    status: 'AWAITING_APPROVAL',
  },
  {
    id: 'VB-02',
    billNumber: 'BILL-2025-0918',
    poNumber: 'PO-2025-0838',
    vendor: 'BioNutrient Solutions LLC',
    billDate: 'Feb 22, 2025',
    dueDate: 'Mar 24, 2025',
    total: 8600.0,
    status: 'APPROVED',
  },
  {
    id: 'VB-03',
    billNumber: 'BILL-2025-0899',
    poNumber: 'PO-2025-0833',
    vendor: 'SensorGrid Labs',
    billDate: 'Feb 18, 2025',
    dueDate: 'Feb 28, 2025',
    total: 6250.0,
    status: 'PAID',
  },
];

let salesOrders: SalesOrder[] = [
  {
    id: 'SO-101',
    orderNumber: 'SO-IRR-8921',
    customer: 'Ramesh Patel',
    farmerId: 'AGR-C-1001',
    serviceOrProduct: 'Advisory/Irrigation Water (Automated Root Recovery)',
    quantity: 1,
    price: 750.0,
    tax: 0.0,
    total: 750.0,
    sectorName: 'Zone-1 Farm District',
    status: 'INVOICED',
    date: 'Feb 26, 2025',
  },
  {
    id: 'SO-102',
    orderNumber: 'SO-IRR-8919',
    customer: 'Marcus Vance',
    farmerId: 'AGR-C-8812',
    serviceOrProduct: 'Drip Line Inspection & Valve Calibration',
    quantity: 2,
    price: 120.0,
    tax: 0.0,
    total: 240.0,
    sectorName: 'Sector 4-B (Corn V8)',
    status: 'DISPATCHED',
    date: 'Feb 25, 2025',
  },
  {
    id: 'SO-103',
    orderNumber: 'SO-IRR-8915',
    customer: 'Dale K. Miller',
    farmerId: 'AGR-C-6720',
    serviceOrProduct: 'NPK Fertilizer Dosing & Advisory Session',
    quantity: 4,
    price: 420.0,
    tax: 0.0,
    total: 1680.0,
    sectorName: 'Sector 7-C Citrus',
    status: 'SETTLED',
    date: 'Feb 23, 2025',
  },
];

let customerInvoices: CustomerInvoice[] = [
  {
    id: 'INV-01',
    invoiceNumber: 'INV-2025-4821',
    soNumber: 'SO-IRR-8921',
    customer: 'Ramesh Patel (Patel Agro Farms)',
    invoiceDate: 'Feb 26, 2025',
    dueDate: 'Mar 28, 2025',
    total: 750.0,
    status: 'OUTSTANDING',
  },
  {
    id: 'INV-02',
    invoiceNumber: 'INV-2025-4819',
    soNumber: 'SO-IRR-8915',
    customer: 'Dale K. Miller (SunPrairie Orchards)',
    invoiceDate: 'Feb 23, 2025',
    dueDate: 'Mar 25, 2025',
    total: 1680.0,
    status: 'SETTLED_ACH',
  },
];

let payments: Payment[] = [
  {
    id: 'PAY-01',
    reference: 'ACH-99214-WELLSFARGO',
    type: 'BILL',
    entityName: 'AgriCorp Power Grid #4',
    direction: 'OUTGOING_DISBURSEMENT',
    amount: 4320.0,
    method: 'NACHA ACH',
    clearedAt: 'Feb 24, 2025',
    account: 'GL-Acc #2100 (Agri-Vendor Creditors)',
  },
  {
    id: 'PAY-02',
    reference: 'ACH-99182-COMMERCE',
    type: 'BILL',
    entityName: 'CropCare Aerial Drone Spray',
    direction: 'OUTGOING_DISBURSEMENT',
    amount: 9150.0,
    method: 'NACHA ACH',
    clearedAt: 'Feb 23, 2025',
    account: 'GL-Acc #5100 (Power & Water Consumption Expenses)',
  },
  {
    id: 'PAY-03',
    reference: 'WIRE-8840-FIRSTNAT',
    type: 'BILL',
    entityName: 'Valley Irrigation Pivot Spares',
    direction: 'OUTGOING_DISBURSEMENT',
    amount: 12480.0,
    method: 'Bank Transfer',
    clearedAt: 'Feb 21, 2025',
    account: 'GL-Acc #1500 (Pump Equipment)',
  },
  {
    id: 'PAY-04',
    reference: 'ACH-IN-8891-AGRIBANK',
    type: 'INVOICE',
    entityName: 'Dale K. Miller (SunPrairie Orchards)',
    direction: 'INCOMING_REVENUE',
    amount: 1680.0,
    method: 'Bank Transfer',
    clearedAt: 'Feb 25, 2025',
    account: 'GL-Acc #4100 (Crop Advisory Service Revenue)',
  },
];

let journals: JournalRecord[] = [
  {
    id: 'JRN-01',
    journalType: 'Sales Journal',
    reference: 'INV-2025-4821',
    date: 'Feb 26, 2025',
    description: 'Irrigation Dispatch Advisory Invoice to Ramesh Patel',
    debitAccount: '1300 Debtors (Accounts Receivable)',
    creditAccount: '4100 Crop Advisory Service Revenue',
    amount: 750.0,
    analyticSector: 'Zone-1 Farm District',
  },
  {
    id: 'JRN-02',
    journalType: 'Purchase Journal',
    reference: 'BILL-2025-0921',
    date: 'Feb 24, 2025',
    description: 'Procured 12x Solenoid Manifolds from Apex Pivot',
    debitAccount: '1500 Pump Equipment',
    creditAccount: '2100 Agri-Vendor Creditors',
    amount: 14250.0,
    analyticSector: 'Sector 4-B Irrigation Upgrade',
  },
  {
    id: 'JRN-03',
    journalType: 'Bank Journal',
    reference: 'ACH-99214-WELLSFARGO',
    date: 'Feb 24, 2025',
    description: 'Power Grid Pump Electricity Disbursement',
    debitAccount: '5100 Power & Water Consumption Expenses',
    creditAccount: '1100 Current: Cash in AgriBank',
    amount: 4320.0,
    analyticSector: 'Wellhead Station #3',
  },
  {
    id: 'JRN-04',
    journalType: 'Cash Journal',
    reference: 'CSH-REC-0081',
    date: 'Feb 22, 2025',
    description: 'On-site TDR Sensor Soil Probe Calibration Service Fee',
    debitAccount: '1100 Current: Cash in AgriBank',
    creditAccount: '4100 Crop Advisory Service Revenue',
    amount: 250.0,
    analyticSector: 'Zone-1 Farm District',
  },
];

let telemetryLogs: TelemetryEntry[] = [];

let activeIrrigationOrders = [
  {
    id: 'IRR-8921',
    title: 'Sector 4-B Emergency Recovery',
    status: 'Pumping (Recovery Pulse)',
    flowRate: '420 GPM @ 42 PSI',
    duration: '2h 15m remaining',
    valve: 'VALVE-GRP-4B [OPEN]',
    targetVolume: '18,500 Gallons',
    activePulse: '0.75 in/acre',
    type: 'emergency',
  },
  {
    id: 'IRR-8919',
    title: 'Sector 2 Pivot North Rotation',
    status: 'Pumping',
    flowRate: '420 GPM / 42 PSI',
    duration: '1h 12m remaining',
    valve: 'PIVOT-SEC-02',
    targetVolume: '45,000 Gallons',
    activePulse: '64% cycle',
    type: 'scheduled',
  },
  {
    id: 'IRR-8915',
    title: 'Sector 1-A Drip Fertigation Cycle',
    status: 'Completed',
    flowRate: 'Delivered',
    duration: '14:22 PM Today',
    valve: 'VALVE-GRP-1A',
    targetVolume: '12,000 Gal + 30 lbs/ac N',
    activePulse: '+8.4% VWC Delta',
    type: 'completed',
  },
];

// --- SPRING BOOT MVP BACKEND ENDPOINTS ---

// Requirement 5.B: POST /api/sensors/telemetry
app.post('/api/sensors/telemetry', (req, res) => {
  const {
    sectorId = 'Sector 4-B (Corn V8 Stage)',
    soilMoisture = 17.4,
    durationBelowThresholdMinutes = 165,
    cwsi = 0.68,
    evapotranspiration = 6.8,
    suppliesNeeded = true,
  } = req.body;

  const moisture = Number(soilMoisture);
  const duration = Number(durationBelowThresholdMinutes);
  const thresholdBreached = moisture < 20.0;
  const durationMet = duration > 120; // > 2 hours
  const pumpTriggered = thresholdBreached && durationMet;

  // New Telemetry Record
  const reading = {
    id: `TLOG-${Date.now().toString().slice(-6)}`,
    nodeSectorId: sectorId,
    soilMoistureVwc: moisture,
    thresholdFloor: 20.0,
    durationBelowThresholdMinutes: duration,
    cropWaterStressIndex: cwsi,
    evapotranspirationMmDay: evapotranspiration,
    pumpDispatchTriggered: pumpTriggered,
    triggeredValveGroup: pumpTriggered ? 'VALVE-GRP-4B' : null,
    timestamp: new Date().toISOString(),
  };

  const responsePayload: any = {
    reading,
    pumpTriggered,
    message: pumpTriggered
      ? `CRITICAL DEFICIT DETECTED: Soil moisture ${moisture}% < 20.0% for ${duration} min. SCADA Valve Group 4-B Actuated (420 GPM @ 42 PSI).`
      : 'Telemetry verified within monitored threshold limits.',
  };

  // Business Rule 5.C: Generate Sales Order & convert to Customer Invoice when moisture < 20% for > 2 hours
  if (pumpTriggered) {
    const soNumber = `SO-IRR-${Math.floor(8000 + Math.random() * 1000)}`;
    const invNumber = `INV-2025-${Math.floor(4000 + Math.random() * 1000)}`;
    const dispatchAmount = 750.0;

    responsePayload.salesOrder = {
      orderNumber: soNumber,
      sectorName: sectorId,
      customer: 'Marcus Vance (Green Valley Agri Corp)',
      serviceDescription: `Automated Emergency Root Zone Irrigation Dispatch (VWC < 20.0% for ${duration} mins)`,
      waterVolumeGallons: 18500,
      totalAmount: dispatchAmount,
      status: 'INVOICED',
      dispatchedAt: new Date().toISOString(),
    };

    responsePayload.customerInvoice = {
      invoiceNumber: invNumber,
      salesOrderNumber: soNumber,
      customer: 'Marcus Vance',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalAmount: dispatchAmount,
      status: 'OUTSTANDING',
    };

    // Add to active irrigation orders list
    activeIrrigationOrders.unshift({
      id: `IRR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${sectorId} Automated Recovery`,
      status: 'Pumping (Recovery Pulse)',
      flowRate: '420 GPM @ 42 PSI',
      duration: '45m Emergency Root pulse',
      valve: 'VALVE-GRP-4B [OPEN]',
      targetVolume: '18,500 Gallons',
      activePulse: 'Active Pulse (0.75 in/acre)',
      type: 'emergency',
    });
  }

  // Business Rule 5.B: If supplies needed or critical pump triggered, create PO for water utility supplies & process Vendor Bill
  if (suppliesNeeded || pumpTriggered) {
    const poNum = `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const billNum = `BILL-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const supplyAmount = 4320.0;

    const newPO: PurchaseOrder = {
      id: poNum,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      vendor: 'Apex Pivot & Pump Systems',
      category: 'Irrigation Hardware & Actuators',
      specification: 'Emergency Solenoid Spares and Auxiliary Pumping Allocation',
      analyticCenter: `${sectorId} Irrigation Upgrade`,
      total: supplyAmount,
      status: 'Bill Ready',
      deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      terms: 'Net 30 Days',
    };
    purchaseOrders.unshift(newPO);

    responsePayload.purchaseOrder = newPO;
    responsePayload.vendorBill = {
      billNumber: billNum,
      purchaseOrderNumber: poNum,
      vendor: 'Apex Pivot & Pump Systems',
      totalAmount: supplyAmount,
      status: 'AWAITING_APPROVAL',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
  }

  res.status(200).json(responsePayload);
});

// Requirement 5.D: GET /api/reports/budget (BudgetReportView)
app.get('/api/reports/budget', (req, res) => {
  res.json({
    fiscalCycle: 'Fiscal Cycle Q3 Kharif',
    auditState: 'RECONCILED',
    totalPlanned: 86500.0,
    totalActual: 86200.0,
    totalVariance: 600.0,
    sectorBreakdowns: [
      {
        sectorName: 'Sector 1 (Wheat / Pivot Alpha)',
        plannedBudget: 18000.0,
        actualRealized: 16400.0,
        variance: -1600.0,
        utilizationPercentage: 91.1,
        statusFlag: 'Under Budget',
      },
      {
        sectorName: 'Sector 4-B (Corn V8 / Drip Bravo)',
        plannedBudget: 32000.0,
        actualRealized: 35800.0,
        variance: 3800.0,
        utilizationPercentage: 111.9,
        statusFlag: 'Heat Deficit Surge (+12%)',
      },
      {
        sectorName: 'Sector 2 (Alfalfa / Linear 3)',
        plannedBudget: 14500.0,
        actualRealized: 12900.0,
        variance: -1600.0,
        utilizationPercentage: 88.9,
        statusFlag: 'Under Budget',
      },
      {
        sectorName: 'Sector 7 (Citrus / Micro-Sprinkler)',
        plannedBudget: 22000.0,
        actualRealized: 21100.0,
        variance: -900.0,
        utilizationPercentage: 95.9,
        statusFlag: 'On Target',
      },
    ],
  });
});

// Requirement 5.D: GET /api/reports/financial-snapshot (FinancialSnapshotView)
app.get('/api/reports/financial-snapshot', (req, res) => {
  const { dateRange = 'Current Quarter (Q3 Kharif)' } = req.query;
  res.json({
    dateRange,
    profitAndLoss: {
      grossRevenue: 248500.0,
      revenueLineItems: {
        'Variable Rate Precision Irrigation Fees': 162000.0,
        'Crop Health Drone & Satellite Monitoring': 54500.0,
        'Sensor Telemetry Hardware Subscriptions': 32000.0,
      },
      directCogs: -114200.0,
      cogsLineItems: {
        'Grid Pumping Electricity & Diesel Booster': -68400.0,
        'Soil Testing & Agronomic Field Audits': -24800.0,
        'Equipment Depreciation & Repairs': -21000.0,
      },
      grossOperatingProfit: 134300.0,
      sgaExpenses: -48000.0,
      netOperatingIncomeEbit: 86300.0,
      netMarginPercentage: 34.7,
    },
    balanceSheet: {
      totalAssets: 1420000.0,
      currentAssets: 380000.0,
      nonCurrentAssets: 1040000.0,
      totalLiabilities: 490000.0,
      currentLiabilities: 120000.0,
      longTermLiabilities: 370000.0,
      totalFarmEquity: 930000.0,
      equationBalanced: true,
    },
  });
});

// Requirement 5.A: Master Data Controller endpoints
app.get('/api/master-data/contacts', (req, res) => res.json(contacts));
app.post('/api/master-data/contacts', (req, res) => {
  const { name, organization, type, email, mobile, address, terms, taxId } = req.body;
  const newContact: Contact = {
    id: `AGR-C-${Math.floor(1000 + Math.random() * 9000)}`,
    name: name || 'Unnamed Entity',
    organization: organization || 'Independent Operator',
    type: type || 'farmer',
    email: email || '',
    phone: mobile || '',
    address: address || 'Midwest Agri Plot',
    terms: terms || 'Net 30',
    taxId: taxId || 'FSA-000',
    createdAt: new Date().toISOString(),
  };
  contacts.unshift(newContact);
  res.status(201).json(newContact);
});

// Financial Transaction Flow Endpoints (Requirement 4 & 7.3)
app.get('/api/v1/finance/bills', (req, res) => res.json({ bills: vendorBills }));

app.post('/api/v1/finance/orders/:id/convert-to-bill', (req, res) => {
  const po = purchaseOrders.find((p) => p.id === req.params.id);
  if (!po) return res.status(404).json({ error: 'PO not found' });
  const newBill: VendorBill = {
    id: `VB-${Date.now().toString().slice(-4)}`,
    billNumber: `BILL-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    poNumber: po.id,
    vendor: po.vendor,
    billDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    total: po.total,
    status: 'AWAITING_APPROVAL',
  };
  po.status = 'Bill Ready';
  vendorBills.unshift(newBill);
  res.status(201).json({ success: true, bill: newBill, message: `PO ${po.id} converted to Vendor Bill ${newBill.billNumber}` });
});

app.get('/api/v1/finance/sales-orders', (req, res) => res.json({ salesOrders }));

app.post('/api/v1/finance/sales-orders', (req, res) => {
  const { customer, farmerId, serviceOrProduct, quantity, price, tax, sectorName } = req.body;
  const qty = Number(quantity) || 1;
  const unitPrice = Number(price) || 120.0;
  const taxPct = Number(tax) || 0;
  const subtotal = qty * unitPrice;
  const total = subtotal + (subtotal * taxPct) / 100;

  const newSO: SalesOrder = {
    id: `SO-${Date.now().toString().slice(-4)}`,
    orderNumber: `SO-IRR-${Math.floor(8000 + Math.random() * 1000)}`,
    customer: customer || 'Ramesh Patel',
    farmerId: farmerId || 'AGR-C-1001',
    serviceOrProduct: serviceOrProduct || 'Drip Line Inspection',
    quantity: qty,
    price: unitPrice,
    tax: taxPct,
    total,
    sectorName: sectorName || 'Zone-1 Farm District',
    status: 'BOOKED',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
  };
  salesOrders.unshift(newSO);
  res.status(201).json({ success: true, salesOrder: newSO });
});

app.post('/api/v1/finance/sales-orders/:id/convert-to-invoice', (req, res) => {
  const so = salesOrders.find((s) => s.id === req.params.id || s.orderNumber === req.params.id);
  if (!so) return res.status(404).json({ error: 'Sales Order not found' });
  const newInv: CustomerInvoice = {
    id: `INV-${Date.now().toString().slice(-4)}`,
    invoiceNumber: `INV-2025-${Math.floor(4000 + Math.random() * 1000)}`,
    soNumber: so.orderNumber,
    customer: so.customer,
    invoiceDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    dueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    total: so.total,
    status: 'OUTSTANDING',
  };
  so.status = 'INVOICED';
  customerInvoices.unshift(newInv);
  res.status(201).json({ success: true, invoice: newInv, message: `SO ${so.orderNumber} converted to Customer Invoice ${newInv.invoiceNumber}` });
});

app.get('/api/v1/finance/invoices', (req, res) => res.json({ invoices: customerInvoices }));

app.get('/api/v1/finance/payments', (req, res) => res.json({ payments }));

app.post('/api/v1/finance/payments', (req, res) => {
  const { reference, type, entityName, direction, amount, method, account } = req.body;
  const newPay: Payment = {
    id: `PAY-${Date.now().toString().slice(-4)}`,
    reference: reference || `ACH-${Math.floor(10000 + Math.random() * 90000)}-WELLSFARGO`,
    type: type || 'BILL',
    entityName: entityName || 'Apex Pivot & Pump Systems',
    direction: direction || 'OUTGOING_DISBURSEMENT',
    amount: Number(amount) || 1000.0,
    method: method || 'NACHA ACH',
    clearedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    account: account || 'GL-Acc #2100 (Agri-Vendor Creditors)',
  };
  payments.unshift(newPay);

  // Auto-post double-entry journal record
  const newJrn: JournalRecord = {
    id: `JRN-${Date.now().toString().slice(-4)}`,
    journalType: newPay.method === 'Cash' ? 'Cash Journal' : 'Bank Journal',
    reference: newPay.reference,
    date: newPay.clearedAt,
    description: `Payment settlement for ${newPay.entityName}`,
    debitAccount: newPay.direction === 'OUTGOING_DISBURSEMENT' ? newPay.account : '1100 Current: Cash in AgriBank',
    creditAccount: newPay.direction === 'OUTGOING_DISBURSEMENT' ? '1100 Current: Cash in AgriBank' : newPay.account,
    amount: newPay.amount,
    analyticSector: 'Zone-1 Farm District',
  };
  journals.unshift(newJrn);

  res.status(201).json({ success: true, payment: newPay, journal: newJrn });
});

app.get('/api/v1/finance/journals', (req, res) => res.json({ journals }));

// Endpoint to view Spring Boot codebase
app.get('/api/backend/code', (req, res) => {
  res.json({
    framework: 'Spring Boot 3.2.3 with Maven',
    database: 'MySQL (database: projectleap)',
    architecture: 'Model-View-Presenter (MVP)',
    modelPackages: [
      'Contact', 'Product', 'Account', 'Journal', 'JournalEntry',
      'PurchaseOrder', 'VendorBill', 'SalesOrder', 'CustomerInvoice', 'Payment', 'TelemetryReading'
    ],
    viewPackages: ['TelemetryRequestDTO', 'BudgetReportView', 'FinancialSnapshotView'],
    presenterPackages: [
      'MasterDataService', 'MasterDataController',
      'TelemetryService (POST /api/sensors/telemetry)', 'TelemetryController',
      'IrrigationSalesService',
      'ReportService', 'ReportingController'
    ],
  });
});

// Telemetry Ground-Truth Log
app.post('/api/v1/telemetry/log', (req, res) => {
  const { field, depth, moisture, salinity, soilTemp, operatorNotes } = req.body;
  const newEntry: TelemetryEntry = {
    id: `TLOG-${Date.now().toString().slice(-6)}`,
    field: field || 'Sector 4-B — Corn V8',
    depth: depth || '30 cm',
    moisture: Number(moisture) || 17.4,
    salinity: Number(salinity) || 1.82,
    soilTemp: Number(soilTemp) || 28.9,
    operatorNotes: operatorNotes || 'TDR handheld sensor calibration logged.',
    loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  telemetryLogs.unshift(newEntry);
  res.status(201).json({ success: true, message: 'Telemetry Ground-truth logged into PostgreSQL DTO', entry: newEntry });
});

// Telemetry Dispatch Trigger
app.post('/api/v1/telemetry/dispatch', (req, res) => {
  const { sector, pulseType, volume, duration, valveGroup } = req.body;
  const newOrder = {
    id: `IRR-${Math.floor(1000 + Math.random() * 9000)}`,
    title: `${sector || 'Sector 4-B'} Automated Recovery`,
    status: 'Pumping (Recovery Pulse)',
    flowRate: '420 GPM @ 42 PSI',
    duration: duration || '45m Emergency Root pulse',
    valve: valveGroup || 'VALVE-GRP-4B [OPEN]',
    targetVolume: volume || '18,500 Gallons',
    activePulse: pulseType || 'Pulse 45m Emergency root',
    type: 'emergency',
  };
  activeIrrigationOrders.unshift(newOrder);
  res.status(201).json({
    success: true,
    message: `SCADA Valve ${valveGroup || 'Group 4-B'} Actuated! Deep-Root Recovery Pulse initiated (${newOrder.targetVolume} @ 420 GPM).`,
    order: newOrder,
  });
});

// Get Active Irrigation Orders
app.get('/api/v1/telemetry/orders', (req, res) => {
  res.json({ orders: activeIrrigationOrders });
});

// Contacts CRUD
app.get('/api/v1/contacts', (req, res) => {
  res.json({ contacts, total: contacts.length });
});

app.post('/api/v1/contacts', (req, res) => {
  const { name, organization, type, email, phone, address, terms, taxId, notes } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required fields.' });
  }
  const newContact: Contact = {
    id: `AGR-C-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    organization: organization || 'Independent Agronomy Operator',
    type: type || 'farmer',
    email,
    phone,
    address: address || 'Regional Hub Address Pending',
    terms: terms || 'Net 30',
    taxId: taxId || 'FSA-PENDING',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };
  contacts.unshift(newContact);
  res.status(201).json({ success: true, contact: newContact });
});

// Purchase Orders CRUD
app.get('/api/v1/finance/orders', (req, res) => {
  res.json({ purchaseOrders, total: purchaseOrders.length });
});

app.post('/api/v1/finance/orders', (req, res) => {
  const { vendor, category, specification, analyticCenter, total, deliveryDate, terms } = req.body;
  const newPO: PurchaseOrder = {
    id: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    vendor: vendor || 'Apex Pivot & Pump Systems',
    category: category || 'Irrigation Hardware & Actuators',
    specification: specification || 'Precision Agri Hardware DTO',
    analyticCenter: analyticCenter || 'Sector 4-B Irrigation Upgrade',
    total: Number(total) || 4320.0,
    status: 'Bill Ready',
    deliveryDate: deliveryDate || '2025-03-05',
    terms: terms || 'Net 30 Days',
  };
  purchaseOrders.unshift(newPO);
  res.status(201).json({ success: true, message: 'Order POSTed to /api/v1/finance/orders successfully!', order: newPO });
});

// --- GEMINI INTELLIGENCE API ---

// 1. Multi-turn Chatbot endpoint with System Instructions
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, userRole = 'Agronomy Director' } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are AgriPulse AI, the elite precision agronomy and automated irrigation intelligence copilot for AgriPulse OS.
You assist field operators, farm managers, and agronomy directors with:
1. Soil moisture deficit triage (e.g. Sector 4-B Corn V8 with VWC 17.4%, ETc 6.8 mm/day, CWSI 0.68).
2. Automated irrigation scheduling, valve group pulsing, hydraulic pressure targets (420 GPM @ 42 PSI), and water rights allocation.
3. Agricultural Master Data (growers, USDA farm IDs, fertilizer SKUs, Chart of Accounts).
4. ERP financial transactions, procurement POs, and Q3 Kharif budget variance analysis (+12% heat deficit surge).
Provide clear, actionable, technical agronomic recommendations formatted cleanly with markdown bullet points, data figures, and crisp professional tone.`;

    // Format chat contents according to @google/genai SDK
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      role: 'model',
      text: response.text || 'Telemetry analyzed. All parameters within monitored thresholds.',
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: error?.message || 'Failed to process AI chat.' });
  }
});

// 2. Specialized Gemini Intelligence Analysis (Diagnostics, Deficit Analysis, Budget Variance)
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { taskType, context } = req.body;

    let prompt = '';
    if (taskType === 'soil_deficit') {
      prompt = `Perform an emergency agronomic diagnostic on Sector 4-B Corn V8:
Current Telemetry:
- Volumetric Water Content (VWC): 17.4% (Critical Safe Floor: 20.0%, Field Capacity: 33.0%)
- Evapotranspiration (ETc): 6.8 mm/day (High Heat Index, Solar Rad: 820 W/m², Temp: 34.2°C, RH: 28%)
- Crop Water Stress Index (CWSI): 0.68/1.0 (Elevated, Stomatal Closure Imminent)
- Root Zone: 30 cm depth, Wilting Risk: 88/100
- Hydraulic Mainline: 420 GPM @ 42 PSI (VFD 58.4 Hz)

Provide:
1. Immediate Diagnostic Assessment (Urgency level and physiological danger to Corn V8 stage).
2. Prescribed Irrigation Pulse (Duration, target gallons, valve group).
3. Risk Mitigation for downstream fertigation and yield impact.
Keep it concise, high-impact, and operational.`;
    } else if (taskType === 'financial_variance') {
      prompt = `Analyze Q3 Kharif Irrigation Budget Variance:
Current Financials:
- Sector 1 Wheat: $16,400 spent / $18,000 budget (91% - Under budget -$1,600)
- Sector 4-B Corn V8: $35,800 spent / $32,000 budget (112% - Heat Deficit Surge +$3,800)
- Sector 2 Alfalfa: $12,900 spent / $14,500 budget (89% - Under budget -$1,600)
- Sector 7 Citrus: $21,100 spent / $22,000 budget (96% - On target)
Root Allocation Drivers: Electricity & Pumping 54%, Water Allocations 26%, Labor 14%, Sensor SaaS 6%.
Peak grid tariff (14:00-18:00) pricing observed.

Provide:
1. Financial Variance Root-Cause Summary.
2. Net operating income impact (current EBIT: $86,300, 34.7% margin).
3. Strategic actions to offset heat surge without damaging crop yields.`;
    } else {
      prompt = `Analyze the following agronomic master data or context and provide optimization guidance: ${JSON.stringify(context || {})}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are AgriPulse AI, an automated agronomic intelligence engine.',
      },
    });

    res.json({
      taskType,
      analysis: response.text,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate agronomic analysis.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AgriPulse OS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
