import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CreateWorkspaceDto, UpdateWorkspaceDto, Workspace } from "@/types/api";

export const fetchWorkspaces = async (tenantId: string): Promise<Workspace[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces`);
  return data;
};

export const createWorkspace = async ({ tenantId, dto }: { tenantId: string; dto: CreateWorkspaceDto }): Promise<Workspace> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/workspaces`, dto);
  return data;
};

export const updateWorkspace = async ({ tenantId, workspaceId, dto }: { tenantId: string; workspaceId: string; dto: UpdateWorkspaceDto }): Promise<Workspace> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}`, dto);
  return data;
};

export const deleteWorkspace = async ({ tenantId, workspaceId }: { tenantId: string; workspaceId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}`);
};

export const useWorkspaces = (tenantId: string) => useQuery({ queryKey: ["workspaces", tenantId], queryFn: () => fetchWorkspaces(tenantId) });
export const useCreateWorkspace = () => useMutation({ mutationFn: createWorkspace });
export const useUpdateWorkspace = () => useMutation({ mutationFn: updateWorkspace });
export const useDeleteWorkspace = () => useMutation({ mutationFn: deleteWorkspace });
