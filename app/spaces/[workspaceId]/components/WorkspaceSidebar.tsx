"use client";

import Link from "next/link";
import { Plus, Building2, ChevronDown } from "lucide-react";
import type { Folder } from "@/types/type-folders";
import type { Board } from "@/types/type-boards";
import { Button } from "@/components/ui/button";
import { FolderTree } from "./FolderTree";

interface WorkspaceSidebarProps {
  workspaceName: string;
  folders: Folder[];
  boardsByFolder: Record<string, Board[]>;
  activeDocumentId: string | null;
  onSelectDocument: (board: Board) => void;
  onCreateFolder: () => void;
  onCreateDocument: (folderId: string) => void;
  onRenameFolderSubmit: (folderId: string, name: string) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameDocumentSubmit: (boardId: string, name: string) => void;
  onDeleteDocument: (board: Board) => void;
  isLoading?: boolean;
}

export function WorkspaceSidebar({
  workspaceName,
  folders,
  boardsByFolder,
  activeDocumentId,
  onSelectDocument,
  onCreateFolder,
  onCreateDocument,
  onRenameFolderSubmit,
  onDeleteFolder,
  onRenameDocumentSubmit,
  onDeleteDocument,
  isLoading
}: WorkspaceSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Header / Logo */}
      <div className="flex flex-col gap-4 border-b border-sidebar-border px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-blue text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight">Trello KW</span>
        </Link>

        {/* Mock Tenant Selector */}
        <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-sidebar-accent">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded bg-brand-soft-blue text-brand-blue">
              <Building2 className="size-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">Tenant 1</span>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">
                  Subscription
                </span>
                <span className="rounded bg-blue-100 px-1 py-0.5 text-[9px] font-medium text-blue-600">
                  Free
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : folders.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No folders yet.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {folders.map((folder) => (
              <FolderTree
                key={folder.id}
                folder={folder}
                boards={boardsByFolder[folder.id] || []}
                activeDocumentId={activeDocumentId}
                onSelectDocument={onSelectDocument}
                onCreateDocument={onCreateDocument}
                onRenameFolderSubmit={onRenameFolderSubmit}
                onDeleteFolder={onDeleteFolder}
                onRenameDocumentSubmit={onRenameDocumentSubmit}
                onDeleteDocument={onDeleteDocument}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onCreateFolder}
        >
          <Plus className="h-4 w-4" />
          New Folder
        </Button>

        <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Storage</span>
            <span className="text-[10px] text-muted-foreground">40% used</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-accent border border-sidebar-border">
            <div className="h-full w-[40%] rounded-full bg-brand-blue" />
          </div>
          <span className="text-[10px] text-muted-foreground">
            2.50GB / 6 GB
          </span>
        </div>
      </div>
    </aside>
  );
}
