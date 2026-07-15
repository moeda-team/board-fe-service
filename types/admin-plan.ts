import type { ApiEnvelope } from "./api";

export type AdminPlanTier = "FREE" | "BASIC" | "PRO" | "CUSTOM";

export interface AdminPlan {
  id: string;
  tier: AdminPlanTier;
  name: string;
  description: string | null;
  basePrice: number;
  maxUsers: number;
  baseStorage: number;
  maxWorkspaces: number;
  pricePerGb: number | null;
  isActive: boolean;
  originalPrice: number | null;
  campaignName: string | null;
  campaignEndDate: string | null;
  durationDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  tier: AdminPlanTier;
  name: string;
  description?: string;
  basePrice: number;
  maxUsers: number;
  baseStorage: number;
  maxWorkspaces: number;
  pricePerGb?: number;
  isActive?: boolean;
  originalPrice?: number;
  campaignName?: string;
  campaignEndDate?: string;
  durationDays?: number;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export type AdminPlanListEnvelope = ApiEnvelope<AdminPlan[]>;
export type AdminPlanEnvelope = ApiEnvelope<AdminPlan>;
