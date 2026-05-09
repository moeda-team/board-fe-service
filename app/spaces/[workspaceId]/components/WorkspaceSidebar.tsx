"use client";

import { Plus } from "lucide-react";
import type { Folder } from "@/types/type-folders";
import type { Document } from "@/types/type-documents";
import { Button } from "@/components/ui/button";
import { FolderTree } from "./FolderTree";

interface WorkspaceSidebarProps {
  workspaceName: string;
  folders: Folder[];
  documentsByFolder: Record<string, Document[]>;
  activeDocumentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onCreateFolder: () => void;
  onCreateDocument: (folderId: string) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  isLoading?: boolean;
}

export function WorkspaceSidebar({
  workspaceName,
  folders,
  documentsByFolder,
  activeDocumentId,
  onSelectDocument,
  onCreateFolder,
  onCreateDocument,
  onRenameFolder,
  onDeleteFolder,
  isLoading,
}: WorkspaceSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="truncate text-sm font-semibold">{workspaceName}</h2>
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
                documents={documentsByFolder[folder.id] || []}
                activeDocumentId={activeDocumentId}
                onSelectDocument={onSelectDocument}
                onCreateDocument={onCreateDocument}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onCreateFolder}
        >
          <Plus className="h-4 w-4" />
          New Folder
        </Button>
      </div>
    </aside>
  );
}
