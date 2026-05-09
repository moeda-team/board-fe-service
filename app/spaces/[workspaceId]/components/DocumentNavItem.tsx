"use client";

import { FileText } from "lucide-react";
import type { Document } from "@/types/type-documents";

interface DocumentNavItemProps {
  document: Document;
  isActive: boolean;
  onClick: () => void;
}

export function DocumentNavItem({ document, isActive, onClick }: DocumentNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{document.name || "Untitled"}</span>
    </button>
  );
}
