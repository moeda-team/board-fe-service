"use client";

import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
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

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const containerRef = useRef<HTMLButtonElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

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
            className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground opacity-50 transition-opacity hover:text-foreground hover:opacity-100"
          />
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate flex-1 text-left" title={board.name || "Untitled"}>
            {board.name || "Untitled"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Board actions"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameValue(board.name || "");
                  setIsRenaming(true);
                  setTimeout(() => renameInputRef.current?.focus(), 0);
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(board);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </button>
      )}

    </div>
  );
}
