import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CreateFolderDto, UpdateFolderDto, Folder } from "@/types/api";

export const fetchFolders = async ({ tenantId, workspaceId }: { tenantId: string; workspaceId: string }): Promise<Folder[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders`);
  return data;
};

export const createFolder = async ({ tenantId, workspaceId, dto }: { tenantId: string; workspaceId: string; dto: CreateFolderDto }): Promise<Folder> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders`, dto);
  return data;
};

export const updateFolder = async ({ tenantId, workspaceId, folderId, dto }: { tenantId: string; workspaceId: string; folderId: string; dto: UpdateFolderDto }): Promise<Folder> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}`, dto);
  return data;
};

export const deleteFolder = async ({ tenantId, workspaceId, folderId }: { tenantId: string; workspaceId: string; folderId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}`);
};

export const useFolders = (tenantId: string, workspaceId: string) => useQuery({ queryKey: ["folders", tenantId, workspaceId], queryFn: () => fetchFolders({ tenantId, workspaceId }) });
export const useCreateFolder = () => useMutation({ mutationFn: createFolder });
export const useUpdateFolder = () => useMutation({ mutationFn: updateFolder });
export const useDeleteFolder = () => useMutation({ mutationFn: deleteFolder });
