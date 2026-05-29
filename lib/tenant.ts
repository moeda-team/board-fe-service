import { AuthMeResponse } from "@/types/api";

const ACTIVE_TENANT_KEY = "activeTenantId";

export function setActiveTenantId(tenantId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACTIVE_TENANT_KEY, tenantId);
  }
}

export function getActiveTenantId(authMe: AuthMeResponse | undefined): string {
  if (typeof window === "undefined") {
    return authMe?.tenants?.[0]?.tenant?.id ?? "";
  }
  const stored = localStorage.getItem(ACTIVE_TENANT_KEY);
  if (stored) {
    const match = authMe?.tenants?.find((t) => t.tenant?.id === stored);
    if (match) return match.tenant.id;
  }
  return authMe?.tenants?.[0]?.tenant?.id ?? "";
}

export function getActiveTenantEntry(authMe: AuthMeResponse | undefined) {
  const id = getActiveTenantId(authMe);
  return (
    authMe?.tenants?.find((t) => t.tenant?.id === id) ?? authMe?.tenants?.[0]
  );
}
