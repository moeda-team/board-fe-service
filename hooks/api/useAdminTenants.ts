import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type { AdminTenant, OverrideTenantLimitsDto } from "@/types/admin-tenant";

const QUERY_KEY = "admin-tenants";

export const adminTenantsQueryKey = () => [QUERY_KEY] as const;
export const adminTenantQueryKey = (id: string) => [QUERY_KEY, id] as const;

/**
 * GET /api/admin/tenants
 * List all tenants (Super Admin). Reuses the existing tenants list endpoint.
 */
export const useAdminTenants = (enabled = true) =>
  useQuery<AdminTenant[]>({
    queryKey: adminTenantsQueryKey(),
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/api/tenants");
      return unwrapApiData(data) ?? [];
    },
    enabled,
  });

/**
 * PATCH /api/admin/tenants/:tenantId/custom-limits
 * Override tenant limits (set to CUSTOM tier).
 */
export const useOverrideTenantLimits = () => {
  const qc = useQueryClient();
  return useMutation({
    meta: {
      successMessage: "Tenant limits updated",
      errorMessage: "Failed to update tenant limits",
    },
    mutationFn: async ({
      tenantId,
      dto,
    }: {
      tenantId: string;
      dto: OverrideTenantLimitsDto;
    }) => {
      const { data } = await apiClient.patch<any>(
        `/api/admin/tenants/${tenantId}/custom-limits`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminTenantsQueryKey() });
    },
  });
};
