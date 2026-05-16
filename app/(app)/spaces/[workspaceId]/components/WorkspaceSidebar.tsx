"use client";

import { Plus, Building2 } from "lucide-react";
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
    <aside className="flex h-full w-64 flex-col rounded-xl border bg-sidebar text-sidebar-foreground shadow-sm overflow-hidden">
      {/* Workspace Title */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3">
        <Building2 className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{workspaceName}</span>
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

      <div className="flex flex-col gap-4 p-4">
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
