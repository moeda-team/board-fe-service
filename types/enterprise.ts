import { ApiEnvelope } from "./api";

export type EnterpriseRequestStatus =
  | "REQUIREMENT_REVIEW"
  | "DISCOVERY_MEETING"
  | "CONTRACT_ONBOARDING"
  | "COMPLETED"
  | "CANCELED";

export type EnterpriseRequestStatusLabel =
  | "New"
  | "Under Review"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";

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

export interface EnterpriseRequestManager {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface AdminEnterpriseRequest extends EnterpriseRequest {
  assignedAccountManager?: EnterpriseRequestManager | null;
  estimatedValue?: number | null;
}

export interface AdminEnterpriseRequestListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnterpriseRequestStatus;
  industry?: string;
  budget?: string;
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

export interface AdminEnterpriseRequestListResponse {
  items: AdminEnterpriseRequest[];
  meta: EnterpriseRequestListMeta;
}

export interface EnterpriseRequestListResponse {
  items: EnterpriseRequest[];
  meta: EnterpriseRequestListMeta;
}

export interface UpdateEnterpriseRequestParams {
  id: string;
  status: EnterpriseRequestStatus;
}

export type AdminEnterpriseRequestListEnvelope = ApiEnvelope<AdminEnterpriseRequestListResponse>;
export type AdminEnterpriseRequestEnvelope = ApiEnvelope<AdminEnterpriseRequest>;
export type EnterpriseRequestListEnvelope = ApiEnvelope<EnterpriseRequestListResponse>;
export type EnterpriseRequestEnvelope = ApiEnvelope<EnterpriseRequest>;
