"use client";

import type { Task } from "@/types/type-tasks";

interface GanttViewProps {
  tasks: Task[];
}

export function GanttView({ tasks }: GanttViewProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground">Gantt Chart</h3>
      <p className="text-sm text-muted-foreground">
        Gantt chart view is coming soon. {tasks.length} tasks available.
      </p>
    </div>
  );
}
