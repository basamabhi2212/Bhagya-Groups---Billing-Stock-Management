
import { AppSettings, CompanyDetails } from './types';

export const GST_RATE = 0.18; // 18%

export const DEFAULT_COMPANY_DETAILS: CompanyDetails = {
  name: 'Bhagya Groups',
  address1: 'Beeramguda, Hyderabad',
  address2: 'Telangana, India',
  email: 'bhagyagroups@gmail.com',
  contact: '+91-XXXXXXXXXX',
  gstin: 'YOUR_GSTIN_HERE',
};

export const DEFAULT_SETTINGS: AppSettings = {
  companyDetails: DEFAULT_COMPANY_DETAILS,
  logoBase64: null,
  watermarkBase64: null,
  invoicePrefix: 'INV/BG/',
  githubToken: '',
  githubRepo: '',
  theme: 'light',
  lowStockThreshold: 10,
};

export const GITHUB_DATA_PATHS = {
  products: 'data/products.json',
  stock: 'data/stock.json',
  estimates: 'data/estimates.json',
  invoices: 'data/invoices.json',
  settings: 'data/settings.json',
};
