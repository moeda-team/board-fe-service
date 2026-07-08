import type { ApiEnvelope } from "./api";
import type { PaymentTier } from "./payments";

export interface AdminTenant {
  id: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  tier: PaymentTier;
  maxUsers: number;
  maxWorkspaces: number;
  maxStorage: number;
  usedStorage: number;
  tierValidUntil: string | null;
  isReadonly: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    workspaces: number;
  };
}

export interface OverrideTenantLimitsDto {
  maxUsers?: number;
  maxWorkspaces?: number;
  maxStorageGb?: number;
  validUntil?: string;
}

export type AdminTenantEnvelope = ApiEnvelope<AdminTenant>;
export type AdminTenantListEnvelope = ApiEnvelope<AdminTenant[]>;
