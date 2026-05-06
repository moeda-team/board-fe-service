import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { CreateBoardDto, UpdateBoardDto, Board } from "@/types/api";

export const fetchBoards = async ({ tenantId, workspaceId }: { tenantId: string; workspaceId: string }): Promise<Board[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`);
  return data;
};

export const createBoard = async ({ tenantId, workspaceId, dto }: { tenantId: string; workspaceId: string; dto: CreateBoardDto }): Promise<Board> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards`, dto);
  return data;
};

export const updateBoard = async ({ tenantId, workspaceId, boardId, dto }: { tenantId: string; workspaceId: string; boardId: string; dto: UpdateBoardDto }): Promise<Board> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`, dto);
  return data;
};

export const deleteBoard = async ({ tenantId, workspaceId, boardId }: { tenantId: string; workspaceId: string; boardId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}`);
};

export const useBoards = (tenantId: string, workspaceId: string) => useQuery({ queryKey: ["boards", tenantId, workspaceId], queryFn: () => fetchBoards({ tenantId, workspaceId }) });
export const useCreateBoard = () => useMutation({ mutationFn: createBoard });
export const useUpdateBoard = () => useMutation({ mutationFn: updateBoard });
export const useDeleteBoard = () => useMutation({ mutationFn: deleteBoard });
