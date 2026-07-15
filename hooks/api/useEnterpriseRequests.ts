import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import {
  CreateEnterpriseRequest,
  EnterpriseRequest,
  EnterpriseRequestEnvelope,
  EnterpriseRequestListEnvelope,
  EnterpriseRequestListParams,
  EnterpriseRequestListResponse
} from "@/types/enterprise";
import type { Session } from "next-auth";

export const enterpriseRequestsQueryKey = (params?: EnterpriseRequestListParams) => [
  "enterprise-requests",
  params?.page ?? 1,
  params?.limit ?? 10,
  params?.search ?? "",
  params?.status ?? "",
  params?.industry ?? ""
];

export const useEnterpriseRequests = (
  params: EnterpriseRequestListParams = {},
  session?: Session | null,
) =>
  useQuery({
    queryKey: enterpriseRequestsQueryKey(params),
    queryFn: async (): Promise<EnterpriseRequestListResponse> => {
      const { data } = await apiClient.get<EnterpriseRequestListEnvelope>(
        "/api/enterprise-requests",
        {
          params: {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search,
            status: params.status,
            industry: params.industry
          }
        }
      );
      return unwrapApiData(data);
    },
    enabled: !!session?.accessToken,
  });

export const useCreateEnterpriseRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Enterprise request submitted",
      errorMessage: "Failed to submit enterprise request"
    },
    mutationFn: async (request: CreateEnterpriseRequest): Promise<EnterpriseRequest> => {
      const { data } = await apiClient.post<EnterpriseRequestEnvelope>(
        "/api/enterprise-requests",
        request
      );
      return unwrapApiData(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["enterprise-requests"]
      });
    }
  });
};

/**
 * GET /api/enterprise-requests/me
 * Returns the user's active (non-terminal) enterprise request.
 * Use this on /enterprise to decide whether to show the form or redirect to /submitted.
 */
export const useGetMyActiveEnterpriseRequest = (session?: Session | null) =>
  useQuery<EnterpriseRequest | null>({
    queryKey: ["enterprise-requests", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<EnterpriseRequestEnvelope>(
        "/api/enterprise-requests/me"
      );
      return unwrapApiData(data);
    },
    enabled: !!session?.accessToken,
  });

/**
 * GET /api/enterprise-requests/me/latest
 * Returns the user's latest enterprise request (any status, including COMPLETED/CANCELED).
 * Use this on /enterprise/submitted to display the full status timeline.
 */
export const useGetMyLatestEnterpriseRequest = (session?: Session | null) =>
  useQuery<EnterpriseRequest | null>({
    queryKey: ["enterprise-requests", "me", "latest"],
    queryFn: async () => {
      const { data } = await apiClient.get<EnterpriseRequestEnvelope>(
        "/api/enterprise-requests/me/latest"
      );
      return unwrapApiData(data);
    },
    enabled: !!session?.accessToken,
  });

/**
 * GET /api/payments/custom/pending?tenantId=X
 * Returns the pending custom invoice for a tenant with snapRedirectUrl.
 */
export const useGetCustomPendingInvoice = (tenantId?: string | null, session?: Session | null) =>
  useQuery<{
    id: string;
    orderId: string;
    grossAmount: number;
    status: string;
    paymentUrl: string | null;
    snapToken: string | null;
  } | null>({
    queryKey: ["payments", "custom-pending", tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ statusCode: number; status: string; data: any }>(
        "/api/payments/custom/pending",
        { params: { tenantId } }
      );
      return unwrapApiData(data);
    },
    enabled: !!session?.accessToken && !!tenantId,
  });
