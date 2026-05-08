import type {
  ApiEnvelope,
  Board as BoardModel,
  CreateBoardDto as CreateBoardDtoModel,
  UpdateBoardDto as UpdateBoardDtoModel
} from "@/types/api";

export type Board = BoardModel;
export type CreateBoardDto = CreateBoardDtoModel;
export type UpdateBoardDto = UpdateBoardDtoModel;

export interface BoardsParams {
  tenantId: string;
  workspaceId: string;
}

export interface CreateBoardParams {
  tenantId: string;
  workspaceId: string;
  dto: CreateBoardDto;
}

export interface UpdateBoardParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  dto: UpdateBoardDto;
}

export interface DeleteBoardParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
}

export type BoardsEnvelope = ApiEnvelope<Board[] | Board>;
export type BoardEnvelope = ApiEnvelope<Board>;
