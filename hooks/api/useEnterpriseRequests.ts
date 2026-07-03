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

export const enterpriseRequestsQueryKey = (params?: EnterpriseRequestListParams) => [
  "enterprise-requests",
  params?.page ?? 1,
  params?.limit ?? 10,
  params?.search ?? "",
  params?.status ?? "",
  params?.industry ?? ""
];

export const useEnterpriseRequests = (params: EnterpriseRequestListParams = {}) =>
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
    }
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
