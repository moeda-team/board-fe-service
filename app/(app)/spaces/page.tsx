"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function useImageFallback() {
  const [error, setError] = useState(false);
  return { error, onError: () => setError(true) };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
}
import { Loader2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useWorkspaces, useDeleteWorkspace } from "@/hooks/api/useWorkspaces";
import { useCurrentPlan } from "@/hooks/api/usePayments";
import { getActiveTenantId, setActiveTenantId } from "@/lib/tenant";
import type { Workspace } from "@/types/type-workspaces";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import CreateSpaceDrawer from "./CreateSpaceDrawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import SearchBox from "../components/input/SearchBox";

function WorkspaceCard({
  workspace,
  onEdit,
  onDelete,
  isDeleting
}: {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const { error: imgError, onError } = useImageFallback();

  const handleCardClick = () => {
    if (workspace.id) {
      router.push(`/spaces/${workspace.id}`);
    }
  };
  const showImage = workspace.imageUrl && !imgError;

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md cursor-pointer"
    >
      <div className="aspect-16/10 w-full overflow-hidden">
        {showImage ? (
          <img
            src={workspace?.imageUrl || ""}
            alt={workspace.name}
            className="h-full w-full object-cover"
            onError={onError}
          />
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              background: workspace.color
                ? `radial-gradient(circle at 40% 40%, ${workspace.color}ee, ${workspace.color})`
                : "radial-gradient(circle at 40% 40%, #ff6b6b, #ee5a5a)"
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,0.15) 100%)`
              }}
            />
            <div
              className="absolute h-36 w-36 bg-white/10"
              style={{ borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%" }}
            />
            <div
              className="absolute h-28 w-28 bg-white/10"
              style={{ borderRadius: "45% 55% 60% 40% / 55% 45% 60% 40%" }}
            />
            <div
              className="absolute h-20 w-20 bg-white/15"
              style={{ borderRadius: "55% 45% 40% 60% / 40% 60% 55% 45%" }}
            />
            <span className="relative z-10 text-5xl font-bold text-white/90">
              {getInitials(workspace.name ?? "")}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <h3 className="truncate text-sm font-medium">{workspace.name}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isDeleting}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 size-7"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(workspace);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workspace);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function WorkspaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="aspect-16/10 w-full animate-pulse bg-muted" />
      <div className="flex items-center justify-between p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function SpacesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: authMe, isLoading: isAuthLoading, isFetched } = useAuthMe();

  useEffect(() => {
    const paramTenantId = searchParams.get("tenantId");
    if (paramTenantId) {
      setActiveTenantId(paramTenantId);
      router.replace("/spaces", { scroll: false });
    }
  }, [searchParams, router]);

  const tenantId = getActiveTenantId(authMe);

  const { data: workspaces = [], isLoading: isWorkspacesLoading } =
    useWorkspaces(tenantId);

  const { data: currentPlan } = useCurrentPlan(tenantId || "");

  const maxWorkspaces = currentPlan?.maxWorkspaces ?? 0; // 0 = unlimited
  const isAtQuota = maxWorkspaces > 0 && workspaces.length >= maxWorkspaces;

  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();

  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filteredWorkspaces = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workspaces;
    return workspaces.filter((w) =>
      (w.name ?? "").toLowerCase().includes(query)
    );
  }, [search, workspaces]);

  const openCreate = () => {
    setEditingWorkspace(null);
    setIsSheetOpen(true);
  };

  const openEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setIsSheetOpen(true);
  };

  const handleDelete = (workspace: Workspace) => {
    if (!tenantId || !workspace.id || isDeleting) return;
    setConfirmDialog({
      open: true,
      title: "Delete Workspace",
      description: `Are you sure you want to delete "${workspace.name}"? This action cannot be undone.`,
      onConfirm: () => deleteWorkspace({ tenantId, workspaceId: workspace.id })
    });
  };

  const isLoading = isAuthLoading || isWorkspacesLoading;

  if (isAuthLoading && !isFetched) {
    return (
      <LayoutWrapper
        title="Create your spaces"
        description="Manage workspaces for better projects"
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
        title="Create your spaces"
        description="Manage workspaces for better projects"
      >
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-500">
            We couldn&apos;t find an active workspace for your account.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper
      title="Create your spaces"
      description="Manage workspaces for better projects"
      actions={
        <div className="flex items-center gap-2">
          {maxWorkspaces > 0 && (
            <span
              className={`text-xs ${isAtQuota ? "text-amber-600 font-medium" : "text-muted-foreground"}`}
            >
              {workspaces.length} / {maxWorkspaces} workspaces
            </span>
          )}
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search"
            resultCount={filteredWorkspaces.length}
          />
          <Button
            type="button"
            onClick={openCreate}
            disabled={isDeleting || isAtQuota}
          >
            <Plus className="h-4 w-4" />
            Create New Space
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <WorkspaceCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-slate-500">
            {search.trim()
              ? "No workspaces match your search."
              : isAtQuota
                ? `Workspace limit reached (${workspaces.length}/${maxWorkspaces}). Upgrade your plan to create more.`
                : "No workspaces yet. Create your first space to get started."}
          </p>
          {!search.trim() && !isAtQuota && (
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create New Space
            </Button>
          )}
          {isAtQuota && (
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/pricing")}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onEdit={openEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}

      <CreateSpaceDrawer
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        editingWorkspace={editingWorkspace}
        tenantId={tenantId}
        isAtQuota={isAtQuota}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open: boolean) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete"
        onConfirm={confirmDialog.onConfirm}
      />
    </LayoutWrapper>
  );
}
