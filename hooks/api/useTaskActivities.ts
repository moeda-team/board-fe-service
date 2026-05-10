import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import { TaskActivity, TaskActivitiesEnvelope } from "@/types/type-tasks";

export const taskActivitiesQueryKey = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  ["taskActivities", tenantId, workspaceId, boardId, taskId] as const;

export const useTaskActivities = (tenantId: string, workspaceId: string, boardId: string, taskId: string) => useQuery<TaskActivity[]>({
  queryKey: taskActivitiesQueryKey(tenantId, workspaceId, boardId, taskId),
  queryFn: async () => {
    const { data } = await apiClient.get<TaskActivitiesEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/activities`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId && !!taskId
});
