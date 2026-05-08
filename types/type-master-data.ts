import type { ApiEnvelope, Permission as PermissionModel } from "@/types/api";

export type Permission = PermissionModel;
export type PermissionsEnvelope = ApiEnvelope<Permission[] | Permission>;
