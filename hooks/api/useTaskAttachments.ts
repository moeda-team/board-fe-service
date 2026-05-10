import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import { Attachment, AttachmentsEnvelope } from "@/types/type-tasks";

export const taskAttachmentsQueryKey = (tenantId: string, workspaceId: string, boardId: string, taskId: string) =>
  ["taskAttachments", tenantId, workspaceId, boardId, taskId] as const;

export const useTaskAttachments = (tenantId: string, workspaceId: string, boardId: string, taskId: string) => useQuery<Attachment[]>({
  queryKey: taskAttachmentsQueryKey(tenantId, workspaceId, boardId, taskId),
  queryFn: async () => {
    const { data } = await apiClient.get<AttachmentsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/attachments`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!boardId && !!taskId
});

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Attachment uploaded" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, file }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post<any>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskAttachmentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successMessage: "Attachment deleted" },
    mutationFn: async ({ tenantId, workspaceId, boardId, taskId, attachmentId }: { tenantId: string, workspaceId: string, boardId: string, taskId: string, attachmentId: string }) => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/tasks/${taskId}/attachments/${attachmentId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskAttachmentsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId, variables.taskId) });
    }
  });
};
