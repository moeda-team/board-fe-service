import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const columnsQueryKey = (tenantId: string, workspaceId: string, boardId: string) =>
  ["columns", tenantId, workspaceId, boardId] as const;

export const useKanbanColumns = (tenantId: string, workspaceId: string, boardId: string) => useQuery<Column[]>({
  queryKey: columnsQueryKey(tenantId, workspaceId, boardId),
  queryFn: async () => {
    const { data } = await apiClient.get<ColumnsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId
});

export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Column created", errorMessage: "Failed to create column" },
    mutationFn: async ({ tenantId, workspaceId, boardId, dto }: CreateColumnParams): Promise<Column> => {
      const { data } = await apiClient.post<ColumnEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: columnsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useReorderColumns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Columns reordered", errorMessage: "Failed to reorder columns" },
    mutationFn: async ({ tenantId, workspaceId, boardId, dto }: ReorderColumnsParams): Promise<void> => {
      await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/reorder`, dto);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: columnsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useUpdateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Column updated", errorMessage: "Failed to update column" },
    mutationFn: async ({ tenantId, workspaceId, boardId, columnId, dto }: UpdateColumnParams): Promise<Column> => {
      const { data } = await apiClient.patch<ColumnEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: columnsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Column deleted", errorMessage: "Failed to delete column" },
    mutationFn: async ({ tenantId, workspaceId, boardId, columnId }: DeleteColumnParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/columns/${columnId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: columnsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};
