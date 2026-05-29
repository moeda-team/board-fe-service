import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData, type ApiEnvelope } from "@/types/api";
import type { Tenant } from "@/types/type-tenants";

interface UpdateTenantParams {
  tenantId: string;
  name: string;
}

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      successMessage: "Organization renamed",
      errorMessage: "Failed to rename organization"
    },
    mutationFn: async ({ tenantId, name }: UpdateTenantParams): Promise<Tenant> => {
      const { data } = await apiClient.patch<ApiEnvelope<Tenant>>(`/api/tenants/${tenantId}`, { name });
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      await queryClient.invalidateQueries({ queryKey: ["tenants"] });
      await queryClient.invalidateQueries({ queryKey: ["tenant", variables.tenantId] });
    }
  });
};
