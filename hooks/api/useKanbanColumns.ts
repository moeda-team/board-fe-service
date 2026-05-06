import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto, Column } from "@/types/api";

export const fetchColumns = async ({ tenantId, workspaceId, boardId }: { tenantId: string; workspaceId: string; boardId: string }): Promise<Column[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`);
  return data;
};

export const createColumn = async ({ tenantId, workspaceId, boardId, dto }: { tenantId: string; workspaceId: string; boardId: string; dto: CreateColumnDto }): Promise<Column> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`, dto);
  return data;
};

export const reorderColumns = async ({ tenantId, workspaceId, boardId, dto }: { tenantId: string; workspaceId: string; boardId: string; dto: ReorderColumnsDto }): Promise<void> => {
  await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/reorder`, dto);
};

export const updateColumn = async ({ tenantId, workspaceId, boardId, columnId, dto }: { tenantId: string; workspaceId: string; boardId: string; columnId: string; dto: UpdateColumnDto }): Promise<Column> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, dto);
  return data;
};

export const deleteColumn = async ({ tenantId, workspaceId, boardId, columnId }: { tenantId: string; workspaceId: string; boardId: string; columnId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`);
};

export const useKanbanColumns = (tenantId: string, workspaceId: string, boardId: string) => useQuery({ queryKey: ["columns", tenantId, workspaceId, boardId], queryFn: () => fetchColumns({ tenantId, workspaceId, boardId }) });
export const useCreateColumn = () => useMutation({ mutationFn: createColumn });
export const useReorderColumns = () => useMutation({ mutationFn: reorderColumns });
export const useUpdateColumn = () => useMutation({ mutationFn: updateColumn });
export const useDeleteColumn = () => useMutation({ mutationFn: deleteColumn });
