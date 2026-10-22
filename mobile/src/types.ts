export type OrderStatus =
  | "new"
  | "quoted"
  | "confirmed"
  | "in_progress"
  | "delivered"
  | "cancelled";

export interface AdminUser {
  id: string;
  name: string;
  role: string;
}

export interface Order {
  id: string;
  orderId: string;
  name: string;
  contact: string;
  referral: string;
  language: string;
  documentType: string;
  words: number;
  baseAmount: number;
  rushFee: number;
  rushTier: string;
  turnaroundMinutes: number;
  quote: number;
  currency: string;
  deadline: string | null;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actor: string;
  createdAt: string;
}

export interface Quote {
  id: string;
  quoteId: string;
  language: string;
  documentType: string;
  words: number;
  baseAmount: number;
  rushFee: number;
  rushTier: string;
  turnaroundMinutes: number;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

export interface OrderStats {
  total: number;
  newCount: number;
  activeCount: number;
  deliveredCount: number;
  totalValue: number;
}

export interface LoginResponse {
  ok: true;
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AdminUser;
}

export interface OrdersResponse {
  ok: true;
  orders: Order[];
  stats: OrderStats;
  serverTime: string;
}

export interface OrderDetailResponse {
  ok: true;
  order: Order;
  events: OrderEvent[];
}

export interface QuotesResponse {
  ok: true;
  quotes: Quote[];
  totalValue: number;
  serverTime: string;
}
