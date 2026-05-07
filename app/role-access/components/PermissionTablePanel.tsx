import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DataTable } from "@/app/components/table/DataTable";
import {
  BarChart3,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Loader2,
  Lock
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoleDetail, useUpdateRole } from "@/hooks/api/useTenantRoles";
import { usePermissions } from "@/hooks/api/useMasterData";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";

interface PermissionTablePanelProps {
  tenantId: string;
  roleId: string | null;
  canEditPermissions: boolean;
}

const moduleOrder = [
  "DASHBOARD",
  "RBAC",
  "WORKSPACE",
  "MEMBER",
  "BOARD",
  "TASK",
  "TENANT"
];

const getModuleLabel = (module: string) => {
  if (module === "RBAC") {
    return "Role & Access";
  }

  return module
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getModuleIcon = (module: string) => {
  switch (module) {
    case "DASHBOARD":
      return <LayoutDashboard className="h-4 w-4" />;
    case "RBAC":
      return <ShieldCheck className="h-4 w-4" />;
    case "WORKSPACE":
    case "BOARD":
      return <Layers className="h-4 w-4" />;
    case "MEMBER":
      return <Users className="h-4 w-4" />;
    case "TASK":
      return <BarChart3 className="h-4 w-4" />;
    default:
      return <ShieldCheck className="h-4 w-4" />;
  }
};

const checkboxClassName =
  "border-brand-blue data-[state=checked]:bg-brand-blue data-[state=checked]:text-brand-white rounded-md";

const actionColumns = ["create", "edit", "delete", "view"] as const;

interface PermissionTableRow {
  module: string;
}

export function PermissionTablePanel({
  tenantId,
  roleId,
  canEditPermissions
}: PermissionTablePanelProps) {
  const queryClient = useQueryClient();
  const { data: role, isLoading } = useRoleDetail(tenantId, roleId || "");
  const { data: permissions = [] } = usePermissions();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateRole();
  const isSystem =
    role?.isDefault ||
    ["admin", "manager", "developer", "stakeholder"].includes(
      (role?.name as string)?.toLowerCase()
    );
  const canUpdatePermissions = canEditPermissions;

  const permissionCatalog = useMemo(() => {
    const catalog: Record<string, Record<string, string>> = {};

    const upsertPermission = (permission: {
      id?: string;
      module?: string;
      name?: string;
    }) => {
      const module = permission.module?.toUpperCase();
      const action = permission.name?.split(".").pop()?.toLowerCase();
      const permissionId = permission.id;

      if (!module || !action || !permissionId) {
        return;
      }

      if (!catalog[module]) {
        catalog[module] = {};
      }

      catalog[module][action] = permissionId;
    };

    permissions.forEach((permission) => {
      upsertPermission({
        id: permission.id,
        module: permission.module,
        name: permission.name
      });
    });

    (role?.permissions ?? []).forEach((rolePermission) => {
      upsertPermission({
        id: rolePermission.permissionId,
        module: rolePermission.permission?.module as string | undefined,
        name: rolePermission.permission?.name as string | undefined
      });
    });

    return catalog;
  }, [permissions, role?.permissions]);

  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    setSelectedPermissionIds(
      new Set(
        (role?.permissions ?? []).map(
          (rolePermission) => rolePermission.permissionId
        )
      )
    );
  }, [role?.permissions]);

  const persistPermissions = (
    nextPermissionIds: Set<string>,
    previousPermissionIds: Set<string>
  ) => {
    if (!tenantId || !roleId || !role?.name || !canUpdatePermissions) {
      return;
    }

    updateRole(
      {
        tenantId,
        roleId,
        dto: {
          name: role.name,
          permissionIds: Array.from(nextPermissionIds)
        }
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["roles", tenantId]
          });
        },
        onError: () => {
          setSelectedPermissionIds(previousPermissionIds);
        }
      }
    );
  };

  const handleActionToggle = (
    module: string,
    action: string,
    checked: boolean
  ) => {
    const permissionId = permissionCatalog[module]?.[action];

    if (!permissionId || isUpdatingRole) {
      return;
    }

    const previousPermissionIds = new Set(selectedPermissionIds);
    const nextPermissionIds = new Set(selectedPermissionIds);

    if (checked) {
      nextPermissionIds.add(permissionId);
    } else {
      nextPermissionIds.delete(permissionId);
    }

    setSelectedPermissionIds(nextPermissionIds);
    persistPermissions(nextPermissionIds, previousPermissionIds);
  };

  const handleAllAccessToggle = (module: string, checked: boolean) => {
    if (isUpdatingRole) {
      return;
    }

    const managePermissionId = permissionCatalog[module]?.manage;
    const actionPermissionIds = actionColumns
      .map((action) => permissionCatalog[module]?.[action])
      .filter((permissionId): permissionId is string => Boolean(permissionId));

    const previousPermissionIds = new Set(selectedPermissionIds);
    const nextPermissionIds = new Set(selectedPermissionIds);

    if (checked) {
      if (managePermissionId) {
        nextPermissionIds.add(managePermissionId);
      }

      actionPermissionIds.forEach((permissionId) =>
        nextPermissionIds.add(permissionId)
      );
    } else {
      if (managePermissionId) {
        nextPermissionIds.delete(managePermissionId);
      }

      actionPermissionIds.forEach((permissionId) =>
        nextPermissionIds.delete(permissionId)
      );
    }

    setSelectedPermissionIds(nextPermissionIds);
    persistPermissions(nextPermissionIds, previousPermissionIds);
  };

  const moduleKeys = Object.keys(permissionCatalog).sort((a, b) => {
    const aIndex = moduleOrder.indexOf(a);
    const bIndex = moduleOrder.indexOf(b);

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });

  const tableData: PermissionTableRow[] = moduleKeys.map((module) => ({
    module
  }));

  const columns: ColumnDef<PermissionTableRow>[] = [
    {
      id: "module",
      header: () => (
        <span className="text-slate-900 font-semibold text-xs">Module</span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;

        return (
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-slate-400">{getModuleIcon(module)}</div>
            <div className="flex flex-col">
              <span className="font-medium text-slate-900 text-sm">
                {getModuleLabel(module)}
              </span>
              <span className="text-[10px] text-slate-400">
                View and manage {getModuleLabel(module).toLowerCase()}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      id: "all-access",
      header: () => (
        <span className="block text-center text-slate-900 font-semibold text-xs">
          All Access
        </span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;
        const actionPermissionIds = actionColumns
          .map((action) => permissionCatalog[module]?.[action])
          .filter((permissionId): permissionId is string =>
            Boolean(permissionId)
          );
        const managePermissionId = permissionCatalog[module]?.manage;
        const hasManage =
          Boolean(managePermissionId) &&
          selectedPermissionIds.has(managePermissionId as string);
        const hasAllActions =
          actionPermissionIds.length > 0 &&
          actionPermissionIds.every((permissionId) =>
            selectedPermissionIds.has(permissionId)
          );
        const allAccess = hasManage || hasAllActions;

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={allAccess}
              disabled={isUpdatingRole}
              onCheckedChange={(checked) =>
                handleAllAccessToggle(module, checked === true)
              }
              className={checkboxClassName}
            />
          </div>
        );
      }
    },
    {
      id: "create",
      header: () => (
        <span className="block text-center text-slate-900 font-semibold text-xs">
          Create
        </span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={Boolean(
                permissionCatalog[module]?.create &&
                selectedPermissionIds.has(permissionCatalog[module].create)
              )}
              disabled={!permissionCatalog[module]?.create || isUpdatingRole}
              onCheckedChange={(checked) =>
                handleActionToggle(module, "create", checked === true)
              }
              className={checkboxClassName}
            />
          </div>
        );
      }
    },
    {
      id: "edit",
      header: () => (
        <span className="block text-center text-slate-900 font-semibold text-xs">
          Edit
        </span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={Boolean(
                permissionCatalog[module]?.edit &&
                selectedPermissionIds.has(permissionCatalog[module].edit)
              )}
              disabled={!permissionCatalog[module]?.edit || isUpdatingRole}
              onCheckedChange={(checked) =>
                handleActionToggle(module, "edit", checked === true)
              }
              className={checkboxClassName}
            />
          </div>
        );
      }
    },
    {
      id: "delete",
      header: () => (
        <span className="block text-center text-slate-900 font-semibold text-xs">
          Delete
        </span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={Boolean(
                permissionCatalog[module]?.delete &&
                selectedPermissionIds.has(permissionCatalog[module].delete)
              )}
              disabled={!permissionCatalog[module]?.delete || isUpdatingRole}
              onCheckedChange={(checked) =>
                handleActionToggle(module, "delete", checked === true)
              }
              className={checkboxClassName}
            />
          </div>
        );
      }
    },
    {
      id: "view",
      header: () => (
        <span className="block text-center text-slate-900 font-semibold text-xs">
          View
        </span>
      ),
      cell: ({ row }) => {
        const module = row.original.module;

        return (
          <div className="flex justify-center">
            <Checkbox
              checked={Boolean(
                permissionCatalog[module]?.view &&
                selectedPermissionIds.has(permissionCatalog[module].view)
              )}
              disabled={!permissionCatalog[module]?.view || isUpdatingRole}
              onCheckedChange={(checked) =>
                handleActionToggle(module, "view", checked === true)
              }
              className={checkboxClassName}
            />
          </div>
        );
      }
    }
  ];

  if (!roleId) {
    return (
      <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-125 items-center justify-center bg-slate-50/50">
        <Lock className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Select a role to view permissions
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-125 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden flex flex-col h-125">
      {/* Permission Header */}
      <div className="p-5 flex justify-between items-center border-b border-slate-100">
        <div className="flex gap-3 items-center">
          <div className="rounded-full bg-brand-soft-blue p-2 text-brand-blue">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">
                {role?.name as string}
              </span>
              <Badge
                variant={isSystem ? "secondary" : "outline"}
                className={cn(
                  "px-1.5 py-0 text-[10px] h-4",
                  isSystem
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                    : "text-slate-600 border-slate-200"
                )}
              >
                {isSystem ? "System" : "Custom"}
              </Badge>
            </div>
            <span className="text-sm text-slate-500 mt-0.5">
              {(role?.description as string) || "No description provided"}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-900 text-base">
            {role?.totalMember ?? (role as any)?._count?.members ?? 0}
          </span>
          <span className="text-xs text-slate-500">members</span>
        </div>
      </div>

      {canUpdatePermissions ? (
        <div className="px-5 py-1.5 text-[10px] text-slate-400 border-b border-slate-100 bg-slate-50/30">
          Toggle checkboxes to update role permissions.
        </div>
      ) : (
        <div className="px-5 py-1.5 text-[10px] text-amber-600 border-b border-slate-100 bg-amber-50/40">
          You don't have permission to edit role access.
        </div>
      )}

      {/* Permission Table */}
      <ScrollArea className="flex-1">
        <DataTable data={tableData} columns={columns} showPagination={false} />
      </ScrollArea>
    </Card>
  );
}
