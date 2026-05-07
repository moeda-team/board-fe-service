"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useTenantMembers } from "@/hooks/api/useTenantMembers";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import SearchBox from "../components/input/SearchBox";
import DynamicTabs from "../components/Layout/DynamicTabs";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import { DataTable } from "../components/table/DataTable";
import { Member } from "./types";

const Members = () => {
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const tenantId = authMe?.tenants?.[0]?.tenant?.id ?? "";
  const { data: members = [], isLoading: isMembersLoading } =
    useTenantMembers(tenantId);

  const isLoading = isAuthLoading || isMembersLoading;

  const data: Member[] = (members as Record<string, any>[]).map((m) => ({
    id: m.id ?? m.userId ?? "",
    name: m.fullName ?? m.name ?? m.username ?? "",
    email: m.email ?? "",
    role: m.role?.name ?? m.role ?? "",
    space: m.spaceAccess ?? "-",
    status: m.status === "active" ? "Active" : "Pending",
    joined: m.joinedAt
      ? new Date(m.joinedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        })
      : "-"
  }));

  const memberColumns: ColumnDef<Member>[] = [
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
            <AvatarImage src="/avatar.png" />
            <AvatarFallback>DS</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Email"
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="text-blue-600 font-medium">
            {row.original.role}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Admin</DropdownMenuItem>
            <DropdownMenuItem>Manager</DropdownMenuItem>
            <DropdownMenuItem>Developer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    {
      accessorKey: "space",
      header: "Space Access",
      cell: ({ row }) => (
        <span className="text-blue-600 cursor-pointer">
          {row.original.space}
        </span>
      )
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
      header: "",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <LayoutWrapper
      title="Members"
      description="Manage member and assign role to control access"
      actions={
        <div className="flex gap-2 items-center">
          <SearchBox />
          <Button>Invite Member</Button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <h2 className="text-2xl font-bold">{data.length}</h2>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <h2 className="text-2xl font-bold text-green-600">
            {data.filter((m) => m.status === "Active").length}
          </h2>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-600">
            {data.filter((m) => m.status === "Pending").length}
          </h2>
        </div>
      </div>

      {/* Tabs */}

      <div className="space-y-4">
        {" "}
        <DynamicTabs
          tabs={[
            { label: "Active User", value: "active" },
            { label: "Archive User", value: "archived" }
          ]}
        />
        {/* Table */}
        <DataTable<Member> data={data} columns={memberColumns} />
      </div>
    </LayoutWrapper>
  );
};

export default Members;
