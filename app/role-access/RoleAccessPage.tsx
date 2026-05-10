"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthMe } from "@/hooks/api/useAuth";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import { RoleListPanel } from "./components/RoleListPanel";
import { PermissionTablePanel } from "./components/PermissionTablePanel";
import { HowItWorksPanel } from "./components/HowItWorksPanel";

export default function RoleAccessPage() {
  const { data: authMe, isLoading: isAuthLoading, isFetched } = useAuthMe();
  const tenantId = authMe?.tenants?.[0]?.tenant?.id ?? "";
  const activeTenant =
    authMe?.tenants?.find((tenant) => tenant.tenant?.id === tenantId) ??
    authMe?.tenants?.[0];
  const tenantPermissions = (activeTenant?.permissions ?? []).map(
    (permission: unknown) => {
      if (typeof permission === "string") {
        return permission.toLowerCase();
      }

      const permissionName =
        typeof permission === "object" &&
        permission !== null &&
        "name" in permission &&
        typeof (permission as { name?: unknown }).name === "string"
          ? (permission as { name: string }).name
          : "";

      return permissionName.toLowerCase();
    }
  );

  const canEditRolePermissions =
    tenantPermissions.includes("rbac.manage") ||
    tenantPermissions.includes("rbac.edit");
  const canCreateRole =
    tenantPermissions.includes("rbac.manage") ||
    tenantPermissions.includes("rbac.create");
  const canDeleteRole =
    tenantPermissions.includes("rbac.manage") ||
    tenantPermissions.includes("rbac.delete");
  const canInviteMember =
    tenantPermissions.includes("member.manage") ||
    tenantPermissions.includes("member.create") ||
    tenantPermissions.includes("member.invite");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  if (isAuthLoading && !isFetched) {
    return (
      <LayoutWrapper
        title="Role Management & Access Control"
        description="Loading your workspace..."
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      </LayoutWrapper>
    );
  }

  if (!tenantId && !isAuthLoading && isFetched) {
    return (
      <LayoutWrapper
        title="Role Management & Access Control"
        description="Workspace not found"
      >
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-500">
            We couldn't find an active workspace for your account.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper
      title={`Role Management & Access Control`}
      description={`Manage roles and control access permission across your workspace`}
      actions={
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-8 w-62.5 bg-white border-slate-200"
            />
          </div>
          {canInviteMember && (
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Invite member
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-row gap-6">
        <RoleListPanel
          tenantId={tenantId}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          canCreateRole={canCreateRole}
        />

        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="flex-1 flex flex-col gap-4">
            <PermissionTablePanel
              tenantId={tenantId}
              roleId={selectedRoleId}
              canEditPermissions={canEditRolePermissions}
              canCreateRole={canCreateRole}
              canDeleteRole={canDeleteRole}
              onSelectRole={setSelectedRoleId}
            />
            <HowItWorksPanel />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
