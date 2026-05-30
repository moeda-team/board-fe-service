"use client";

import { MessageSquare, Paperclip as Papanclip, Clock } from "lucide-react";
import type { Task } from "@/types/type-tasks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700"
};

const tagColors = [
  "bg-blue-50 text-blue-700",
  "bg-purple-50 text-purple-700",
  "bg-pink-50 text-pink-700",
  "bg-emerald-50 text-emerald-700"
];

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = (task.priority || "").toLowerCase();
  const priorityClass = priorityColors[priority] || "bg-gray-100 text-gray-600";
  const assignees = task.assigneeIds || [];
  const subtaskCount = task.subtaskCount || 0;
  const completedSubtasks = task.completedSubtaskCount || 0;
  const tags = task.tags || [];
  const summary = task.summary || {};
  const totalComments = summary.totalComments || 0;
  const totalAttachments = summary.totalAttachments || 0;
  const remainingTime = summary.remainingTime;

  return (
    <div
      className="group flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => {
            const tagText =
              typeof tag === "string"
                ? tag
                : (tag as { name?: string; tag?: { name?: string } | string })
                    .name ||
                  (typeof (tag as { tag?: { name?: string } | string }).tag ===
                  "string"
                    ? (tag as { tag: string }).tag
                    : (tag as { tag?: { name?: string } }).tag?.name) ||
                  "";
            return (
              <span
                key={i}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${tagColors[i % tagColors.length]}`}
              >
                {tagText}
              </span>
            );
          })}
        </div>
      )}

      <h4 className="text-sm font-medium leading-snug wrap-break-word">
        {task.title || "Untitled"}
      </h4>

      {task.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityClass}`}
        >
          {task.priority || "No priority"}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {assignees.length > 0 ? (
            <div className="flex -space-x-1.5">
              {assignees.slice(0, 3).map((id, i) => (
                <Avatar key={id} className="h-5 w-5 border border-background">
                  <AvatarFallback className="bg-brand-soft-blue text-brand-blue text-[9px] font-medium">
                    {String.fromCharCode(65 + (i % 26))}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignees.length > 3 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-background bg-muted text-[9px] font-medium text-muted-foreground">
                  +{assignees.length - 3}
                </span>
              )}
            </div>
          ) : null}

          {subtaskCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <div className="h-1.5 w-8 overflow-hidden rounded-full bg-muted-foreground/20">
                <div
                  className="h-full rounded-full bg-brand-blue"
                  style={{
                    width: `${subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="font-medium tabular-nums">
                {completedSubtasks}/{subtaskCount}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {totalComments > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {totalComments}
            </span>
          )}
          {totalAttachments > 0 && (
            <span className="flex items-center gap-0.5">
              <Papanclip className="h-3 w-3" />
              {totalAttachments}
            </span>
          )}
          {remainingTime && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {remainingTime.days}d {remainingTime.hours}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
