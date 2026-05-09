import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData, unwrapApiData } from "@/types/api";
import {
  AddWorkspaceMemberParams,
  Member,
  RemoveWorkspaceMemberParams,
  WorkspaceMembersEnvelope,
  WorkspaceMemberEnvelope
} from "@/types/type-workspace-members";

export const useAvailableWorkspaceMembers = (tenantId: string, workspaceId: string) => useQuery({
  queryKey: ["workspaceMembers", "available", tenantId, workspaceId],
  queryFn: async () => {
    const { data } = await apiClient.get<WorkspaceMembersEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members/available`);
    return unwrapApiArrayData(data);
  }
});

export const useWorkspaceMembers = (tenantId: string, workspaceId: string) => useQuery({
  queryKey: ["workspaceMembers", tenantId, workspaceId],
  queryFn: async () => {
    const { data } = await apiClient.get<WorkspaceMembersEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members`);
    return unwrapApiArrayData(data);
  }
});

export const useAddWorkspaceMember = () => useMutation({
  meta: { successMessage: "Member added", errorMessage: "Failed to add member" },
  mutationFn: async ({ tenantId, workspaceId, dto }: AddWorkspaceMemberParams): Promise<Member> => {
    const { data } = await apiClient.post<WorkspaceMemberEnvelope>(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members`, dto);
    return unwrapApiData(data);
  }
});

export const useRemoveWorkspaceMember = () => useMutation({
  meta: { successMessage: "Member removed", errorMessage: "Failed to remove member" },
  mutationFn: async ({ tenantId, workspaceId, userId }: RemoveWorkspaceMemberParams): Promise<void> => {
    await apiClient.delete(`/api/tenants/${tenantId}/workspaces/${workspaceId}/members/${userId}`);
  }
});
