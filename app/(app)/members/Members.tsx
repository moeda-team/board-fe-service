"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useAuthMe } from "@/hooks/api/useAuth";
import {
  useCancelTenantInvite,
  useRemoveTenantMember,
  useTenantMembers,
  useUpdateMemberRole,
  useUpdateMemberWorkspaces
} from "@/hooks/api/useTenantMembers";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import { useRoles } from "@/hooks/api/useTenantRoles";
import { InviteMemberDialog } from "../components/member/InviteMemberDialog";
import type {
  ActiveTenantMember,
  PendingTenantInvite,
  TenantMemberTableRow
} from "@/types/type-tenant-members";
import type { Role } from "@/types/type-tenant-roles";
import { ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  Clock3,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  UserRound,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SearchBox from "../components/input/SearchBox";
import DynamicTabs from "../components/Layout/DynamicTabs";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import { DataTable } from "../components/table/DataTable";

const formatDate = (date: string | null | undefined) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getInitials = (name: string, email: string) => {
  const source = name || email;

  return source
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const normalizePermission = (permission: unknown) => {
  if (typeof permission === "string") {
    return permission.toLowerCase();
  }

  if (
    typeof permission === "object" &&
    permission !== null &&
    "name" in permission &&
    typeof (permission as { name?: unknown }).name === "string"
  ) {
    return (permission as { name: string }).name.toLowerCase();
  }

  return "";
};

const mapActiveMemberToRow = (
  member: ActiveTenantMember,
  status: TenantMemberTableRow["status"] = "Active"
): TenantMemberTableRow => ({
  id: member.userId,
  targetId: member.userId,
  kind: "member",
  tenantId: member.tenantId,
  userId: member.userId,
  name: member.user.fullName || member.user.username || member.user.email,
  email: member.user.email,
  avatarUrl: member.user.avatarUrl,
  roleId: member.roleId,
  roleName: member.role?.name ?? "-",
  space: "All spaces",
  status,
  joined: formatDate(member.joinedAt),
  workspaceIds: member.workspaceIds || []
});

const mapPendingInviteToRow = (
  invite: PendingTenantInvite
): TenantMemberTableRow => ({
  id: invite.id,
  targetId: invite.id,
  kind: "invite",
  tenantId: invite.tenantId,
  inviteId: invite.id,
  name: invite.email,
  email: invite.email,
  avatarUrl: null,
  roleId: invite.roleId,
  roleName: invite.role?.name ?? "-",
  space: "-",
  status: "Pending",
  joined: formatDate(invite.createdAt)
});

const Members = () => {
  const { data: authMe, isLoading: isAuthLoading, isFetched } = useAuthMe();
  const tenantId = authMe?.tenants?.[0]?.tenant?.id ?? "";
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0); // Reset page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: membersData, isLoading: isMembersLoading } = useTenantMembers(
    tenantId,
    pageIndex + 1,
    15,
    debouncedSearch
  );
  const { data: roles = [] } = useRoles(tenantId);
  const { mutate: updateMemberRole, isPending: isUpdatingMemberRole } =
    useUpdateMemberRole();
  const { mutate: removeTenantMember, isPending: isRemovingTenantMember } =
    useRemoveTenantMember();
  const { mutate: cancelTenantInvite, isPending: isCancelingTenantInvite } =
    useCancelTenantInvite();
  const { mutate: updateMemberWorkspaces, isPending: isUpdatingWorkspaces } =
    useUpdateMemberWorkspaces();
  const { data: workspaces = [], isLoading: isWorkspacesLoading } =
    useWorkspaces(tenantId);
  const [spacePopoverOpen, setSpacePopoverOpen] = useState<string | null>(null);
  const [spaceSearch, setSpaceSearch] = useState("");
  const activeTenant =
    authMe?.tenants?.find((tenant) => tenant.tenant?.id === tenantId) ??
    authMe?.tenants?.[0];
  const tenantPermissions = useMemo(
    () => (activeTenant?.permissions ?? []).map(normalizePermission),
    [activeTenant?.permissions]
  );
  const canInviteMember =
    tenantPermissions.includes("member.manage") ||
    tenantPermissions.includes("member.create") ||
    tenantPermissions.includes("member.invite");
  const canEditMemberRole =
    tenantPermissions.includes("member.manage") ||
    tenantPermissions.includes("member.edit");
  const canRemoveMember =
    tenantPermissions.includes("member.manage") ||
    tenantPermissions.includes("member.delete");
  const roleOptions = useMemo(
    () => (Array.isArray(roles) ? roles : []),
    [roles]
  );

  const isLoading = isAuthLoading || isMembersLoading;
  const isMutatingRow =
    isUpdatingMemberRole ||
    isRemovingTenantMember ||
    isCancelingTenantInvite ||
    isUpdatingWorkspaces;

  const activeRows = useMemo(() => {
    const activeMembers = membersData?.activeMembers ?? [];
    const pendingInvites = membersData?.pendingInvites ?? [];

    return [
      ...activeMembers
        .filter((member) => !member.archivedAt)
        .map((member) => mapActiveMemberToRow(member)),
      ...pendingInvites.map((invite) => mapPendingInviteToRow(invite))
    ];
  }, [membersData?.activeMembers, membersData?.pendingInvites]);

  const archivedRows = useMemo(() => {
    const archivedMembers = membersData?.archivedMembers ?? [];
    const archivedFromMembers = (membersData?.activeMembers ?? []).filter(
      (member) => Boolean(member.archivedAt)
    );

    return [...archivedMembers, ...archivedFromMembers].map((member) =>
      mapActiveMemberToRow(member, "Archived")
    );
  }, [membersData?.activeMembers, membersData?.archivedMembers]);

  const tableRows = activeTab === "archived" ? archivedRows : activeRows;
  const filteredRows = tableRows; // Search is handled by the backend
  const activeMemberCount = activeRows.filter(
    (member) => member.status === "Active"
  ).length;
  const pendingInviteCount = activeRows.filter(
    (member) => member.status === "Pending"
  ).length;
  const totalMemberCount =
    membersData?.meta?.total ?? activeMemberCount + pendingInviteCount;

  const handleRoleChange = (row: TenantMemberTableRow, roleId: string) => {
    if (!tenantId || row.roleId === roleId || isUpdatingMemberRole) {
      return;
    }

    if (!canEditMemberRole) {
      toast.error("You don't have permission to update member roles.");
      return;
    }

    updateMemberRole({
      tenantId,
      targetId: row.targetId,
      dto: {
        roleId
      }
    });
  };

  const handleDeleteRow = (row: TenantMemberTableRow) => {
    if (!tenantId || isMutatingRow) {
      return;
    }

    if (row.kind === "invite") {
      if (!canInviteMember && !canRemoveMember) {
        toast.error("You don't have permission to cancel invitations.");
        return;
      }

      if (!row.inviteId) {
        return;
      }

      const confirmed = window.confirm(`Cancel invite for ${row.email}?`);

      if (!confirmed) {
        return;
      }

      cancelTenantInvite({
        tenantId,
        inviteId: row.inviteId
      });
      return;
    }

    if (!canRemoveMember) {
      toast.error("You don't have permission to remove members.");
      return;
    }

    if (!row.userId) {
      return;
    }

    const confirmed = window.confirm(`Remove ${row.name} from this tenant?`);

    if (!confirmed) {
      return;
    }

    removeTenantMember({
      tenantId,
      userId: row.userId
    });
  };

  const memberColumns: ColumnDef<TenantMemberTableRow>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      )
    },
    {
      accessorKey: "name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatarUrl ?? undefined} />
            <AvatarFallback>
              {getInitials(row.original.name, row.original.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.kind === "invite" && (
              <span className="text-xs text-muted-foreground">Invited</span>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      accessorKey: "roleName",
      header: "Role",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={
              !canEditMemberRole ||
              row.original.status === "Archived" ||
              isUpdatingMemberRole
            }
            className="inline-flex items-center gap-1 text-blue-600 font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {row.original.roleName}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {roleOptions.length === 0 ? (
              <DropdownMenuItem disabled>No roles available</DropdownMenuItem>
            ) : (
              roleOptions.map((role: Role) => (
                <DropdownMenuItem
                  key={role.id}
                  disabled={role.id === row.original.roleId}
                  onClick={() => handleRoleChange(row.original, role.id)}
                >
                  {role.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    {
      accessorKey: "space",
      header: "Space Access",
      cell: ({ row }) => {
        const isOpen = spacePopoverOpen === row.original.id;
        const memberWorkspaceIds = row.original.workspaceIds || [];
        const filteredSpaces = useMemo(() => {
          const q = spaceSearch.toLowerCase();
          return workspaces.filter((ws) =>
            (ws.name || "").toLowerCase().includes(q)
          );
        }, [workspaces, spaceSearch]);
        const selectedSpaces = useMemo(
          () => workspaces.filter((ws) => memberWorkspaceIds.includes(ws.id)),
          [workspaces, memberWorkspaceIds]
        );
        const canManageWorkspaceAccess =
          tenantPermissions.includes("member.manage") ||
          tenantPermissions.includes("member.edit");

        const handleWorkspaceToggle = (
          workspaceId: string,
          checked: boolean
        ) => {
          if (!row.original.userId || !canManageWorkspaceAccess) return;
          const nextIds = checked
            ? [...memberWorkspaceIds, workspaceId]
            : memberWorkspaceIds.filter((id) => id !== workspaceId);
          updateMemberWorkspaces(
            {
              tenantId,
              userId: row.original.userId,
              workspaceIds: nextIds
            },
            {
              onError: () => {
                toast.error("Failed to update workspace access");
              }
            }
          );
        };

        return (
          <Popover
            open={isOpen}
            onOpenChange={(open) => {
              if (open) {
                setSpacePopoverOpen(row.original.id);
                setSpaceSearch("");
              } else {
                setSpacePopoverOpen(null);
              }
            }}
          >
            <PopoverTrigger className="outline-none">
              <div className="flex items-center gap-1 text-blue-600 cursor-pointer hover:underline">
                <span className="text-sm">
                  {selectedSpaces.length === 0
                    ? "No spaces"
                    : selectedSpaces.length === 1
                      ? selectedSpaces[0].name || "Untitled"
                      : `${selectedSpaces.length} spaces`}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="start">
              {isWorkspacesLoading ? (
                <div className="px-2 py-3 text-sm text-slate-500">
                  Loading spaces...
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Search spaces..."
                    value={spaceSearch}
                    onChange={(e) => setSpaceSearch(e.target.value)}
                    className="mb-2 h-8 text-sm"
                  />
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSpaces.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-slate-500">
                        No spaces found
                      </div>
                    ) : (
                      filteredSpaces.map((ws) => (
                        <label
                          key={ws.id}
                          className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-slate-100 ${!canManageWorkspaceAccess ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={(e) => {
                            if (!canManageWorkspaceAccess) {
                              e.preventDefault();
                              return;
                            }
                            e.preventDefault();
                            const isChecked = memberWorkspaceIds.includes(
                              ws.id
                            );
                            handleWorkspaceToggle(ws.id, !isChecked);
                          }}
                        >
                          <Checkbox
                            checked={memberWorkspaceIds.includes(ws.id)}
                            disabled={!canManageWorkspaceAccess}
                            onCheckedChange={(checked) =>
                              handleWorkspaceToggle(ws.id, checked === true)
                            }
                          />
                          <span className="text-sm">
                            {ws.name || "Untitled"}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </PopoverContent>
          </Popover>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.status === "Active"
              ? "text-green-600 border-green-600"
              : row.original.status === "Archived"
                ? "text-slate-600 border-slate-300"
                : "text-yellow-600 border-yellow-600"
          }
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: "joined",
      header: "Joined"
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isMutatingRow}
            className="disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              variant="destructive"
              disabled={
                row.original.kind === "invite"
                  ? !canInviteMember && !canRemoveMember
                  : !canRemoveMember
              }
              onClick={() => handleDeleteRow(row.original)}
            >
              <Trash2 className="h-4 w-4" />
              {row.original.kind === "invite" ? "Cancel invite" : "Archive"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  if (isAuthLoading && !isFetched) {
    return (
      <LayoutWrapper
        title="Members"
        description="Manage member and assign role to control access"
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
        title="Members"
        description="Manage member and assign role to control access"
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
      title="Members"
      description="Manage member and assign role to control access"
      actions={
        <div className="flex gap-2 items-center">
          <SearchBox
            value={search}
            onChange={setSearch}
            resultCount={filteredRows.length}
          />
          {canInviteMember && (
            <Button
              className="bg-brand-blue hover:bg-brand-blue/90 text-brand-white shadow-sm"
              onClick={() => setIsInviteOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Invite member
            </Button>
          )}
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4 flex items-start gap-3">
          <div className="rounded-full bg-brand-soft-blue p-2 text-brand-blue">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Members</p>
            <h2 className="text-2xl font-bold">{totalMemberCount}</h2>
            <p className="text-xs text-muted-foreground">all role</p>
          </div>
        </div>
        <div className="border rounded-xl p-4 flex items-start gap-3">
          <div className="rounded-full bg-green-50 p-2 text-green-600">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <h2 className="text-2xl font-bold text-green-600">
              {activeMemberCount}
            </h2>
            <p className="text-xs text-muted-foreground">Currently Active</p>
          </div>
        </div>
        <div className="border rounded-xl p-4 flex items-start gap-3">
          <div className="rounded-full bg-yellow-50 p-2 text-yellow-600">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <h2 className="text-2xl font-bold text-yellow-600">
              {pendingInviteCount}
            </h2>
            <p className="text-xs text-muted-foreground">Invitation sent</p>
          </div>
        </div>
      </div>

      {/* Tabs */}

      <div className="space-y-4">
        {" "}
        <DynamicTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { label: "Active User", value: "active" },
            { label: "Archive User", value: "archived" }
          ]}
        />
        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 rounded-lg bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
          </div>
        ) : (
          <DataTable<TenantMemberTableRow>
            data={filteredRows}
            columns={memberColumns}
            manualPagination
            pageCount={membersData?.meta?.lastPage ?? 1}
            pageIndex={pageIndex}
            onPageChange={setPageIndex}
          />
        )}
      </div>
      <InviteMemberDialog
        tenantId={tenantId}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        canInviteMember={canInviteMember}
      />
    </LayoutWrapper>
  );
};

export default Members;
