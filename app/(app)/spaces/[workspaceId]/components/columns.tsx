"use client";

import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { format, isPast } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import type { Task } from "@/types/type-tasks";
import type { Column } from "@/types/type-kanban-columns";
import { MoreHorizontal, List, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const columnHelper = createColumnHelper<Task>();

const priorityConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  URGENT: { label: "Critical", color: "#DC2626", bgColor: "#FEE2E2" },
  HIGH: { label: "High", color: "#DC2626", bgColor: "#FEE2E2" },
  MEDIUM: { label: "Medium", color: "#EA580C", bgColor: "#FFF7ED" },
  LOW: { label: "Low", color: "#2563EB", bgColor: "#EFF6FF" }
};

const statusConfig: Record<string, { color: string; bgColor: string }> = {
  backlog: { color: "#6B7280", bgColor: "#F3F4F6" },
  "to do": { color: "#2563EB", bgColor: "#EFF6FF" },
  "in progress": { color: "#D97706", bgColor: "#FFFBEB" },
  review: { color: "#7C3AED", bgColor: "#F5F3FF" },
  "in review": { color: "#7C3AED", bgColor: "#F5F3FF" },
  completed: { color: "#16A34A", bgColor: "#F0FDF4" },
  blocked: { color: "#DC2626", bgColor: "#FEF2F2" }
};

function getStatusStyle(columnName: string): {
  color: string;
  bgColor: string;
} {
  const key = columnName.toLowerCase();
  return statusConfig[key] || { color: "#6B7280", bgColor: "#F3F4F6" };
}

export function buildColumns(kanbanColumns: Column[]): ColumnDef<Task, any>[] {
  const columnMap = new Map<string, Column>();
  kanbanColumns.forEach((c) => columnMap.set(c.id, c));

  return [
    // Checkbox
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 40,
      enableSorting: false
    },
    // Task
    columnHelper.accessor("title", {
      header: "Task",
      cell: (info) => (
        <span className="inline-flex items-center gap-2 font-medium text-foreground text-sm">
          <List className="h-3.5 w-3.5 text-gray-400" />
          {info.getValue() || "Untitled"}
        </span>
      )
    }),
    // Status (derived from columnId)
    columnHelper.accessor("columnId", {
      header: "Status",
      cell: (info) => {
        const colId = info.getValue();
        const col = colId ? columnMap.get(colId) : undefined;
        const name = col?.name || "Unknown";
        const style = getStatusStyle(name);
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-700">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: style.color }}
            />
            {name}
          </span>
        );
      }
    }),
    // Priority
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const value = info.getValue();
        if (!value)
          return <span className="text-muted-foreground text-xs">&mdash;</span>;
        const config = priorityConfig[value] ?? {
          label: value,
          color: "#6B7280",
          bgColor: "#F3F4F6"
        };
        return (
          <span className="inline-flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            {config.label}
          </span>
        );
      }
    }),
    // Assignees
    columnHelper.accessor("assignees", {
      header: "Assignee",
      cell: (info) => {
        const assignees = info.getValue();
        if (!assignees || assignees.length === 0) {
          return <span className="text-muted-foreground text-xs">&mdash;</span>;
        }
        return (
          <AvatarGroup>
            {assignees.slice(0, 2).map(
              (a: {
                userId: string;
                user?: {
                  avatarUrl?: string | null;
                  fullName?: string | null;
                  username?: string | null;
                };
              }) => (
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
              )
            )}
            {assignees.length > 2 && (
              <div className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-background">
                +{assignees.length - 2}
              </div>
            )}
          </AvatarGroup>
        );
      }
    }),
    // Subtask count
    {
      id: "subtask",
      header: "Subtask",
      cell: ({ row }: { row: any }) => {
        const task = row.original as Task;
        const total = task.subtaskCount ?? 0;
        const done = task.completedSubtaskCount ?? 0;
        if (total === 0)
          return <span className="text-muted-foreground text-xs">&mdash;</span>;
        return (
          <span className="text-xs text-muted-foreground">
            {done}/{total}
          </span>
        );
      },
      size: 80
    },
    // Progress bar
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }: { row: any }) => {
        const task = row.original as Task;
        const total = task.subtaskCount ?? 0;
        const done = task.completedSubtaskCount ?? 0;
        if (total === 0)
          return <span className="text-muted-foreground text-xs">&mdash;</span>;
        const pct = Math.round((done / total) * 100);
        const col = task.columnId ? columnMap.get(task.columnId) : undefined;
        const statusName = (col?.name || "").toLowerCase();
        let barColor = "#2563EB";
        if (pct === 0) barColor = "#E5E7EB";
        else if (pct === 100) barColor = "#16A34A";
        else if (statusName.includes("in progress")) barColor = "#EA580C";
        else if (statusName.includes("completed")) barColor = "#16A34A";
        return (
          <div className="flex items-center gap-3 min-w-30">
            <div className="h-1.5 flex-1 rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
          </div>
        );
      },
      size: 160
    },
    // Due Date
    columnHelper.accessor("dueDate", {
      header: "Due Date",
      cell: (info) => {
        const dueDate = info.getValue();
        const finishDate = info.row.original.finishDate;
        if (!dueDate)
          return <span className="text-muted-foreground text-xs">&mdash;</span>;
        const date = new Date(dueDate);
        const formatted = format(date, "dd MMM yyyy");
        const isOverdue = !finishDate && isPast(date);
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${isOverdue ? "font-medium text-destructive" : "text-gray-500"}`}
          >
            <Calendar className="h-3 w-3 text-gray-400" />
            {formatted}
          </span>
        );
      }
    }),
    // Tags
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
                <span
                  key={tagData.id || idx}
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: tagData.color
                      ? `${tagData.color}20`
                      : "#F3F4F6",
                    color: tagData.color || "#6B7280"
                  }}
                >
                  {tagData.name || tagData.label || String(tagData)}
                </span>
              );
            })}
          </div>
        );
      }
    }),
    // Actions
    {
      id: "actions",
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Button>
      ),
      cell: () => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      ),
      size: 40,
      enableSorting: false
    }
  ];
}

// Keep legacy export for backward compat
export const columns = buildColumns([]);
