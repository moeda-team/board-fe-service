"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { format, isPast } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { Task } from "@/types/type-tasks";

const columnHelper = createColumnHelper<Task>();

const priorityConfig: Record<string, { label: string; variant: "destructive" | "default" | "secondary" | "outline" | "ghost" | "link" }> = {
  URGENT: { label: "Urgent", variant: "destructive" },
  HIGH: { label: "High", variant: "default" },
  MEDIUM: { label: "Medium", variant: "secondary" },
  LOW: { label: "Low", variant: "outline" }
};

export const columns = [
  columnHelper.accessor("title", {
    header: "Task",
    cell: (info) => (
      <span className="font-medium text-foreground">
        {info.getValue() || "Untitled"}
      </span>
    )
  }),

  columnHelper.accessor("priority", {
    header: "Priority",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return <span className="text-muted-foreground text-xs">&mdash;</span>;
      const config = priorityConfig[value] ?? { label: value, variant: "outline" as const };
      return (
        <Badge variant={config.variant} className="text-[11px]">
          {config.label}
        </Badge>
      );
    }
  }),

  columnHelper.accessor("assignees", {
    header: "Assignees",
    cell: (info) => {
      const assignees = info.getValue();
      if (!assignees || assignees.length === 0) {
        return <span className="text-muted-foreground text-xs">&mdash;</span>;
      }
      return (
        <AvatarGroup>
          {assignees.slice(0, 4).map((a) => (
            <Tooltip key={a.userId}>
              <TooltipTrigger>
                <Avatar size="sm">
                  <AvatarImage
                    src={a.user?.avatarUrl ?? undefined}
                    alt={a.user?.fullName ?? a.user?.username ?? ""}
                  />
                  <AvatarFallback>
                    {(a.user?.fullName || a.user?.username || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="top">
                {a.user?.fullName || a.user?.username || "Unknown"}
              </TooltipContent>
            </Tooltip>
          ))}
          {assignees.length > 4 && (
            <div className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-background">
              +{assignees.length - 4}
            </div>
          )}
        </AvatarGroup>
      );
    }
  }),

  columnHelper.accessor("dueDate", {
    header: "Due Date",
    cell: (info) => {
      const dueDate = info.getValue();
      const finishDate = info.row.original.finishDate;
      if (!dueDate) return <span className="text-muted-foreground text-xs">&mdash;</span>;

      const date = new Date(dueDate);
      const formatted = format(date, "dd MMM yyyy");
      const isOverdue = !finishDate && isPast(date);

      return (
        <span
          className={
            isOverdue
              ? "text-xs font-medium text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {formatted}
        </span>
      );
    }
  }),

  columnHelper.accessor("tags", {
    header: "Tags",
    cell: (info) => {
      const tags = info.getValue();
      if (!tags || tags.length === 0) {
        return <span className="text-muted-foreground text-xs">&mdash;</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((t: any, idx: number) => {
            const tagData = t.tag || t;
            return (
            <Badge
              key={tagData.id || idx}
              variant="outline"
              className="text-[10px] border-0"
              style={{
                backgroundColor: tagData.color ? `${tagData.color}20` : undefined,
                color: tagData.color || undefined
              }}
            >
              {tagData.name || tagData.label || String(tagData)}
            </Badge>
            );
          })}
        </div>
      );
    }
  })
];
