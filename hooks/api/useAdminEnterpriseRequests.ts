import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  AdminEnterpriseRequest,
  AdminEnterpriseRequestListResponse,
  ScheduleDiscoveryDto,
  UpdateEnterpriseRequestStatusDto,
} from "@/types/admin-enterprise";
import type { EnterpriseRequestStatus } from "@/types/enterprise";

const QUERY_KEY = "admin-enterprise-requests";

export const adminEnterpriseRequestsQueryKey = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: EnterpriseRequestStatus;
  industry?: string;
  startDate?: string;
  endDate?: string;
}) => [QUERY_KEY, params] as const;

export const adminEnterpriseRequestQueryKey = (id: string) =>
  [QUERY_KEY, "detail", id] as const;

/**
 * GET /api/admin/enterprise-requests
 * List all enterprise requests (Super Admin).
 */
export const useAdminEnterpriseRequests = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: EnterpriseRequestStatus;
    industry?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  enabled = true
) =>
  useQuery<AdminEnterpriseRequestListResponse>({
    queryKey: adminEnterpriseRequestsQueryKey(params),
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/api/admin/enterprise-requests",
        { params }
      );
      return unwrapApiData(data);
    },
    enabled,
  });

/**
 * GET /api/admin/enterprise-requests/:id
 * Get single enterprise request detail (Super Admin).
 */
export const useAdminEnterpriseRequest = (id: string | null) =>
  useQuery<AdminEnterpriseRequest>({
    queryKey: adminEnterpriseRequestQueryKey(id ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/api/admin/enterprise-requests/${id}`
      );
      return unwrapApiData(data);
    },
    enabled: !!id,
  });

/**
 * PATCH /api/admin/enterprise-requests/:id/discovery
 * Schedule discovery meeting.
 */
export const useScheduleDiscovery = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Discovery meeting scheduled",
      errorMessage: "Failed to schedule discovery meeting",
    },
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: ScheduleDiscoveryDto;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/api/admin/enterprise-requests/${id}/discovery`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: adminEnterpriseRequestQueryKey(vars.id) });
    },
  });
};

/**
 * POST /api/admin/invoices/custom
 * Issue a custom invoice for DISCOVERY_MEETING → CONTRACT_ONBOARDING.
 * Backend auto-advances status to CONTRACT_ONBOARDING on invoice creation.
 */
export const useCreateCustomInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Custom invoice issued",
      errorMessage: "Failed to issue custom invoice",
    },
    mutationFn: async (dto: {
      tenantId: string;
      amount: number;
      maxUsers: number;
      maxWorkspaces: number;
      maxStorageGb: number;
      apiHitsLimit: number;
      durationDays: number;
      description: string;
      enterpriseRequestId?: string;
    }) => {
      const { data } = await apiClient.post<any>(
        "/api/admin/invoices/custom",
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

/**
 * GET /api/admin/invoices/enterprise-users/:enterpriseRequestId
 * Returns all data needed for the custom invoice form (tenantId, quotas, contact, etc.)
 */
export const useGetEnterpriseRequestForInvoice = (enterpriseRequestId: string | null) =>
  useQuery<{
    enterpriseRequestId: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactTitle: string;
    contactDepartment: string;
    companySize: string;
    billingType: string;
    budgetRange: string;
    industry: string;
    requestedUsers: number;
    requestedWorkspaces: number;
    requestedStorageGb: number;
    requestedApiHits: number;
    additionalNotes: string | null;
    status: string;
    meetingDate: string | null;
    meetingPlatform: string | null;
    meetingLink: string | null;
    userId: string;
    userFullName: string;
    userEmail: string;
    tenantId: string | null;
    tenant: {
      id: string;
      name: string;
      tier: string;
      maxUsers: number | null;
      maxWorkspaces: number | null;
      maxStorageGb: number | null;
      apiHitsLimit: number | null;
      subscriptionEndsAt: string | null;
    } | null;
  }>({
    queryKey: ["admin-invoice-enterprise-data", enterpriseRequestId],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        `/api/admin/invoices/enterprise-users/${enterpriseRequestId}`
      );
      return unwrapApiData(data);
    },
    enabled: !!enterpriseRequestId,
  });

export const useUpdateEnterpriseRequestStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Request status updated",
      errorMessage: "Failed to update request status",
    },
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateEnterpriseRequestStatusDto;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/api/admin/enterprise-requests/${id}/status`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: adminEnterpriseRequestQueryKey(vars.id) });
    },
  });
};
