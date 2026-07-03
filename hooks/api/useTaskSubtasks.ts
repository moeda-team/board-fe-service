import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import { Subtask, SubtasksEnvelope, SubtaskEnvelope } from "@/types/type-tasks";
import { tasksQueryKey } from "./useTasks";

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
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, dto }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, dto: { title: string, parentId?: string | null } }) => {
      const { data } = await apiClient.post<SubtaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks`, dto);
      return unwrapApiData(data);
    },
    onMutate: async (variables) => {
      const key = taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Subtask[]>(key);
      if (previous) {
        const tempId = `temp-${Date.now()}`;
        const newSubtask: Subtask = {
          id: tempId,
          taskId: variables.taskId,
          title: variables.dto.title,
          isDone: false,
          position: previous.length,
          parentId: variables.dto.parentId ?? null,
        };
        queryClient.setQueryData<Subtask[]>(key, (old) => {
          if (!old) return old;
          if (variables.dto.parentId) {
            return old.map((st) =>
              st.id === variables.dto.parentId
                ? { ...st, children: [...(st.children || []), newSubtask] }
                : st
            );
          }
          return [...old, newSubtask];
        });
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId),
          context.previous
        );
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
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
    onMutate: async (variables) => {
      const key = taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Subtask[]>(key);
      if (previous) {
        queryClient.setQueryData<Subtask[]>(key, (old) => {
          if (!old) return old;
          const updateSubtaskRecursive = (subs: Subtask[]): Subtask[] =>
            subs.map((st) => {
              if (st.id === variables.subtaskId) {
                return { ...st, ...variables.dto };
              }
              if (st.children) {
                return { ...st, children: updateSubtaskRecursive(st.children) };
              }
              return st;
            });
          return updateSubtaskRecursive(old);
        });
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId),
          context.previous
        );
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
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
    onMutate: async (variables) => {
      const key = taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Subtask[]>(key);
      if (previous) {
        queryClient.setQueryData<Subtask[]>(key, (old) => {
          if (!old) return old;
          const removeRecursive = (subs: Subtask[]): Subtask[] =>
            subs
              .filter((st) => st.id !== variables.subtaskId)
              .map((st) =>
                st.children
                  ? { ...st, children: removeRecursive(st.children) }
                  : st
              );
          return removeRecursive(old);
        });
      }
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId),
          context.previous
        );
      }
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};

export const useReorderSubtask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Subtasks reordered" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, subtaskId, newPosition, newParentId }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, subtaskId: string, newPosition: number, newParentId?: string | null }) => {
      const { data } = await apiClient.patch<SubtaskEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/subtasks/${subtaskId}/reorder`, { newPosition, newParentId });
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: taskSubtasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
      await queryClient.invalidateQueries({ queryKey: tasksQueryKey(variables.tenantId, variables.workspaceId, variables.boardId) });
    }
  });
};
