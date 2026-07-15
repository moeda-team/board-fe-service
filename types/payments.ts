import { ApiEnvelope } from "./api";

// Payment transaction types
// Status: uppercase = FE-only state, lowercase = Midtrans raw status
export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  // Midtrans raw statuses
  | "settlement"
  | "capture"
  | "cancel"
  | "expire"
  | "deny"
  | "failure";

export type PaymentTier = "FREE" | "BASIC" | "PRO" | "CUSTOM";
export type TenantSubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED";

// ─── Plans ────────────────────────────────────────────────────────────────────

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
  originalPrice: number | null;
  campaignName: string | null;
  campaignEndDate: string | null;
  durationDays: number; // 0 = unlimited/forever
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotPlan {
  name: string;
  maxUsers: number;
  maxWorkspaces: number;
  basePrice: number;
  pricePerGb: number;
  baseStorage: number;
  maxStorage: number;
  apiHitsLimit: number;
  originalPrice: number | null;
  campaignName: string | null;
  durationDays: number;
  description?: string;
  enterpriseRequestId?: string;
}

// ─── Payment Transaction ─────────────────────────────────────────────────────

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  orderId: string;
  grossAmount: number;
  paymentMethod: string | null;
  status: PaymentStatus;
  tierToUpgrade: PaymentTier;
  requestedStorageGb: number;
  snapToken: string;
  snapRedirectUrl: string;
  snapshotPlan: SnapshotPlan;
  paymentUrl?: string; // alias from snapRedirectUrl (custom pending endpoint)
  createdAt: string;
  updatedAt: string;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutRequest {
  tenantId: string;
  tierToUpgrade: "BASIC" | "PRO"; // CUSTOM blocked from self-serve; FREE not allowed
}

export interface CheckoutResponse {
  token: string; // Midtrans Snap token for frontend
  redirect_url: string; // Midtrans Snap redirect URL
}

// ─── Current plan ─────────────────────────────────────────────────────────────

export interface CurrentPlanResponse {
  tenantId: string;
  tier: PaymentTier;
  maxUsers: number;
  maxWorkspaces: number; // 0 = unlimited
  maxStorage: number; // bytes
  usedStorage: number; // bytes
  tierValidUntil: string | null; // ISO date string
  isExpired: boolean;
  isReadonly?: boolean; // tenant is in read-only mode
  isAutoRenew?: boolean; // subscription auto-renew is active
  subscriptionStatus?: TenantSubscriptionStatus;
  plan: {
    tier: PaymentTier;
    name: string;
    description: string;
    basePrice: number;
    maxUsers: number;
    maxWorkspaces: number;
    baseStorage: number;
    pricePerGb: number;
    durationDays: number;
    isActive: boolean;
  } | null;
}

// ─── History ──────────────────────────────────────────────────────────────────

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

// Custom (Enterprise) full history — no pagination, newest first
export interface CustomPaymentHistoryResponse {
  items: PaymentTransaction[];
}

// ─── Custom Invoice (Admin) ───────────────────────────────────────────────────

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

// ─── API Envelopes ────────────────────────────────────────────────────────────

export type CheckoutEnvelope = ApiEnvelope<CheckoutResponse>;
export type CustomInvoiceEnvelope = ApiEnvelope<CustomInvoiceResponse>;
export type PaymentHistoryEnvelope = ApiEnvelope<PaymentHistoryResponse>;
export type CustomPaymentHistoryEnvelope = ApiEnvelope<CustomPaymentHistoryResponse>;
export type PendingPaymentEnvelope = ApiEnvelope<PaymentTransaction | null>;
export type CancelPaymentEnvelope = ApiEnvelope<{ message: string }>;
export type PlansEnvelope = ApiEnvelope<Plan[]>;
export type CurrentPlanEnvelope = ApiEnvelope<CurrentPlanResponse>;
export type CancelRenewalEnvelope = ApiEnvelope<{ message: string }>;
