import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  Column,
  ColumnEnvelope,
  ColumnsEnvelope,
  CreateColumnParams,
  DeleteColumnParams,
  ReorderColumnsParams,
  UpdateColumnParams
} from "@/types/type-kanban-columns";

export const useKanbanColumns = (tenantId: string, workspaceId: string, boardId: string) => useQuery<Column[]>({
  queryKey: ["columns", tenantId, workspaceId, boardId],
  queryFn: async () => {
    const { data } = await apiClient.get<ColumnsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId
});

export const useCreateColumn = () => useMutation({
  meta: { successMessage: "Column created", errorMessage: "Failed to create column" },
  mutationFn: async ({ tenantId, workspaceId, boardId, dto }: CreateColumnParams): Promise<Column> => {
    const { data } = await apiClient.post<ColumnEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`, dto);
    return unwrapApiData(data);
  }
});

export const useReorderColumns = () => useMutation({
  meta: { successMessage: "Columns reordered", errorMessage: "Failed to reorder columns" },
  mutationFn: async ({ tenantId, workspaceId, boardId, dto }: ReorderColumnsParams): Promise<void> => {
    await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/reorder`, dto);
  }
});

export const useUpdateColumn = () => useMutation({
  meta: { successMessage: "Column updated", errorMessage: "Failed to update column" },
  mutationFn: async ({ tenantId, workspaceId, boardId, columnId, dto }: UpdateColumnParams): Promise<Column> => {
    const { data } = await apiClient.patch<ColumnEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, dto);
    return unwrapApiData(data);
  }
});

export const useDeleteColumn = () => useMutation({
  meta: { successMessage: "Column deleted", errorMessage: "Failed to delete column" },
  mutationFn: async ({ tenantId, workspaceId, boardId, columnId }: DeleteColumnParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`);
  }
});
