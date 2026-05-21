import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiData } from "@/types/api";
import type {
  CancelTenantInviteParams,
  InviteMemberParams,
  TenantMemberMutationResult,
  TenantMemberEnvelope,
  TenantMembersEnvelope,
  TenantMembersData,
  UpdateMemberRoleParams,
  RemoveTenantMemberParams
} from "@/types/type-tenant-members";

export const tenantMembersQueryKey = (tenantId: string, page?: number, limit?: number, search?: string) =>
  ["tenantMembers", tenantId, page, limit, search] as const;

export const archivedTenantMembersQueryKey = (tenantId: string, page?: number, limit?: number, search?: string) =>
  ["archivedTenantMembers", tenantId, page, limit, search] as const;

const refetchAllMembers = async (
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string
) => {
  await queryClient.refetchQueries({
    queryKey: ["tenantMembers", tenantId],
    type: "all"
  });
  await queryClient.refetchQueries({
    queryKey: ["archivedTenantMembers", tenantId],
    type: "all"
  });
  await queryClient.invalidateQueries({
    queryKey: ["roles", tenantId]
  });
};

const refetchActiveMembers = async (
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string
) => {
  await queryClient.refetchQueries({
    queryKey: ["tenantMembers", tenantId],
    type: "all"
  });
};

const refetchArchivedMembers = async (
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string
) => {
  await queryClient.refetchQueries({
    queryKey: ["archivedTenantMembers", tenantId],
    type: "all"
  });
};

export const useTenantMembers = (tenantId: string, page: number = 1, limit: number = 15, search?: string) => useQuery({
  queryKey: tenantMembersQueryKey(tenantId, page, limit, search),
  queryFn: async (): Promise<TenantMembersData> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (search) params.append("search", search);

    const { data } = await apiClient.get<TenantMembersEnvelope>(`/api/tenants/${tenantId}/members?${params.toString()}`);
    const members = unwrapApiData(data);

    return {
      activeMembers: Array.isArray(members.activeMembers)
        ? members.activeMembers
        : [],
      pendingInvites: Array.isArray(members.pendingInvites)
        ? members.pendingInvites
        : [],
      archivedMembers: Array.isArray(members.archivedMembers)
        ? members.archivedMembers
        : [],
      meta: members.meta
    };
  },
  enabled: !!tenantId && tenantId !== "undefined" && tenantId !== "null"
});

export const useArchivedTenantMembers = (tenantId: string, page: number = 1, limit: number = 15, search?: string) => useQuery({
  queryKey: archivedTenantMembersQueryKey(tenantId, page, limit, search),
  queryFn: async (): Promise<TenantMembersData> => {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (search) params.append("search", search);

    const { data } = await apiClient.get<TenantMembersEnvelope>(`/api/tenants/${tenantId}/members/archived?${params.toString()}`);
    const members = unwrapApiData(data);

    // Archived endpoint returns { items, meta } instead of { activeMembers, pendingInvites, archivedMembers }
    const archivedMembers = Array.isArray(members.items)
      ? members.items
      : Array.isArray(members.archivedMembers)
        ? members.archivedMembers
        : [];

    return {
      activeMembers: [],
      pendingInvites: [],
      archivedMembers,
      meta: members.meta
    };
  },
  enabled: !!tenantId && tenantId !== "undefined" && tenantId !== "null"
});

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member invited", errorMessage: "Failed to invite member" },
    mutationFn: async ({ tenantId, dto }: InviteMemberParams): Promise<TenantMemberMutationResult> => {
      const { data } = await apiClient.post<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member role updated", errorMessage: "Failed to update member role" },
    mutationFn: async ({ tenantId, targetId, dto }: UpdateMemberRoleParams): Promise<TenantMemberMutationResult> => {
      const { data } = await apiClient.patch<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members/${targetId}/role`, dto);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};

export const useRemoveTenantMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member removed", errorMessage: "Failed to remove member" },
    mutationFn: async ({ tenantId, userId }: RemoveTenantMemberParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/members/${userId}`);
    },
    onSuccess: async (_data, variables) => {
      // Only invalidate archived members when removing from archived tab
      await refetchArchivedMembers(queryClient, variables.tenantId);
    }
  });
};

export const useCancelTenantInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Invite cancelled", errorMessage: "Failed to cancel invite" },
    mutationFn: async ({ tenantId, inviteId }: CancelTenantInviteParams): Promise<void> => {
      await apiClient.delete(`/api/tenants/${tenantId}/members/invites/${inviteId}`);
    },
    onSuccess: async (_data, variables) => {
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};

export interface UpdateMemberWorkspacesParams {
  tenantId: string;
  userId: string;
  workspaceIds: string[];
}

export const useUpdateMemberWorkspaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member workspaces updated", errorMessage: "Failed to update member workspaces" },
    mutationFn: async ({ tenantId, userId, workspaceIds }: UpdateMemberWorkspacesParams): Promise<TenantMemberMutationResult> => {
      const { data } = await apiClient.patch<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members/${userId}/workspaces`, { workspaceIds });
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};

export interface ArchiveTenantMemberParams {
  tenantId: string;
  userId: string;
}

export const useArchiveTenantMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member archived", errorMessage: "Failed to archive member" },
    mutationFn: async ({ tenantId, userId }: ArchiveTenantMemberParams): Promise<TenantMemberMutationResult> => {
      const { data } = await apiClient.patch<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members/${userId}/archive`);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate both lists since archiving moves from active to archived
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};

export interface RestoreTenantMemberParams {
  tenantId: string;
  userId: string;
}

export const useRestoreTenantMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { successMessage: "Member restored", errorMessage: "Failed to restore member" },
    mutationFn: async ({ tenantId, userId }: RestoreTenantMemberParams): Promise<TenantMemberMutationResult> => {
      const { data } = await apiClient.patch<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members/${userId}/restore`);
      return unwrapApiData(data);
    },
    onSuccess: async (_data, variables) => {
      // Invalidate both lists since restoring moves from archived to active
      await refetchAllMembers(queryClient, variables.tenantId);
    }
  });
};
