import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CreateTaskParams,
  DeleteTaskParams,
  MoveTaskParams,
  Task,
  TaskEnvelope,
  TasksEnvelope,
  UpdateTaskParams
} from "@/types/type-tasks";

export const tasksQueryKey = (tenantId: string, workspaceId: string, boardId: string) =>
  ["tasks", tenantId, workspaceId, boardId] as const;

export const useTasks = (tenantId: string, workspaceId: string, boardId: string) => useQuery<Task[]>({
  queryKey: tasksQueryKey(tenantId, workspaceId, boardId),
  queryFn: async () => {
    const { data } = await apiClient.get<TasksEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId
});

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Task created", errorMessage: "Failed to create task" },
    mutationFn: async ({ tenantId, workspaceId, boardId, dto }: CreateTaskParams): Promise<Task> => {
      const { data } = await apiClient.post<TaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Task updated", errorMessage: "Failed to update task" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, dto }: UpdateTaskParams): Promise<Task> => {
      const { data } = await apiClient.patch<TaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Task deleted", errorMessage: "Failed to delete task" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId }: DeleteTaskParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useMoveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Task moved", errorMessage: "Failed to move task" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, dto }: MoveTaskParams): Promise<void> => {
      await apiClient.patch(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/move`, dto);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const taskDetailQueryKey = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  ["taskDetail", tenantId, workspaceId, boardId, taskId] as const;

export const useTaskDetail = (tenantId: string, workspaceId: string, boardId: string, taskId: string) => useQuery<Task>({
  queryKey: taskDetailQueryKey(tenantId, workspaceId, boardId, taskId),
  queryFn: async () => {
    const { data } = await apiClient.get<TaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}`);
    return unwrapApiData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId && !!taskId
});
