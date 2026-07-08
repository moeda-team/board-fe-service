import type { ApiEnvelope } from "./api";
import type { EnterpriseRequestStatus, EnterpriseBillingType } from "./enterprise";

export interface AdminEnterpriseRequest {
  id: string;
  userId: string;
  tenantId: string | null;
  companyName: string;
  industry: string;
  companySize: string;
  companyWebsite: string | null;
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
  additionalNotes: string | null;
  status: EnterpriseRequestStatus;
  meetingDate: string | null;
  meetingPlatform: string | null;
  meetingLink: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  tenant?: {
    id: string;
    name: string;
    tier: string;
  } | null;
}

export interface AdminEnterpriseRequestListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminEnterpriseRequestListResponse {
  items: AdminEnterpriseRequest[];
  meta: AdminEnterpriseRequestListMeta;
  statusCounts?: Record<EnterpriseRequestStatus, number>;
}

export interface ScheduleDiscoveryDto {
  meetingDate: string;
  meetingPlatform: string;
  meetingLink: string;
}

export interface UpdateEnterpriseRequestStatusDto {
  status: EnterpriseRequestStatus;
}

export type AdminEnterpriseRequestListEnvelope =
  ApiEnvelope<AdminEnterpriseRequestListResponse>;
export type AdminEnterpriseRequestEnvelope =
  ApiEnvelope<AdminEnterpriseRequest>;
