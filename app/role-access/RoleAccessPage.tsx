"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from "@/components/ui/select";
import { Plus, Search, Loader2, Send } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useInviteMember } from "@/hooks/api/useTenantMembers";
import { useRoles, useCreateRole } from "@/hooks/api/useTenantRoles";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviteWorkspaceId, setInviteWorkspaceId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const { data: roles = [], isLoading: isRolesLoading } = useRoles(tenantId);
  const { data: workspaces = [], isLoading: isWorkspacesLoading } =
    useWorkspaces(tenantId);
  const { mutate: inviteMember, isPending: isInvitingMember } =
    useInviteMember();
  const { mutate: createRole, isPending: isCreatingRole } = useCreateRole();

  const roleOptions = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles]
  );
  const selectedInviteRole = roleOptions.find(
    (role) => role.id === inviteRoleId
  );
  const selectedInviteWorkspace = workspaces.find(
    (ws) => ws.id === inviteWorkspaceId
  );

  useEffect(() => {
    if (!inviteRoleId && roleOptions[0]?.id) {
      setInviteRoleId(roleOptions[0].id as string);
    }
  }, [inviteRoleId, roleOptions]);

  const handleCreateRoleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newRoleName.trim();
    if (!tenantId || !name || isCreatingRole) return;
    createRole(
      {
        tenantId,
        dto: { name, description: newRoleDescription.trim() || undefined }
      },
      {
        onSuccess: () => {
          setNewRoleName("");
          setNewRoleDescription("");
          setIsCreateRoleOpen(false);
        }
      }
    );
  };

  const handleInviteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!tenantId || !email || !inviteRoleId || isInvitingMember) return;
    const workspaceIds = inviteWorkspaceId ? [inviteWorkspaceId] : [];
    inviteMember(
      { tenantId, dto: { email, roleId: inviteRoleId, workspaceIds } },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteWorkspaceId("");
          setInviteMessage("");
          setIsInviteOpen(false);
        }
      }
    );
  };

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
            <Button
              className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white shadow-sm"
              onClick={() => setIsInviteOpen(true)}
              disabled={isRolesLoading || isWorkspacesLoading}
            >
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
          onCreateRole={() => setIsCreateRoleOpen(true)}
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

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogDescription>
              Invite new members to your workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="invite-email">
                Email Address
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="name@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Role</label>
              <Select
                value={inviteRoleId}
                onValueChange={(value) => value && setInviteRoleId(value)}
                disabled={isRolesLoading}
              >
                <SelectTrigger className="w-full">
                  {inviteRoleId && selectedInviteRole
                    ? selectedInviteRole.name
                    : "Select role"}
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No roles available
                    </SelectItem>
                  ) : (
                    roleOptions.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Space Invite</label>
              <Select
                value={inviteWorkspaceId}
                onValueChange={(value) => value && setInviteWorkspaceId(value)}
                disabled={isWorkspacesLoading}
              >
                <SelectTrigger className="w-full">
                  {inviteWorkspaceId && selectedInviteWorkspace
                    ? selectedInviteWorkspace.name || "Untitled"
                    : "Select space"}
                </SelectTrigger>
                <SelectContent>
                  {workspaces.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No spaces available
                    </SelectItem>
                  ) : (
                    workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name || "Untitled"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="invite-message">
                Email Message
              </label>
              <Textarea
                id="invite-message"
                placeholder="Hi, saya invite kamu kedalam project A"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white"
                disabled={
                  isInvitingMember ||
                  isRolesLoading ||
                  isWorkspacesLoading ||
                  !inviteEmail.trim() ||
                  !inviteRoleId
                }
              >
                {isInvitingMember ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Sent Invitation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogDescription>
              Create new role and new access
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateRoleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="role-name">
                Role Name
              </label>
              <Input
                id="role-name"
                type="text"
                placeholder="Role"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="role-description">
                Description
              </label>
              <Textarea
                id="role-description"
                placeholder="Role Description"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white"
                disabled={isCreatingRole || !newRoleName.trim()}
              >
                {isCreatingRole ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create Role
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </LayoutWrapper>
  );
}
