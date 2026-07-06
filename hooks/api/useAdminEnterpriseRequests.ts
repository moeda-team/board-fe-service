import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  AdminEnterpriseRequest,
  AdminEnterpriseRequestEnvelope,
  AdminEnterpriseRequestListEnvelope,
  AdminEnterpriseRequestListParams,
  AdminEnterpriseRequestListResponse,
  EnterpriseRequestStatus,
  UpdateEnterpriseRequestParams
} from "@/types/enterprise";

const QUERY_KEY = "admin-enterprise-requests";

export const adminEnterpriseRequestsQueryKey = (
  params?: AdminEnterpriseRequestListParams
) =>
  [
    QUERY_KEY,
    params?.page ?? 1,
    params?.limit ?? 10,
    params?.search ?? "",
    params?.status ?? "",
    params?.industry ?? "",
    params?.budget ?? ""
  ] as const;

export const adminEnterpriseRequestQueryKey = (id: string) =>
  [QUERY_KEY, id] as const;

/**
 * GET /api/admin/enterprise-requests
 * List all enterprise requests (Super Admin).
 */
export const useAdminEnterpriseRequests = (
  params: AdminEnterpriseRequestListParams = {},
  enabled = true
) =>
  useQuery({
    queryKey: adminEnterpriseRequestsQueryKey(params),
    queryFn: async (): Promise<AdminEnterpriseRequestListResponse> => {
      const { data } = await apiClient.get<AdminEnterpriseRequestListEnvelope>(
        "/api/admin/enterprise-requests",
        {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search,
            status: params.status,
            industry: params.industry,
            budget: params.budget
          }
        }
      );
      return unwrapApiData(data);
    },
    enabled
  });

/**
 * GET /api/admin/enterprise-requests/:id
 * Get enterprise request detail (Super Admin).
 */
export const useAdminEnterpriseRequest = (id: string | null, enabled = true) =>
  useQuery<AdminEnterpriseRequest>({
    queryKey: adminEnterpriseRequestQueryKey(id ?? ""),
    queryFn: async () => {
      const { data } = await apiClient.get<AdminEnterpriseRequestEnvelope>(
        `/api/admin/enterprise-requests/${id}`
      );
      return unwrapApiData(data);
    },
    enabled: !!id && enabled
  });

/**
 * PATCH /api/admin/enterprise-requests/:id/status
 * Update enterprise request status (Super Admin).
 */
export const useUpdateEnterpriseRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Status updated",
      errorMessage: "Failed to update status"
    },
    mutationFn: async ({
      id,
      status
    }: UpdateEnterpriseRequestParams): Promise<AdminEnterpriseRequest> => {
      const { data } = await apiClient.patch<AdminEnterpriseRequestEnvelope>(
        `/api/admin/enterprise-requests/${id}/status`,
        { status }
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: adminEnterpriseRequestsQueryKey()
      });
      await queryClient.invalidateQueries({
        queryKey: adminEnterpriseRequestQueryKey(variables.id)
      });
    }
  });
};

export const useAssignEnterpriseRequestManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Account manager assigned",
      errorMessage: "Failed to assign account manager"
    },
    mutationFn: async ({
      id,
      managerId
    }: {
      id: string;
      managerId: string;
    }): Promise<AdminEnterpriseRequest> => {
      const { data } = await apiClient.patch<AdminEnterpriseRequestEnvelope>(
        `/api/admin/enterprise-requests/${id}/assign`,
        { managerId }
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: adminEnterpriseRequestsQueryKey()
      });
      await queryClient.invalidateQueries({
        queryKey: adminEnterpriseRequestQueryKey(variables.id)
      });
    }
  });
};
