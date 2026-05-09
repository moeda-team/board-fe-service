import type {
  ApiEnvelope,
  Document as DocumentModel,
  CreateDocumentDto as CreateDocumentDtoModel,
  UpdateDocumentDto as UpdateDocumentDtoModel
} from "@/types/api";

export type Document = DocumentModel;
export type CreateDocumentDto = CreateDocumentDtoModel;
export type UpdateDocumentDto = UpdateDocumentDtoModel;

export interface DocumentsParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
}

export interface CreateDocumentParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
  dto: CreateDocumentDto;
}

export interface UpdateDocumentParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
  documentId: string;
  dto: UpdateDocumentDto;
}

export interface DeleteDocumentParams {
  tenantId: string;
  workspaceId: string;
  folderId: string;
  documentId: string;
}

export type DocumentsEnvelope = ApiEnvelope<Document[] | Document>;
export type DocumentEnvelope = ApiEnvelope<Document>;
