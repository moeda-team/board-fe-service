import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CreateRoleDto, UpdateRoleDto, Role } from "@/types/api";

export const createRole = async ({ tenantId, dto }: { tenantId: string; dto: CreateRoleDto }): Promise<Role> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/roles`, dto);
  return data;
};

export const fetchRoles = async (tenantId: string): Promise<Role[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/roles`);
  return data;
};

export const fetchRoleDetail = async ({ tenantId, roleId }: { tenantId: string; roleId: string }): Promise<Role> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/roles/${roleId}`);
  return data;
};

export const updateRole = async ({ tenantId, roleId, dto }: { tenantId: string; roleId: string; dto: UpdateRoleDto }): Promise<Role> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/roles/${roleId}`, dto);
  return data;
};

export const deleteRole = async ({ tenantId, roleId }: { tenantId: string; roleId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/roles/${roleId}`);
};

export const useCreateRole = () => useMutation({ mutationFn: createRole });
export const useRoles = (tenantId: string) => useQuery({ queryKey: ["roles", tenantId], queryFn: () => fetchRoles(tenantId) });
export const useRoleDetail = (tenantId: string, roleId: string) => useQuery({ queryKey: ["roles", tenantId, roleId], queryFn: () => fetchRoleDetail({ tenantId, roleId }) });
export const useUpdateRole = () => useMutation({ mutationFn: updateRole });
export const useDeleteRole = () => useMutation({ mutationFn: deleteRole });
