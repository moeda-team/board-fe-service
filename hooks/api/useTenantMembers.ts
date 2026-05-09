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

export const tenantMembersQueryKey = (tenantId: string) =>
  ["tenantMembers", tenantId] as const;

const invalidateTenantMembers = async (
  queryClient: ReturnType<typeof useQueryClient>,
  tenantId: string
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: tenantMembersQueryKey(tenantId)
    }),
    queryClient.invalidateQueries({
      queryKey: ["roles", tenantId]
    })
  ]);
};

export const useTenantMembers = (tenantId: string) => useQuery({
  queryKey: tenantMembersQueryKey(tenantId),
  queryFn: async (): Promise<TenantMembersData> => {
    const { data } = await apiClient.get<TenantMembersEnvelope>(`/api/tenants/${tenantId}/members`);
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
        : []
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
      await invalidateTenantMembers(queryClient, variables.tenantId);
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
      await invalidateTenantMembers(queryClient, variables.tenantId);
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
      await invalidateTenantMembers(queryClient, variables.tenantId);
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
      await invalidateTenantMembers(queryClient, variables.tenantId);
    }
  });
};
