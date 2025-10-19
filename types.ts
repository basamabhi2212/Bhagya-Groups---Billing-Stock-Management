
export interface Product {
  id: string;
  name: string;
  specification: string;
  quantity: number;
  unitPrice: number;
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  notes: string;
}

export interface LineItem {
  productId: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
}

export interface Customer {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface Estimate {
  id: string;
  estimateNumber: string;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  date: string;
  status: 'draft' | 'sent' | 'invoiced';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  estimateId?: string;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  total: number;
  date: string;
  status: 'draft' | 'paid' | 'overdue';
}

export interface CompanyDetails {
  name: string;
  address1: string;
  address2: string;
  email: string;
  contact: string;
  gstin: string;
}

export interface AppSettings {
  companyDetails: CompanyDetails;
  logoBase64: string | null;
  watermarkBase64: string | null;
  invoicePrefix: string;
  githubToken: string;
  githubRepo: string; // e.g., "username/repo-name"
  theme: 'light' | 'dark';
  lowStockThreshold: number;
}
