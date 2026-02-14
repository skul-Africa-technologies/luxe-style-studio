// User and Session Types for Persistent Session System

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  activities?: UserActivity[];
  transactions?: Transaction[];
}

export interface UserActivity {
  id: string;
  userId: string;
  type: ActivityType;
  data: Record<string, unknown>;
  timestamp: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  items: TransactionItem[];
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type ActivityType = 
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_started'
  | 'purchase_completed'
  | 'form_submitted'
  | 'search_query'
  | 'interaction';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface SessionState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  error: string | null;
}

export interface EmailFormData {
  email: string;
}

export interface ActivitySaveRequest {
  userId: string;
  type: ActivityType;
  data: Record<string, unknown>;
}

export interface TransactionSaveRequest {
  userId: string;
  amount: number;
  currency: string;
  items: TransactionItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
