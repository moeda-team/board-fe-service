import type { ApiEnvelope, Tenant as TenantModel } from "@/types/api";

export type Tenant = TenantModel;
export type TenantsEnvelope = ApiEnvelope<Tenant[] | Tenant>;
