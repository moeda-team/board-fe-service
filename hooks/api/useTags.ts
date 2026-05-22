import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData, type ApiEnvelope, type Tag } from "@/types/api";

export type TagsEnvelope = ApiEnvelope<Tag[]>;
export type TagEnvelope = ApiEnvelope<Tag>;

export interface CreateTagDto {
    name: string;
    color: string;
}

export interface UpdateTagDto {
    name: string;
    color: string;
}

export interface CreateTagParams {
    tenantId: string;
    workspaceId: string;
    dto: CreateTagDto;
}

export interface UpdateTagParams {
    tenantId: string;
    workspaceId: string;
    tagId: string;
    dto: UpdateTagDto;
}

export interface DeleteTagParams {
    tenantId: string;
    workspaceId: string;
    tagId: string;
}

export const tagsQueryKey = (tenantId: string, workspaceId: string, search?: string) =>
    ["tags", tenantId, workspaceId, search] as const;

export const useTags = (tenantId: string, workspaceId: string, search?: string) =>
    useQuery({
        queryKey: tagsQueryKey(tenantId, workspaceId, search),
        queryFn: async (): Promise<Tag[]> => {
            const params = new URLSearchParams();
            if (search) params.append("search", search);

            const { data } = await apiClient.get<TagsEnvelope>(
                `/api/tenants/${tenantId}/workspaces/${workspaceId}/tags?${params.toString()}`
            );
            return unwrapApiArrayData(data);
        },
        enabled: !!tenantId && !!workspaceId && tenantId !== "undefined" && workspaceId !== "undefined"
    });

export const useCreateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        meta: { successMessage: "Tag created", errorMessage: "Failed to create tag" },
        mutationFn: async ({ tenantId, workspaceId, dto }: CreateTagParams): Promise<Tag> => {
            const { data } = await apiClient.post<TagEnvelope>(
                `/api/tenants/${tenantId}/workspaces/${workspaceId}/tags`,
                dto
            );
            return unwrapApiData(data);
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: tagsQueryKey(variables.tenantId, variables.workspaceId) });
        }
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        meta: { successMessage: "Tag updated", errorMessage: "Failed to update tag" },
        mutationFn: async ({ tenantId, workspaceId, tagId, dto }: UpdateTagParams): Promise<Tag> => {
            const { data } = await apiClient.patch<TagEnvelope>(
                `/api/tenants/${tenantId}/workspaces/${workspaceId}/tags/${tagId}`,
                dto
            );
            return unwrapApiData(data);
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: tagsQueryKey(variables.tenantId, variables.workspaceId) });
        }
    });
};

export const useDeleteTag = () => {
    const queryClient = useQueryClient();

    return useMutation({
        meta: { successMessage: "Tag deleted", errorMessage: "Failed to delete tag" },
        mutationFn: async ({ tenantId, workspaceId, tagId }: DeleteTagParams): Promise<void> => {
            await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/tags/${tagId}`);
        },
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: tagsQueryKey(variables.tenantId, variables.workspaceId) });
        }
    });
};
