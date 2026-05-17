import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const workspacesQueryKey = (tenantId: string) =>
  ["workspaces", tenantId] as const;

export const useWorkspaces = (tenantId: string) => useQuery<Workspace[]>({
  queryKey: workspacesQueryKey(tenantId),
  queryFn: async () => {
    const { data } = await apiClient.get<WorkspacesEnvelope>(`/api/tenants/${tenantId}/workspaces`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && tenantId !== "undefined" && tenantId !== "null"
});

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Workspace created", errorMessage: "Failed to create workspace" },
    mutationFn: async ({ tenantId, dto }: CreateWorkspaceParams): Promise<Workspace> => {
      const formData = new FormData();
      formData.append("name", dto.name);
      if (dto.description) formData.append("description", dto.description);
      if (dto.color) formData.append("color", dto.color);
      if (dto.image) formData.append("image", dto.image);
      const { data } = await apiClient.post<WorkspaceEnvelope>(`/api/tenants/${tenantId}/workspaces`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workspacesQueryKey(variables.tenantId) });
    }
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Workspace updated", errorMessage: "Failed to update workspace" },
    mutationFn: async ({ tenantId, workspaceId, dto }: UpdateWorkspaceParams): Promise<Workspace> => {
      const formData = new FormData();
      if (dto.name) formData.append("name", dto.name);
      if (dto.description) formData.append("description", dto.description);
      if (dto.color) formData.append("color", dto.color);
      if (dto.image) formData.append("image", dto.image);
      const { data } = await apiClient.patch<WorkspaceEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workspacesQueryKey(variables.tenantId) });
    }
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Workspace deleted", errorMessage: "Failed to delete workspace" },
    mutationFn: async ({ tenantId, workspaceId }: DeleteWorkspaceParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: workspacesQueryKey(variables.tenantId) });
    }
  });
};
