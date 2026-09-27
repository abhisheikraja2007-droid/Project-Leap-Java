export type ActiveTab = 'dashboard' | 'telemetry-dispatch' | 'master-data' | 'financials' | 'analytics-reporting';

export type UserRole = 'Field Operator' | 'Agronomy Director';

export interface Contact {
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
  createdAt?: string;
}

export interface PurchaseOrder {
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

export interface TelemetryEntry {
  id: string;
  field: string;
  depth: string;
  moisture: number;
  salinity: number;
  soilTemp: number;
  operatorNotes: string;
  loggedAt: string;
}

export interface IrrigationOrder {
  id: string;
  title: string;
  status: string;
  flowRate: string;
  duration: string;
  valve: string;
  targetVolume: string;
  activePulse: string;
  type: 'emergency' | 'scheduled' | 'completed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface VendorBill {
  id: string;
  billNumber: string;
  poNumber: string;
  vendor: string;
  billDate: string;
  dueDate: string;
  total: number;
  status: 'AWAITING_APPROVAL' | 'APPROVED' | 'PAID' | 'VOIDED';
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: string;
  farmerId: string;
  serviceOrProduct: string;
  quantity: number;
  price: number;
  tax: number;
  total: number;
  sectorName: string;
  status: 'BOOKED' | 'DISPATCHED' | 'INVOICED' | 'SETTLED';
  date: string;
}

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  soNumber: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  status: 'OUTSTANDING' | 'SETTLED_ACH' | 'PARTIALLY_PAID';
}

export interface PaymentRecord {
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

export interface JournalRecord {
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

export interface TelemetryRequestDTO {
  sensorId: string;
  moistureLevel: number;
  temperature: number;
  timestamp: string;
}

export interface MasterDataContactDTO {
  id?: number;
  name: string;
  type: 'Farmer' | 'Vendor' | 'Both';
  email: string;
  mobile: string;
  address: string;
}
