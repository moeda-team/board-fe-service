"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Column } from "@/types/type-kanban-columns";
import type { Task } from "@/types/type-tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "./TaskCard";

interface BoardViewProps {
  columns: Column[];
  tasks: Task[];
  onCreateColumn: (name: string) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onCreateTask: (columnId: string, title: string) => void;
  onMoveTask: (taskId: string, columnId: string) => void;
}

export function BoardView({
  columns,
  tasks,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onCreateTask,
  onMoveTask
}: BoardViewProps) {
  const [newColumnName, setNewColumnName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [taskInputs, setTaskInputs] = useState<
    Record<string, { value: string; active: boolean }>
  >({});

  const tasksByColumn = columns.reduce<Record<string, Task[]>>((acc, col) => {
    acc[col.id] = tasks.filter((t) => t.columnId === col.id);
    return acc;
  }, {});

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onCreateColumn(newColumnName.trim());
      setNewColumnName("");
      setAddingColumn(false);
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {columns.map((col) => {
        const colTasks = tasksByColumn[col.id] || [];
        const inputState = taskInputs[col.id] || { value: "", active: false };

        return (
          <div
            key={col.id}
            className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {col.name || "Untitled"}
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                  {colTasks.length}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => {
                      const name = window.prompt(
                        "Rename column",
                        col.name || ""
                      );
                      if (name) onUpdateColumn(col.id, name);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm(`Delete column "${col.name}"?`)) {
                        onDeleteColumn(col.id);
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2 px-3 pb-2">
              {colTasks.map((task) => (
                <div key={task.id} className="relative group">
                  <TaskCard task={task} />
                  {/* Quick move menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-accent">
                      <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        Move to
                      </span>
                      {columns
                        .filter((c) => c.id !== col.id)
                        .map((targetCol) => (
                          <DropdownMenuItem
                            key={targetCol.id}
                            onClick={() => onMoveTask(task.id, targetCol.id)}
                          >
                            {targetCol.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            {/* Add task */}
            <div className="px-3 pb-3">
              {inputState.active ? (
                <div className="flex flex-col gap-2">
                  <Input
                    autoFocus
                    placeholder="Task title..."
                    value={inputState.value}
                    onChange={(e) =>
                      setTaskInputs((prev) => ({
                        ...prev,
                        [col.id]: { ...inputState, value: e.target.value }
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inputState.value.trim()) {
                        onCreateTask(col.id, inputState.value.trim());
                        setTaskInputs((prev) => ({
                          ...prev,
                          [col.id]: { value: "", active: false }
                        }));
                      }
                      if (e.key === "Escape") {
                        setTaskInputs((prev) => ({
                          ...prev,
                          [col.id]: { value: "", active: false }
                        }));
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (inputState.value.trim()) {
                          onCreateTask(col.id, inputState.value.trim());
                          setTaskInputs((prev) => ({
                            ...prev,
                            [col.id]: { value: "", active: false }
                          }));
                        }
                      }}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={() =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          [col.id]: { value: "", active: false }
                        }))
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setTaskInputs((prev) => ({
                      ...prev,
                      [col.id]: { value: "", active: true }
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Column */}
      <div className="flex w-72 shrink-0 flex-col">
        {addingColumn ? (
          <div className="rounded-lg bg-muted/50 p-3">
            <Input
              autoFocus
              placeholder="Column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddColumn();
                if (e.key === "Escape") {
                  setAddingColumn(false);
                  setNewColumnName("");
                }
              }}
              className="mb-2 h-8 text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleAddColumn}
              >
                Add Column
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  setAddingColumn(false);
                  setNewColumnName("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-10 justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setAddingColumn(true)}
          >
            <Plus className="h-4 w-4" />
            Add Column
          </Button>
        )}
      </div>
    </div>
  );
}
