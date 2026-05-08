import { useQuery, useMutation } from "@tanstack/react-query";
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

export const useBoards = (tenantId: string, workspaceId: string) => useQuery({
  queryKey: ["boards", tenantId, workspaceId],
  queryFn: async () => {
    const { data } = await apiClient.get<BoardsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`);
    return unwrapApiArrayData(data);
  }
});

export const useCreateBoard = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, dto }: CreateBoardParams): Promise<Board> => {
    const { data } = await apiClient.post<BoardEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`, dto);
    return unwrapApiData(data);
  }
});

export const useUpdateBoard = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, boardId, dto }: UpdateBoardParams): Promise<Board> => {
    const { data } = await apiClient.patch<BoardEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`, dto);
    return unwrapApiData(data);
  }
});

export const useDeleteBoard = () => useMutation({
  mutationFn: async ({ tenantId, workspaceId, boardId }: DeleteBoardParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`);
  }
});
