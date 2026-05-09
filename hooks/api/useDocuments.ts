import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CreateDocumentParams,
  DeleteDocumentParams,
  Document,
  DocumentEnvelope,
  DocumentsEnvelope,
  UpdateDocumentParams
} from "@/types/type-documents";

export const documentsQueryKey = (tenantId: string, workspaceId: string, folderId: string) =>
  ["documents", tenantId, workspaceId, folderId] as const;

export const useDocuments = (tenantId: string, workspaceId: string, folderId: string) => useQuery<Document[]>({
  queryKey: documentsQueryKey(tenantId, workspaceId, folderId),
  queryFn: async () => {
    const { data } = await apiClient.get<DocumentsEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}/documents`);
    return unwrapApiArrayData(data);
  },
  enabled: !!tenantId && !!workspaceId && !!folderId
});

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Document created", errorMessage: "Failed to create document" },
    mutationFn: async ({ tenantId, workspaceId, folderId, dto }: CreateDocumentParams): Promise<Document> => {
      const { data } = await apiClient.post<DocumentEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}/documents`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey(variables.tenantId, variables.workspaceId, variables.folderId) });
    }
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Document updated", errorMessage: "Failed to update document" },
    mutationFn: async ({ tenantId, workspaceId, folderId, documentId, dto }: UpdateDocumentParams): Promise<Document> => {
      const { data } = await apiClient.patch<DocumentEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}/documents/${documentId}`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey(variables.tenantId, variables.workspaceId, variables.folderId) });
    }
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Document deleted", errorMessage: "Failed to delete document" },
    mutationFn: async ({ tenantId, workspaceId, folderId, documentId }: DeleteDocumentParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folderId}/documents/${documentId}`);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey(variables.tenantId, variables.workspaceId, variables.folderId) });
    }
  });
};
