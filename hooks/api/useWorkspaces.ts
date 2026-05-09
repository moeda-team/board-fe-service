import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CreateWorkspaceParams,
  DeleteWorkspaceParams,
  Workspace,
  WorkspaceEnvelope,
  WorkspacesEnvelope,
  UpdateWorkspaceParams
} from "@/types/type-workspaces";

export const useWorkspaces = (tenantId: string) => useQuery<Workspace[]>({
  queryKey: ["workspaces", tenantId],
  queryFn: async () => {
    const { data } = await apiClient.get<WorkspacesEnvelope>(`/api/tenants/${tenantId}/workspaces`);
    return unwrapApiArrayData(data);
  }
});

export const useCreateWorkspace = () => useMutation({
  meta: { successMessage: "Workspace created", errorMessage: "Failed to create workspace" },
  mutationFn: async ({ tenantId, dto }: CreateWorkspaceParams): Promise<Workspace> => {
    const { data } = await apiClient.post<WorkspaceEnvelope>(`/api/tenants/${tenantId}/workspaces`, dto);
    return unwrapApiData(data);
  }
});

export const useUpdateWorkspace = () => useMutation({
  meta: { successMessage: "Workspace updated", errorMessage: "Failed to update workspace" },
  mutationFn: async ({ tenantId, workspaceId, dto }: UpdateWorkspaceParams): Promise<Workspace> => {
    const { data } = await apiClient.patch<WorkspaceEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}`, dto);
    return unwrapApiData(data);
  }
});

export const useDeleteWorkspace = () => useMutation({
  meta: { successMessage: "Workspace deleted", errorMessage: "Failed to delete workspace" },
  mutationFn: async ({ tenantId, workspaceId }: DeleteWorkspaceParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}`);
  }
});
