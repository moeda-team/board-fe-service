import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  TaskComment,
  TaskCommentsEnvelope,
  TaskCommentEnvelope,
  CreateTaskCommentParams,
  UpdateTaskCommentParams,
  DeleteTaskCommentParams
} from "@/types/type-tasks";

export const taskCommentsQueryKey = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  ["taskComments", tenantId, workspaceId, boardId, taskId] as const;

export const useTaskComments = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  useQuery<TaskComment[]>({
    queryKey: taskCommentsQueryKey(tenantId, workspaceId, boardId, taskId),
    queryFn: async () => {
      const { data } = await apiClient.get<TaskCommentsEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments`
      );
      return unwrapApiArrayData(data);
    },
    enabled: !!tenantId && !!workspaceId && !!boardId && !!taskId,
  });

export const useCreateTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Comment posted", errorMessage: "Failed to post comment" },
    mutationFn: async ({
      tenantId,
      workspaceId,
      boardId,
      taskId,
      dto,
    }: CreateTaskCommentParams): Promise<TaskComment> => {
      const formData = new FormData();
      formData.append("content", dto.content);
      if (dto.parentId) {
        formData.append("parentId", dto.parentId);
      }
      if (dto.files && dto.files.length > 0) {
        dto.files.forEach((file) => formData.append("files", file));
      }

      const { data } = await apiClient.post<TaskCommentEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return unwrapApiData(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
    },
  });
};

export const useUpdateTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Comment updated", errorMessage: "Failed to update comment" },
    mutationFn: async ({
      tenantId,
      workspaceId,
      boardId,
      taskId,
      commentId,
      dto,
    }: UpdateTaskCommentParams): Promise<TaskComment> => {
      const { data } = await apiClient.patch<TaskCommentEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments/${commentId}`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
    },
  });
};

export const useDeleteTaskComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Comment removed", errorMessage: "Failed to remove comment" },
    mutationFn: async ({
      tenantId,
      workspaceId,
      boardId,
      taskId,
      commentId,
    }: DeleteTaskCommentParams): Promise<void> => {
      await apiClient.delete(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/comments/${commentId}`
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
    },
  });
};
