"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  GripVertical,
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
  onRenameFolderSubmit: (folderId: string, name: string) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameDocumentSubmit: (boardId: string, name: string) => void;
  onDeleteDocument: (board: Board) => void;
  onReorderDocument?: (
    boardId: string,
    targetIndex: number,
    targetFolderId: string
  ) => void;
}

export function FolderTree({
  folder,
  boards,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameFolderSubmit,
  onDeleteFolder,
  onRenameDocumentSubmit,
  onDeleteDocument,
  onReorderDocument
}: FolderTreeProps) {
  const folderDndId = `folder-${folder.id}`;
  const boardDndIds = boards.map((b) => `board-${b.id}`);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isFolderDragging
  } = useSortable({ id: folderDndId });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `folder-drop-${folder.id}`
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isFolderDragging ? 0.6 : undefined,
    zIndex: isFolderDragging ? 50 : undefined
  };

  const [isExpanded, setIsExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const folderRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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
    <div ref={setNodeRef} style={style} className="flex flex-col">
      {isRenaming ? (
        <div className="flex items-center gap-1 rounded-md px-1 py-1 bg-background">
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
          <input
            ref={renameInputRef}
            className="flex-1 min-w-0 truncate rounded border border-input bg-background px-2 py-0.5 text-sm font-medium leading-tight outline-none focus-visible:ring-1 focus-visible:ring-ring h-6"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = renameValue.trim();
                if (trimmed && trimmed !== folder.name) {
                  onRenameFolderSubmit(folder.id, trimmed);
                }
                setIsRenaming(false);
              } else if (e.key === "Escape") {
                setIsRenaming(false);
              }
            }}
            onBlur={() => {
              const trimmed = renameValue.trim();
              if (trimmed && trimmed !== folder.name) {
                onRenameFolderSubmit(folder.id, trimmed);
              }
              setIsRenaming(false);
            }}
          />
        </div>
      ) : (
        <div
          ref={folderRef}
          className={`group flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted ${
            isFolderDragging ? "bg-muted ring-2 ring-primary/20" : ""
          }`}
          onContextMenu={handleContextMenu}
        >
          {/* Drag Handle (dnd-kit) */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </button>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            aria-label="Drag folder"
          >
            <GripVertical
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 cursor-grab text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            />
          </button>
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
          ) : (
            <FolderIcon className="h-4 w-4 shrink-0 text-amber-500" />
          )}
          <span
            className="flex-1 truncate text-sm font-medium"
            title={folder.name || "Untitled"}
          >
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
      )}

      {menuOpen && (
        <div
          className="fixed z-50 min-w-35 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ left: menuPos.x, top: menuPos.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setMenuOpen(false);
              setRenameValue(folder.name || "");
              setIsRenaming(true);
              setTimeout(() => renameInputRef.current?.focus(), 0);
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
        <SortableContext
          items={boardDndIds}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setDropRef}
            className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-2"
          >
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
                  onRenameSubmit={onRenameDocumentSubmit}
                  onDelete={onDeleteDocument}
                />
              ))
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
