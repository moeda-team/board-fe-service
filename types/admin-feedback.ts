import type { ApiEnvelope } from "./api";

export type AdminFeedbackStatus =
  | "NEED_APPROVAL"
  | "ON_HOLD"
  | "BACKLOG"
  | "IN_PROGRESS"
  | "TESTING"
  | "RELEASE"
  | "REJECTED";

export interface AdminFeedback {
  id: string;
  title: string;
  description: string;
  category: string;
  email: string | null;
  status: AdminFeedbackStatus;
  createdAt: string;
  updatedAt: string;
  submitter?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
}

export interface AdminFeedbackListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminFeedbackListResponse {
  items: AdminFeedback[];
  meta: AdminFeedbackListMeta;
}

export interface UpdateFeedbackStatusDto {
  status: AdminFeedbackStatus;
}

export type AdminFeedbackListEnvelope = ApiEnvelope<AdminFeedbackListResponse>;
export type AdminFeedbackEnvelope = ApiEnvelope<AdminFeedback>;
