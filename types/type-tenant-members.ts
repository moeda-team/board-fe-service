import type { ApiEnvelope } from "@/types/api";

export interface TenantMemberUser {
  id: string;
  googleId: string | null;
  email: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TenantMemberRole {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  totalMember?: number;
}

export interface ActiveTenantMember {
  tenantId: string;
  userId: string;
  roleId: string;
  invitedBy: string | null;
  joinedAt: string;
  archivedAt: string | null;
  user: TenantMemberUser;
  role: TenantMemberRole;
}

export interface PendingTenantInvite {
  id: string;
  tenantId: string;
  email: string;
  roleId: string;
  invitedBy: string | null;
  createdAt: string;
  role: TenantMemberRole;
  inviter: TenantMemberUser | null;
}

export interface TenantMembersData {
  activeMembers: ActiveTenantMember[];
  pendingInvites: PendingTenantInvite[];
  archivedMembers?: ActiveTenantMember[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface InviteMemberDto {
  email: string;
  roleId: string;
  workspaceIds: string[];
}

export interface UpdateMemberRoleDto {
  roleId: string;
}

export type TenantMemberMutationResult =
  | ActiveTenantMember
  | PendingTenantInvite;

export type TenantMemberTableRowKind = "member" | "invite";

export type TenantMemberStatus = "Active" | "Pending" | "Archived";

export interface TenantMemberTableRow {
  id: string;
  targetId: string;
  kind: TenantMemberTableRowKind;
  tenantId: string;
  userId?: string;
  inviteId?: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleId: string;
  roleName: string;
  space: string;
  status: TenantMemberStatus;
  joined: string;
}

export interface InviteMemberParams {
  tenantId: string;
  dto: InviteMemberDto;
}

export interface UpdateMemberRoleParams {
  tenantId: string;
  targetId: string;
  dto: UpdateMemberRoleDto;
}

export interface RemoveTenantMemberParams {
  tenantId: string;
  userId: string;
}

export interface CancelTenantInviteParams {
  tenantId: string;
  inviteId: string;
}

export type TenantMembersEnvelope = ApiEnvelope<TenantMembersData>;
export type TenantMemberEnvelope = ApiEnvelope<TenantMemberMutationResult>;
