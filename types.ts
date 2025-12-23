export interface AuthKey {
  id: string;
  key: string;
  valid_until: string; // ISO Date string
  duration: 'weekly' | 'monthly' | 'yearly';
  price: number;
  created_at: string;
  is_active: boolean;
  usage_count: number;
  deviceId?: string | null; // For Device Binding
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  modifiers?: string[];
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  paymentMethod: 'cash' | 'qris' | 'card';
  status: 'completed' | 'pending';
}

export interface DashboardStats {
  dailyTotal: number;
  transactionCount: number;
  avgTransaction: number;
}

export interface DebtRecord {
  id: string;
  customerName: string;
  amount: number;
  description: string;
  date: string;
  status: 'unpaid' | 'partial' | 'paid';
  payments: { date: string; amount: number }[];
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface ShopProfile {
  name: string;
  address: string;
  phone: string;
  footerMessage: string;
  logoUrl?: string;
}