import type {
  ApiEnvelope,
  Column as ColumnModel,
  CreateColumnDto as CreateColumnDtoModel,
  ReorderColumnsDto as ReorderColumnsDtoModel,
  UpdateColumnDto as UpdateColumnDtoModel
} from "@/types/api";

export type Column = ColumnModel;
export type CreateColumnDto = CreateColumnDtoModel;
export type UpdateColumnDto = UpdateColumnDtoModel;
export type ReorderColumnsDto = ReorderColumnsDtoModel;

export interface ColumnsParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
}

export interface CreateColumnParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  dto: CreateColumnDto;
}

export interface ReorderColumnsParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  dto: ReorderColumnsDto;
}

export interface UpdateColumnParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
  dto: UpdateColumnDto;
}

export interface DeleteColumnParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  columnId: string;
}

export type ColumnsEnvelope = ApiEnvelope<Column[] | Column>;
export type ColumnEnvelope = ApiEnvelope<Column>;
