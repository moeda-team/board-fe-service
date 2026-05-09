"use client";

import type { Task } from "@/types/type-tasks";

interface ListViewProps {
  tasks: Task[];
}

export function ListView({ tasks }: ListViewProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-medium text-muted-foreground">List View</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet.</p>
      ) : (
        <div className="divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between py-3">
              <span className="text-sm">{task.title || "Untitled task"}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground capitalize">
                {task.priority || "No priority"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
