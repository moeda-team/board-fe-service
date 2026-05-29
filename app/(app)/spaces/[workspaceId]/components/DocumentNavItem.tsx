"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Board } from "@/types/type-boards";
interface DocumentNavItemProps {
  board: Board;
  isActive: boolean;
  onClick: () => void;
  onRenameSubmit: (boardId: string, name: string) => void;
  onDelete: (board: Board) => void;
}

export function DocumentNavItem({
  board,
  isActive,
  onClick,
  onRenameSubmit,
  onDelete
}: DocumentNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `board-${board.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
    zIndex: isDragging ? 50 : undefined
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const containerRef = useRef<HTMLButtonElement>(null);
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
    <div ref={setNodeRef} style={style} className="relative">
      {isRenaming ? (
        <div
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground"
              : "bg-background text-muted-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <input
            ref={renameInputRef}
            className="flex-1 min-w-0 truncate rounded border border-input bg-background px-2 py-0.5 text-sm leading-tight outline-none focus-visible:ring-1 focus-visible:ring-ring h-6"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = renameValue.trim();
                if (trimmed && trimmed !== board.name) {
                  onRenameSubmit(board.id, trimmed);
                }
                setIsRenaming(false);
              } else if (e.key === "Escape") {
                setIsRenaming(false);
              }
            }}
            onBlur={() => {
              const trimmed = renameValue.trim();
              if (trimmed && trimmed !== board.name) {
                onRenameSubmit(board.id, trimmed);
              }
              setIsRenaming(false);
            }}
          />
        </div>
      ) : (
        <button
          ref={containerRef}
          onClick={onClick}
          onContextMenu={handleContextMenu}
          className={`group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <GripVertical
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          />
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate" title={board.name || "Untitled"}>
            {board.name || "Untitled"}
          </span>
        </button>
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
              setRenameValue(board.name || "");
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
              onDelete(board);
            }}
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-accent"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
