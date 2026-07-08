import { ApiEnvelope } from "./api";

export type EnterpriseRequestStatus =
  | "REQUIREMENT_REVIEW"
  | "DISCOVERY_MEETING"
  | "CONTRACT_ONBOARDING"
  | "COMPLETED"
  | "CANCELED";

export type EnterpriseBillingType = "MONTHLY" | "ANNUAL" | "MULTI_YEAR";

export interface EnterpriseRequest {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  companyWebsite: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactDepartment: string;
  requestedUsers: number;
  requestedWorkspaces: number;
  requestedStorageGb: number;
  requestedApiHits: number;
  budgetRange: string;
  billingType: EnterpriseBillingType;
  additionalNotes: string;
  status?: EnterpriseRequestStatus;
  meetingDate?: string | null;
  meetingPlatform?: string | null;
  meetingLink?: string | null;
  tenantId?: string | null;
  tenant?: {
    id: string;
    name: string;
    tier: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnterpriseRequest {
  companyName: string;
  industry: string;
  companySize: string;
  companyWebsite: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactDepartment: string;
  requestedUsers: number;
  requestedWorkspaces: number;
  requestedStorageGb: number;
  requestedApiHits: number;
  budgetRange: string;
  billingType: EnterpriseBillingType;
  additionalNotes: string;
}

export interface EnterpriseRequestListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnterpriseRequestStatus;
  industry?: string;
}

export interface EnterpriseRequestListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EnterpriseRequestListResponse {
  items: EnterpriseRequest[];
  meta: EnterpriseRequestListMeta;
}

export type EnterpriseRequestListEnvelope = ApiEnvelope<EnterpriseRequestListResponse>;
export type EnterpriseRequestEnvelope = ApiEnvelope<EnterpriseRequest>;
