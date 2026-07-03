import type { ApiEnvelope } from "@/types/api";

export interface ChangelogCreator {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ChangelogAttachment {
  id: string;
  tenantId: string | null;
  uploadedBy: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  taskId: string | null;
  commentId: string | null;
  feedbackId: string | null;
  changelogId: string;
  createdAt: string;
}

export interface Changelog {
  id: string;
  version: string;
  title: string;
  content: string;
  releaseDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: ChangelogCreator | null;
  attachments: ChangelogAttachment[];
  menu: string;
  youtubeUrl?: string | null;
  highlights?: string[] | null;
  status: "DRAFT" | "PUBLISHED";
}

export interface ChangelogListData {
  items: Changelog[];
}

// POST/PUT use multipart/form-data
export interface ChangelogFormDto {
  version?: string;
  title: string;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  menu: string;
  releaseDate?: string; // ISO 8601 (e.g. 2026-06-14)
  attachments?: File[]; // max 5, max 10MB each
  youtubeUrl?: string;
  highlights?: string[];
}

export interface CreateChangelogParams {
  dto: ChangelogFormDto;
}

export interface UpdateChangelogParams {
  id: string;
  dto: ChangelogFormDto;
}

export interface DeleteChangelogParams {
  id: string;
}

export type ChangelogEnvelope = ApiEnvelope<Changelog>;
export type ChangelogListEnvelope = ApiEnvelope<ChangelogListData>;
