import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { AddWorkspaceMemberDto, Member } from "@/types/api";

export const fetchAvailableWorkspaceMembers = async ({ tenantId, workspaceId }: { tenantId: string; workspaceId: string }): Promise<Member[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members/available`);
  return data;
};

export const fetchWorkspaceMembers = async ({ tenantId, workspaceId }: { tenantId: string; workspaceId: string }): Promise<Member[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members`);
  return data;
};

export const addWorkspaceMember = async ({ tenantId, workspaceId, dto }: { tenantId: string; workspaceId: string; dto: AddWorkspaceMemberDto }): Promise<Member> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members`, dto);
  return data;
};

export const removeWorkspaceMember = async ({ tenantId, workspaceId, userId }: { tenantId: string; workspaceId: string; userId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members/${userId}`);
};

export const useAvailableWorkspaceMembers = (tenantId: string, workspaceId: string) => useQuery({ queryKey: ["workspaceMembers", "available", tenantId, workspaceId], queryFn: () => fetchAvailableWorkspaceMembers({ tenantId, workspaceId }) });
export const useWorkspaceMembers = (tenantId: string, workspaceId: string) => useQuery({ queryKey: ["workspaceMembers", tenantId, workspaceId], queryFn: () => fetchWorkspaceMembers({ tenantId, workspaceId }) });
export const useAddWorkspaceMember = () => useMutation({ mutationFn: addWorkspaceMember });
export const useRemoveWorkspaceMember = () => useMutation({ mutationFn: removeWorkspaceMember });
