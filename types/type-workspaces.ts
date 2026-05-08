import type {
  ApiEnvelope,
  CreateWorkspaceDto as CreateWorkspaceDtoModel,
  UpdateWorkspaceDto as UpdateWorkspaceDtoModel,
  Workspace as WorkspaceModel
} from "@/types/api";

export type Workspace = WorkspaceModel;
export type CreateWorkspaceDto = CreateWorkspaceDtoModel;
export type UpdateWorkspaceDto = UpdateWorkspaceDtoModel;

export interface CreateWorkspaceParams {
  tenantId: string;
  dto: CreateWorkspaceDto;
}

export interface UpdateWorkspaceParams {
  tenantId: string;
  workspaceId: string;
  dto: UpdateWorkspaceDto;
}

export interface DeleteWorkspaceParams {
  tenantId: string;
  workspaceId: string;
}

export type WorkspacesEnvelope = ApiEnvelope<Workspace[] | Workspace>;
export type WorkspaceEnvelope = ApiEnvelope<Workspace>;
