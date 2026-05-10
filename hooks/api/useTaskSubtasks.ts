import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import { Subtask, SubtasksEnvelope, SubtaskEnvelope } from "@/types/type-tasks";

export const taskSubtasksQueryKey = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  ["taskSubtasks", tenantId, workspaceId, boardId, taskId] as const;

export const useTaskSubtasks = (tenantId: string, workspaceId: string, boardId: string, taskId: string) => useQuery<Subtask[]>({
  queryKey: taskSubtasksQueryKey(tenantId, workspaceId, boardId, taskId),
  queryFn: async () => {
    const { data } = await apiClient.get<SubtasksEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId && !!taskId
});

export const useCreateSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Subtask added" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, dto }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, dto: { title: string } }) => {
      const { data } = await apiClient.post<SubtaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks`, dto);
      return unwrapApiData(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};

export const useUpdateSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Subtask updated" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, subtaskId, dto }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, subtaskId: string, dto: { title?: string, isDone?: boolean } }) => {
      const { data } = await apiClient.patch<SubtaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks/${subtaskId}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};

export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Subtask deleted" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, subtaskId }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, subtaskId: string }) => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks/${subtaskId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};

export const useReorderSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Subtasks reordered" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, subtaskId, newPosition }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, subtaskId: string, newPosition: number }) => {
      const { data } = await apiClient.patch<SubtaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks/${subtaskId}/reorder`, { newPosition });
      return unwrapApiData(data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};
