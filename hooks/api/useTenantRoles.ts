import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CreateRoleParams,
  DeleteRoleParams,
  Role,
  RoleEnvelope,
  RolesEnvelope,
  UpdateRoleParams
} from "@/types/type-tenant-roles";

export const useRoles = (tenantId: string) => useQuery({
  queryKey: ["roles", tenantId],
  queryFn: async () => {
    const { data } = await apiClient.get<RolesEnvelope>(`/api/tenants/${tenantId}/roles`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && tenantId !== "undefined" && tenantId !== "null"
});

export const useRoleDetail = (tenantId: string, roleId: string) => useQuery({
  queryKey: ["roles", tenantId, roleId],
  queryFn: async () => {
    const { data } = await apiClient.get<RoleEnvelope>(`/api/tenants/${tenantId}/roles/${roleId}`);
    return unwrapApiData(data);
  },
  enabled: !!tenantId && !!roleId && tenantId !== "undefined" && tenantId !== "null" && roleId !== "undefined" && roleId !== "null"
});

export const useCreateRole = () => useMutation({
  meta: { successMessage: "Role created", errorMessage: "Failed to create role" },
  mutationFn: async ({ tenantId, dto }: CreateRoleParams): Promise<Role> => {
    const { data } = await apiClient.post<RoleEnvelope>(`/api/tenants/${tenantId}/roles`, dto);
    return unwrapApiData(data);
  }
});

export const useUpdateRole = () => useMutation({
  meta: { successMessage: "Role updated", errorMessage: "Failed to update role" },
  mutationFn: async ({ tenantId, roleId, dto }: UpdateRoleParams): Promise<Role> => {
    const { data } = await apiClient.patch<RoleEnvelope>(`/api/tenants/${tenantId}/roles/${roleId}`, dto);
    return unwrapApiData(data);
  }
});

export const useDeleteRole = () => useMutation({
  meta: { successMessage: "Role deleted", errorMessage: "Failed to delete role" },
  mutationFn: async ({ tenantId, roleId }: DeleteRoleParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/roles/${roleId}`);
  }
});
