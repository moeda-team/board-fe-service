import { ApiEnvelope } from "./api";

// Payment transaction types
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED";
export type PaymentTier = "FREE" | "BASIC" | "PRO" | "CUSTOM";

export interface Plan {
  id: string;
  tier: PaymentTier;
  name: string;
  description: string;
  basePrice: number;
  maxUsers: number;
  baseStorage: number; // bytes
  maxWorkspaces: number; // 0 = unlimited
  pricePerGb: number;
  originalPrice: number | null; // price anchoring (nullable)
  campaignName: string | null; // promo event name (nullable)
  campaignEndDate: string | null; // ISO 8601 datetime (nullable)
  durationDays: number; // 0 = unlimited/forever
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotPlan {
  name: string;
  maxUsers: number;
  basePrice: number;
  pricePerGb: number;
  baseStorage: number;
  maxStorage: number;
  maxWorkspaces: number; // 0 = unlimited
  originalPrice: number | null;
  campaignName: string | null;
  durationDays: number;
}

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  orderId: string;
  grossAmount: number;
  paymentMethod: string | null;
  status: PaymentStatus;
  tierToUpgrade: PaymentTier;
  snapToken: string;
  snapRedirectUrl: string;
  snapshotPlan: SnapshotPlan;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  tenantId: string;
  tierToUpgrade: "BASIC" | "PRO"; // CUSTOM blocked from self-serve; FREE not allowed
}

export interface CheckoutResponse {
  token: string; // Midtrans Snap token for frontend
  redirect_url: string; // Midtrans Snap redirect URL
}

export interface PaymentHistoryParams {
  tenantId: string;
  page?: number;
  limit?: number;
}

export interface PaymentHistoryResponse {
  items: PaymentTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CurrentPlanResponse {
  tenantId: string;
  tier: PaymentTier;
  maxUsers: number;
  maxWorkspaces: number; // 0 = unlimited
  maxStorage: number; // bytes
  usedStorage: number; // bytes
  tierValidUntil: string | null;
  isExpired: boolean;
  plan: {
    tier: PaymentTier;
    name: string;
    description: string;
    basePrice: number;
    maxUsers: number;
    maxWorkspaces: number; // 0 = unlimited
    baseStorage: number;
    pricePerGb: number;
    durationDays: number; // 0 = unlimited/forever
    isActive: boolean;
  };
}

// Custom (enterprise) invoice request
// Note on "unlimited" semantics expected by the backend:
//  - amount, maxUsers, maxWorkspaces, maxStorageGb => 0 means unlimited
//  - apiHitsLimit => -1 means unlimited
export interface CustomInvoiceRequest {
  tenantId: string;
  amount: number;
  maxUsers: number;
  maxWorkspaces: number;
  maxStorageGb: number;
  apiHitsLimit: number;
  durationDays: number;
  description: string;
  enterpriseRequestId: string;
}

export interface CustomInvoiceResponse {
  id?: string;
  orderId?: string;
  [key: string]: unknown;
}

// API Envelope types
export type CheckoutEnvelope = ApiEnvelope<CheckoutResponse>;
export type CustomInvoiceEnvelope = ApiEnvelope<CustomInvoiceResponse>;
export type PaymentHistoryEnvelope = ApiEnvelope<PaymentHistoryResponse>;
export type PendingPaymentEnvelope = ApiEnvelope<PaymentTransaction | null>;
export type CancelPaymentEnvelope = ApiEnvelope<{ message: string }>;
export type PlansEnvelope = ApiEnvelope<Plan[]>;
export type CurrentPlanEnvelope = ApiEnvelope<CurrentPlanResponse>;
