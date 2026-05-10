"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";
import type { Board } from "@/types/type-boards";

interface DocumentNavItemProps {
  board: Board;
  isActive: boolean;
  onClick: () => void;
  onRename: (board: Board) => void;
  onDelete: (board: Board) => void;
}

export function DocumentNavItem({
  board,
  isActive,
  onClick,
  onRename,
  onDelete
}: DocumentNavItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLButtonElement>(null);

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
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <FileText className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{board.name || "Untitled"}</span>
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
              onRename(board);
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
