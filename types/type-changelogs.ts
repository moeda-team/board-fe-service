import type { ApiEnvelope } from "@/types/api";

export interface ChangelogCreator {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export interface ChangelogAttachment {
  id?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  [key: string]: unknown;
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
  // Optional fields (present only if the backend supports them)
  menu?: string | null;
  youtubeUrl?: string | null;
  highlights?: string[] | null;
  isDraft?: boolean;
}

export interface ChangelogListData {
  items: Changelog[];
}

// POST/PUT use multipart/form-data
export interface ChangelogFormDto {
  version?: string;
  title: string;
  content: string;
  releaseDate?: string; // ISO 8601 (e.g. 2026-06-14)
  attachments?: File[]; // max 5, max 10MB each
  // Extra optional fields surfaced in the create/edit UI
  menu?: string;
  youtubeUrl?: string;
  highlights?: string[];
  isDraft?: boolean;
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
