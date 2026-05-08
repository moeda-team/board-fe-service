import type {
  ApiEnvelope,
  CreateFolderDto as CreateFolderDtoModel,
  Folder as FolderModel,
  UpdateFolderDto as UpdateFolderDtoModel
} from "@/types/api";

export type Folder = FolderModel;
export type CreateFolderDto = CreateFolderDtoModel;
export type UpdateFolderDto = UpdateFolderDtoModel;

export interface FoldersParams {
  tenantId: string;
  workspaceId: string;
}

export interface CreateFolderParams {
  tenantId: string;
  workspaceId: string;
  dto: CreateFolderDto;
}

export interface UpdateFolderParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
  dto: UpdateFolderDto;
}

export interface DeleteFolderParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
}

export type FoldersEnvelope = ApiEnvelope<Folder[] | Folder>;
export type FolderEnvelope = ApiEnvelope<Folder>;
