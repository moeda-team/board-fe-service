import { ApiEnvelope } from "./api";

export interface ApiKey {
  id: string;
  tenantId?: string;
  name: string;
  prefix: string;
  /** Masked/hashed value returned by GET — e.g. "be54a2****..." */
  hashedKey: string;
  /** Plain key returned once on POST — store in memory, never persisted */
  plainKey?: string;
  createdAt: string;
  updatedAt?: string;
  lastUsedAt?: string | null;
  [key: string]: unknown;
}

export type ApiKeyEnvelope = ApiEnvelope<ApiKey>;

export interface GenerateApiKeyDto {
  name: string;
}

export interface GenerateApiKeyParams {
  tenantId: string;
  dto: GenerateApiKeyDto;
}

export interface RevokeApiKeyParams {
  tenantId: string;
  apiKeyId: string;
}
