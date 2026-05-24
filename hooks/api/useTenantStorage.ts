import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import { TenantStorageData, TenantStorageEnvelope } from "@/types/type-storage";

export const tenantStorageQueryKey = (tenantId: string) => ["tenant-storage", tenantId];

export const useTenantStorage = (tenantId: string) => {
  return useQuery({
    queryKey: tenantStorageQueryKey(tenantId),
    queryFn: async (): Promise<TenantStorageData> => {
      const { data } = await apiClient.get<TenantStorageEnvelope>(`/api/tenants/${tenantId}/storage`);
      return unwrapApiData(data);
    },
    enabled: !!tenantId,
  });
};
