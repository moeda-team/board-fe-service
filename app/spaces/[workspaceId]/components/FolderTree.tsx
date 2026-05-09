"use client";

import { useState } from "react";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import type { Folder } from "@/types/type-folders";
import type { Document } from "@/types/type-documents";
import { DocumentNavItem } from "./DocumentNavItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface FolderTreeProps {
  folder: Folder;
  documents: Document[];
  activeDocumentId: string | null;
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: (folderId: string) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
}

export function FolderTree({
  folder,
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameFolder,
  onDeleteFolder
}: FolderTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col">
      <div className="group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <FolderIcon className="h-4 w-4 shrink-0 text-amber-500" />
        )}
        <span className="flex-1 truncate text-sm font-medium">
          {folder.name || "Untitled"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground group-hover:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onCreateDocument(folder.id)}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              New Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteFolder(folder)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && (
        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          {documents.length === 0 ? (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              No documents
            </span>
          ) : (
            documents.map((doc) => (
              <DocumentNavItem
                key={doc.id}
                document={doc}
                isActive={activeDocumentId === doc.id}
                onClick={() => onSelectDocument(doc)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
