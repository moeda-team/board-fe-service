import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  Board,
  BoardEnvelope,
  BoardsEnvelope,
  CreateBoardParams,
  DeleteBoardParams,
  UpdateBoardParams
} from "@/types/type-boards";

export const boardsQueryKey = (tenantId: string, workspaceId: string) =>
  ["boards", tenantId, workspaceId] as const;

export const useBoards = (tenantId: string, workspaceId: string) => useQuery({
  queryKey: boardsQueryKey(tenantId, workspaceId),
  queryFn: async () => {
    const { data } = await apiClient.get<BoardsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId
});

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Board created", errorMessage: "Failed to create board" },
    mutationFn: async ({ tenantId, workspaceId, dto }: CreateBoardParams): Promise<Board> => {
      const { data } = await apiClient.post<BoardEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: boardsQueryKey(variables.tenantId, variables.workspaceId) });
    }
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Board updated", errorMessage: "Failed to update board" },
    mutationFn: async ({ tenantId, workspaceId, boardId, dto }: UpdateBoardParams): Promise<Board> => {
      const { data } = await apiClient.patch<BoardEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: boardsQueryKey(variables.tenantId, variables.workspaceId) });
    }
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Board deleted", errorMessage: "Failed to delete board" },
    mutationFn: async ({ tenantId, workspaceId, boardId }: DeleteBoardParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: boardsQueryKey(variables.tenantId, variables.workspaceId) });
    }
  });
};
