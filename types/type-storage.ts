import { ApiEnvelope } from "./api";

export interface TenantStorageData {
  totalLimitBytes: number;
  usedBytes: number;
  remainingBytes: number;
  percentageUsed: number;
}

export type TenantStorageEnvelope = ApiEnvelope<TenantStorageData>;
