import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { gooeyToast } from "goey-toast";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import type {
  CreateCustomFieldDto,
  CustomField,
  CustomFieldEnvelope,
  CustomFieldsEnvelope,
  UpdateCustomFieldDto
} from "@/types/type-custom-fields";

export interface CustomFieldsBaseParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
}

export interface CreateCustomFieldParams extends CustomFieldsBaseParams {
  dto: CreateCustomFieldDto;
}

export interface UpdateCustomFieldParams extends CustomFieldsBaseParams {
  customFieldId: string;
  dto: UpdateCustomFieldDto;
}

export interface DeleteCustomFieldParams extends CustomFieldsBaseParams {
  customFieldId: string;
}

export const customFieldsQueryKey = (
  tenantId: string,
  workspaceId: string,
  boardId: string
) => ["customFields", tenantId, workspaceId, boardId] as const;

function extractApiErrorMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const status = error.response?.status;
  const data = error.response?.data as
    | { message?: unknown; error?: unknown; errors?: unknown }
    | undefined;

  if (status === 400) {
    const message = data?.message;
    if (typeof message === "string" && message.trim()) return message;

    const errorStr = data?.error;
    if (typeof errorStr === "string" && errorStr.trim()) return errorStr;

    if (Array.isArray(data?.errors) && data?.errors.length > 0) {
      const first: unknown = (data.errors as unknown[])[0];
      if (typeof first === "object" && first !== null && "message" in first) {
        const msg = (first as { message?: unknown }).message;
        if (typeof msg === "string" && msg.trim()) {
          return msg;
        }
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  return null;
}

export const useCustomFields = (tenantId: string, workspaceId: string, boardId: string) =>
  useQuery({
    queryKey: customFieldsQueryKey(tenantId, workspaceId, boardId),
    queryFn: async (): Promise<CustomField[]> => {
      const { data } = await apiClient.get<CustomFieldsEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/custom-fields`
      );
      return unwrapApiArrayData(data);
    },
    enabled: !!tenantId && !!workspaceId && !!boardId
  });

export const useCreateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Custom field created" },
    mutationFn: async ({ tenantId, workspaceId, boardId, dto }: CreateCustomFieldParams): Promise<CustomField> => {
      const { data } = await apiClient.post<CustomFieldEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/custom-fields`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: customFieldsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId)
      });
    },
    onError: (error) => {
      const msg = extractApiErrorMessage(error);
      gooeyToast.error(msg || "Failed to create custom field");
    }
  });
};

export const useUpdateCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Custom field updated" },
    mutationFn: async ({ tenantId, workspaceId, boardId, customFieldId, dto }: UpdateCustomFieldParams): Promise<CustomField> => {
      const { data } = await apiClient.patch<CustomFieldEnvelope>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/custom-fields/${customFieldId}`,
        dto
      );
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: customFieldsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId)
      });
    },
    onError: (error) => {
      const msg = extractApiErrorMessage(error);
      gooeyToast.error(msg || "Failed to update custom field");
    }
  });
};

export const useDeleteCustomField = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Custom field deleted" },
    mutationFn: async ({ tenantId, workspaceId, boardId, customFieldId }: DeleteCustomFieldParams): Promise<void> => {
      await apiClient.delete(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/boards/${boardId}/custom-fields/${customFieldId}`
      );
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: customFieldsQueryKey(variables.tenantId, variables.workspaceId, variables.boardId)
      });
    },
    onError: (error) => {
      const msg = extractApiErrorMessage(error);
      gooeyToast.error(msg || "Failed to delete custom field");
    }
  });
};
