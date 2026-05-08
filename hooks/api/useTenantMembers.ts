import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  CancelTenantInviteParams,
  InviteMemberParams,
  Member,
  TenantMemberEnvelope,
  TenantMembersEnvelope,
  UpdateMemberRoleParams,
  RemoveTenantMemberParams
} from "@/types/type-tenant-members";

export const useTenantMembers = (tenantId: string) => useQuery({
  queryKey: ["tenantMembers", tenantId],
  queryFn: async () => {
    const { data } = await apiClient.get<TenantMembersEnvelope>(`/api/tenants/${tenantId}/members`);
    return unwrapApiArrayData(data);
  }
});

export const useInviteMember = () => useMutation({
  mutationFn: async ({ tenantId, dto }: InviteMemberParams): Promise<Member> => {
    const { data } = await apiClient.post<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members`, dto);
    return unwrapApiData(data);
  }
});

export const useUpdateMemberRole = () => useMutation({
  mutationFn: async ({ tenantId, userId, dto }: UpdateMemberRoleParams): Promise<Member> => {
    const { data } = await apiClient.patch<TenantMemberEnvelope>(`/api/tenants/${tenantId}/members/${userId}/role`, dto);
    return unwrapApiData(data);
  }
});

export const useRemoveTenantMember = () => useMutation({
  mutationFn: async ({ tenantId, userId }: RemoveTenantMemberParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/members/${userId}`);
  }
});

export const useCancelTenantInvite = () => useMutation({
  mutationFn: async ({ tenantId, inviteId }: CancelTenantInviteParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/members/invites/${inviteId}`);
  }
});
