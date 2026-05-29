import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import type { Member, ApiEnvelope } from "@/types/api";

interface MentionItemRaw {
  userId: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl: string | null;
  };
}

export const useMentions = (
  tenantId: string,
  workspaceId: string,
  search: string | null
) => {
  return useQuery<Member[]>({
    queryKey: ["mentions", tenantId, workspaceId, search],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiEnvelope<MentionItemRaw[]>>(
        `/api/tenants/${tenantId}/workspaces/${workspaceId}/members/mentions`,
        { params: { search: search ?? "" } }
      );
      const raw = unwrapApiArrayData(data);
      return raw.map((item) => ({
        id: item.user.id,
        userId: item.userId,
        fullName: item.user.fullName,
        username: item.user.username,
        avatarUrl: item.user.avatarUrl,
      }));
    },
    enabled: !!tenantId && !!workspaceId && search !== null && search !== undefined,
  });
};
