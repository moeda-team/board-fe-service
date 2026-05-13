"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
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
    <div className="relative">
      <button
        ref={containerRef}
        onClick={isRenaming ? undefined : onClick}
        onContextMenu={handleContextMenu}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <FileText className="h-3.5 w-3.5 shrink-0" />
        {isRenaming ? (
          <input
            ref={renameInputRef}
            className="flex-1 truncate rounded-sm border border-ring bg-transparent px-1 py-0 text-sm outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
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
        ) : (
          <span className="truncate">{board.name || "Untitled"}</span>
        )}
      </button>

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
