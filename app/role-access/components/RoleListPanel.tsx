import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, Plus, ShieldCheck, UserCircle, Loader2 } from "lucide-react";
import { useRoles } from "@/hooks/api/useTenantRoles";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RoleListPanelProps {
  tenantId: string;
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  canCreateRole: boolean;
}

export function RoleListPanel({
  tenantId,
  selectedRoleId,
  onSelectRole,
  canCreateRole
}: RoleListPanelProps) {
  const { data: roles = [], isLoading } = useRoles(tenantId);
  const roleList = Array.isArray(roles) ? roles : [];

  useEffect(() => {
    if (roleList.length > 0 && !selectedRoleId) {
      onSelectRole(roleList[0].id as string);
    }
  }, [roleList, selectedRoleId, onSelectRole]);

  console.log("roleList:", roleList);

  return (
    <div className="w-full lg:w-115 flex flex-col gap-4">
      <Card className="shadow-sm border-slate-200 flex flex-col h-full">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Roles</h2>
              <p className="text-xs text-slate-500 mt-1">
                Create and manage roles access levels
              </p>
            </div>
            {canCreateRole && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-brand-blue border-brand-soft-blue hover:bg-brand-soft-blue/50"
              >
                <Plus className="mr-1 h-3 w-3" />
                New Role
              </Button>
            )}
          </div>

          {/* Role List */}
          <div className="flex flex-col gap-3 mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : roleList.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No roles found
              </div>
            ) : (
              roleList.map((role: any) => {
                const isActive = selectedRoleId === role.id;
                const isSystem =
                  role.isDefault ||
                  ["admin", "manager", "developer", "stakeholder"].includes(
                    role.name?.toLowerCase()
                  );

                return (
                  <div
                    key={role.id}
                    onClick={() => onSelectRole(role.id)}
                    className={cn(
                      "rounded-xl border p-3 cursor-pointer flex justify-between items-start transition-all",
                      isActive
                        ? "border-brand-blue bg-brand-soft-blue/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "mt-0.5 rounded-full p-1.5",
                          isActive
                            ? "bg-brand-soft-blue text-brand-blue"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {isSystem ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <UserCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {role.name}
                          </span>
                          <Badge
                            variant={isSystem ? "secondary" : "outline"}
                            className={cn(
                              "px-1.5 py-0 text-[10px] h-4",
                              isSystem
                                ? "bg-brand-soft-blue text-brand-blue hover:bg-brand-soft-blue"
                                : "text-slate-600 border-slate-200"
                            )}
                          >
                            {isSystem ? "System" : "Custom"}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {role.description || "No description provided"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-sm">
                        {role.totalMember ?? 0}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        members
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-auto p-4 pt-0">
          <div className="rounded-lg bg-slate-100 p-3 flex gap-2 items-start">
            <Info className="h-4 w-4 text-brand-blue mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              System role (Admin, Managers, Developers, Stakeholders) can't be
              deleted
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
