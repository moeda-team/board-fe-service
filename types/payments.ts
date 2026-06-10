import { ApiEnvelope } from "./api";

// Payment transaction types
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "EXPIRED";
export type PaymentTier = "FREE" | "PRO" | "CUSTOM" | "ENTERPRISE";

export interface Plan {
  id: string;
  tier: PaymentTier;
  name: string;
  description: string;
  basePrice: string;
  maxUsers: number;
  baseStorage: number; // bytes
  pricePerGb: string;
  durationDays: number;
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
  requestedStorageGb: number;
  snapToken: string;
  snapRedirectUrl: string;
  snapshotPlan: SnapshotPlan;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutRequest {
  tenantId: string;
  tierToUpgrade: Exclude<PaymentTier, "FREE">; // Can't checkout for free tier
  requestedStorageGb: number;
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
    baseStorage: number;
    pricePerGb: number;
    durationDays: number;
    isActive: boolean;
  };
}

// API Envelope types
export type CheckoutEnvelope = ApiEnvelope<CheckoutResponse>;
export type PaymentHistoryEnvelope = ApiEnvelope<PaymentHistoryResponse>;
export type PendingPaymentEnvelope = ApiEnvelope<PaymentTransaction | null>;
export type CancelPaymentEnvelope = ApiEnvelope<{ message: string }>;
export type PlansEnvelope = ApiEnvelope<Plan[]>;
export type CurrentPlanEnvelope = ApiEnvelope<CurrentPlanResponse>;
