import type {
  ApiEnvelope,
  CreateRoleDto as CreateRoleDtoModel,
  Role as RoleModel,
  UpdateRoleDto as UpdateRoleDtoModel
} from "@/types/api";

export type Role = RoleModel;
export type CreateRoleDto = CreateRoleDtoModel;
export type UpdateRoleDto = UpdateRoleDtoModel;

export interface CreateRoleParams {
  tenantId: string;
  dto: CreateRoleDto;
}

export interface FetchRoleDetailParams {
  tenantId: string;
  roleId: string;
}

export interface UpdateRoleParams {
  tenantId: string;
  roleId: string;
  dto: UpdateRoleDto;
}

export interface DeleteRoleParams {
  tenantId: string;
  roleId: string;
}

export type RolesEnvelope = ApiEnvelope<Role[] | Role>;
export type RoleEnvelope = ApiEnvelope<Role>;
