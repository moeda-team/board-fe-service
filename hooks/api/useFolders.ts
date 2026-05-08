import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CreateFolderParams,
  DeleteFolderParams,
  Folder,
  FolderEnvelope,
  FoldersEnvelope,
  UpdateFolderParams
} from "@/types/type-folders";

export const useFolders = (tenantId: string, workspaceId: string) => useQuery({
  queryKey: ["folders", tenantId, workspaceId],
  queryFn: async () => {
    const { data } = await apiClient.get<FoldersEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders`);
    return unwrapApiArrayData(data);
  }
});

export const useCreateFolder = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, dto }: CreateFolderParams): Promise<Folder> => {
    const { data } = await apiClient.post<FolderEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders`, dto);
    return unwrapApiData(data);
  }
});

export const useUpdateFolder = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, folderId, dto }: UpdateFolderParams): Promise<Folder> => {
    const { data } = await apiClient.patch<FolderEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}`, dto);
    return unwrapApiData(data);
  }
});

export const useDeleteFolder = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, folderId }: DeleteFolderParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}`);
  }
});
