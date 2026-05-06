import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { InviteMemberDto, UpdateMemberRoleDto, Member } from "@/types/api";

export const fetchTenantMembers = async (tenantId: string): Promise<Member[]> => {
  const { data } = await apiClient.get(`/api/tenants/${tenantId}/members`);
  return data;
};

export const inviteMember = async ({ tenantId, dto }: { tenantId: string; dto: InviteMemberDto }): Promise<Member> => {
  const { data } = await apiClient.post(`/api/tenants/${tenantId}/members`, dto);
  return data;
};

export const updateMemberRole = async ({ tenantId, userId, dto }: { tenantId: string; userId: string; dto: UpdateMemberRoleDto }): Promise<Member> => {
  const { data } = await apiClient.patch(`/api/tenants/${tenantId}/members/${userId}/role`, dto);
  return data;
};

export const removeTenantMember = async ({ tenantId, userId }: { tenantId: string; userId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/members/${userId}`);
};

export const cancelTenantInvite = async ({ tenantId, inviteId }: { tenantId: string; inviteId: string }): Promise<void> => {
  await apiClient.delete(`/api/tenants/${tenantId}/members/invites/${inviteId}`);
};

export const useTenantMembers = (tenantId: string) => useQuery({ queryKey: ["tenantMembers", tenantId], queryFn: () => fetchTenantMembers(tenantId) });
export const useInviteMember = () => useMutation({ mutationFn: inviteMember });
export const useUpdateMemberRole = () => useMutation({ mutationFn: updateMemberRole });
export const useRemoveTenantMember = () => useMutation({ mutationFn: removeTenantMember });
export const useCancelTenantInvite = () => useMutation({ mutationFn: cancelTenantInvite });
