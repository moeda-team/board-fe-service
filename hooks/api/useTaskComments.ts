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
import { taskActivitiesQueryKey } from "@/hooks/api/useTaskActivities";
import { tasksQueryKey } from "@/hooks/api/useTasks";

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
    onMutate: async (variables) => {
      const key = taskCommentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskComment[]>(key);
      if (previous) {
        const tempId = `temp-${Date.now()}`;
        const newComment: TaskComment = {
          id: tempId,
          content: variables.dto.content,
          parentId: variables.dto.parentId ?? null,
          taskId: variables.taskId,
          createdBy: "",
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<TaskComment[]>(key, (old) =>
          old ? [...old, newComment] : [newComment]
        );
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskCommentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId),
          context.previous
        );
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: taskActivitiesQueryKey(
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
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
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
    onMutate: async (variables) => {
      const key = taskCommentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TaskComment[]>(key);
      if (previous) {
        queryClient.setQueryData<TaskComment[]>(key, (old) =>
          old ? old.filter((c) => c.id !== variables.commentId) : old
        );
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskCommentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId),
          context.previous
        );
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: taskCommentsQueryKey(
          variables.tenantId,
          variables.workspaceId,
          variables.boardId,
          variables.taskId
        ),
      });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    },
  });
};
