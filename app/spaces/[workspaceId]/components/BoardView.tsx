"use client";

import { useState, useEffect } from "react";
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

interface BoardViewProps {
  columns: Column[];
  tasks: Task[];
  onCreateColumn: (name: string) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onReorderColumns?: (newColumns: { id: string; position: number }[]) => void;
  onCreateTask: (columnId: string, title: string) => void;
  onMoveTask: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    position?: number
  ) => void;
  onTaskClick?: (taskId: string) => void;
}

export function BoardView({
  columns,
  tasks,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
  onCreateTask,
  onMoveTask,
  onTaskClick
}: BoardViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [taskInputs, setTaskInputs] = useState<
    Record<string, { value: string; active: boolean }>
  >({});

  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const tasksByColumn = localColumns.reduce<Record<string, Task[]>>(
    (acc, col) => {
      // Sort tasks logically if needed, for now just filter by column
      acc[col.id] = localTasks.filter((t) => t.columnId === col.id);
      return acc;
    },
    {}
  );

  const getColumnColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("backlog")) return "bg-slate-500";
    if (lowerName.includes("to do") || lowerName.includes("todo"))
      return "bg-blue-500";
    if (lowerName.includes("progress")) return "bg-amber-500";
    if (lowerName.includes("review")) return "bg-purple-500";
    if (lowerName.includes("complete") || lowerName.includes("done"))
      return "bg-green-500";
    return "bg-slate-300";
  };

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onCreateColumn(newColumnName.trim());
      setNewColumnName("");
      setAddingColumn(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Column dragging logic
    if (type === "column") {
      const newCols = Array.from(localColumns);
      const [removed] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, removed);

      setLocalColumns(newCols);

      if (onReorderColumns) {
        onReorderColumns(
          newCols.map((col, idx) => ({ id: col.id, position: idx }))
        );
      }
      return;
    }

    // Task dragging logic
    if (source.droppableId !== destination.droppableId) {
      const newTasks = [...localTasks];
      const taskIndex = newTasks.findIndex((t) => t.id === draggableId);

      if (taskIndex > -1) {
        newTasks[taskIndex] = {
          ...newTasks[taskIndex],
          columnId: destination.droppableId
        };
        setLocalTasks(newTasks);

        // Fire API/socket mutation
        onMoveTask(
          draggableId,
          source.droppableId,
          destination.droppableId,
          destination.index
        );
      }
    }
    // If we wanted to handle reordering within the same column we would do it here.
    // The current UI shows it but the API might not support it yet. Assuming we just do optimistic UI for now.
    else {
      // Same column reorder optimistic UI (will snap back if API doesn't support, but feels good instantly)
      const colTasks = [...(tasksByColumn[source.droppableId] || [])];
      const taskIndex = colTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex > -1) {
        const [removed] = colTasks.splice(source.index, 1);
        colTasks.splice(destination.index, 0, removed);
        // Updating localTasks based on new column order
        const otherTasks = localTasks.filter(
          (t) => t.columnId !== source.droppableId
        );
        setLocalTasks([...otherTasks, ...colTasks]);

        // Fire API/socket mutation for reordering within the same column
        onMoveTask(
          draggableId,
          source.droppableId,
          destination.droppableId,
          destination.index
        );
      }
    }
  };

  if (!isMounted) {
    return null; // Prevents hydration mismatch with dnd
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-2">
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div
              className="flex h-full gap-4"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {localColumns.map((col, index) => {
                const colTasks = tasksByColumn[col.id] || [];
                const inputState = taskInputs[col.id] || {
                  value: "",
                  active: false
                };

                return (
                  <Draggable key={col.id} draggableId={col.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex w-72 shrink-0 flex-col rounded-xl border bg-card/50 shadow-sm ${
                          snapshot.isDragging
                            ? "shadow-2xl scale-[1.02] opacity-90 z-40 border-primary"
                            : ""
                        } transition-transform`}
                        style={provided.draggableProps.style}
                      >
                        {/* Column Header */}
                        <div
                          className="flex items-center justify-between p-3"
                          {...provided.dragHandleProps}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${getColumnColor(col.name || "")}`}
                            />
                            <span className="text-sm font-semibold cursor-grab active:cursor-grabbing">
                              {col.name || "Untitled"}
                            </span>
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted/60 px-1.5 text-xs font-medium text-muted-foreground">
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
                                  if (
                                    window.confirm(
                                      `Delete column "${col.name}"?`
                                    )
                                  ) {
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

                        {/* Tasks Droppable Area */}
                        <Droppable droppableId={col.id} type="task">
                          {(provided, snapshot) => (
                            <div
                              className={`flex flex-col gap-2 px-3 pb-2 min-h-2.5 flex-1 ${
                                snapshot.isDraggingOver
                                  ? "bg-muted/70 rounded-md"
                                  : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {colTasks.map((task, index) => (
                                <Draggable
                                  key={task.id}
                                  draggableId={task.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`relative group ${snapshot.isDragging ? "z-50 opacity-90 shadow-xl scale-105" : ""} transition-transform`}
                                      style={provided.draggableProps.style}
                                    >
                                      <TaskCard task={task} onClick={() => onTaskClick && onTaskClick(task.id)} />
                                      {/* Quick move menu */}
                                      {!snapshot.isDragging && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-accent">
                                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent
                                            align="end"
                                            className="w-40"
                                          >
                                            <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
                                              Move to
                                            </span>
                                            {localColumns
                                              .filter((c) => c.id !== col.id)
                                              .map((targetCol) => (
                                                <DropdownMenuItem
                                                  key={targetCol.id}
                                                  onClick={() =>
                                                    onMoveTask(
                                                      task.id,
                                                      col.id,
                                                      targetCol.id,
                                                      0
                                                    )
                                                  }
                                                >
                                                  {targetCol.name}
                                                </DropdownMenuItem>
                                              ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>

                        {/* Add task */}
                        <div className="px-3 pb-3 mt-auto">
                          {inputState.active ? (
                            <div className="flex flex-col gap-2">
                              <Input
                                autoFocus
                                placeholder="Task title..."
                                value={inputState.value}
                                onChange={(e) =>
                                  setTaskInputs((prev) => ({
                                    ...prev,
                                    [col.id]: {
                                      ...inputState,
                                      value: e.target.value
                                    }
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    inputState.value.trim()
                                  ) {
                                    onCreateTask(
                                      col.id,
                                      inputState.value.trim()
                                    );
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
                                      onCreateTask(
                                        col.id,
                                        inputState.value.trim()
                                      );
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
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

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
    </DragDropContext>
  );
}
