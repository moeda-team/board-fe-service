import type {
  ApiEnvelope,
  InviteMemberDto as InviteMemberDtoModel,
  Member as MemberModel,
  UpdateMemberRoleDto as UpdateMemberRoleDtoModel
} from "@/types/api";

export type Member = MemberModel;
export type InviteMemberDto = InviteMemberDtoModel;
export type UpdateMemberRoleDto = UpdateMemberRoleDtoModel;

export interface InviteMemberParams {
  tenantId: string;
  dto: InviteMemberDto;
}

export interface UpdateMemberRoleParams {
  tenantId: string;
  userId: string;
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

export type TenantMembersEnvelope = ApiEnvelope<Member[] | Member>;
export type TenantMemberEnvelope = ApiEnvelope<Member>;
