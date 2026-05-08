import type {
  AddWorkspaceMemberDto as AddWorkspaceMemberDtoModel,
  ApiEnvelope,
  Member as MemberModel
} from "@/types/api";

export type Member = MemberModel;
export type AddWorkspaceMemberDto = AddWorkspaceMemberDtoModel;

export interface WorkspaceMembersParams {
  tenantId: string;
  workspaceId: string;
}

export interface AddWorkspaceMemberParams {
  tenantId: string;
  workspaceId: string;
  dto: AddWorkspaceMemberDto;
}

export interface RemoveWorkspaceMemberParams {
  tenantId: string;
  workspaceId: string;
  userId: string;
}

export type WorkspaceMembersEnvelope = ApiEnvelope<Member[] | Member>;
export type WorkspaceMemberEnvelope = ApiEnvelope<Member>;
