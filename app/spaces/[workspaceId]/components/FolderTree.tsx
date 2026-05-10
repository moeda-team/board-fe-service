"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import type { Folder } from "@/types/type-folders";
import type { Board } from "@/types/type-boards";
import { DocumentNavItem } from "./DocumentNavItem";

interface FolderTreeProps {
  folder: Folder;
  boards: Board[];
  activeDocumentId: string | null;
  onSelectDocument: (board: Board) => void;
  onCreateDocument: (folderId: string) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameDocument: (board: Board) => void;
  onDeleteDocument: (board: Board) => void;
}

export function FolderTree({
  folder,
  boards,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameFolder,
  onDeleteFolder,
  onRenameDocument,
  onDeleteDocument
}: FolderTreeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const folderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = () => setMenuOpen(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div
        ref={folderRef}
        className="group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted"
        onContextMenu={handleContextMenu}
      >
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateDocument(folder.id);
          }}
          className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          title="New Document"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed z-50 min-w-35 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ left: menuPos.x, top: menuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              onRenameFolder(folder);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              onDeleteFolder(folder);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2">
          {boards.length === 0 ? (
            <span className="px-2 py-1 text-xs text-muted-foreground">
              No boards
            </span>
          ) : (
            boards.map((board) => (
              <DocumentNavItem
                key={board.id}
                board={board}
                isActive={activeDocumentId === board.id}
                onClick={() => onSelectDocument(board)}
                onRename={onRenameDocument}
                onDelete={onDeleteDocument}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
