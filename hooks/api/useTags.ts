import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, type ApiEnvelope, type Tag } from "@/types/api";

export type TagsEnvelope = ApiEnvelope<Tag[]>;

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
