"use client";

import { useState, useEffect, useRef } from "react";
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
  DropResult,
  type DragUpdate
} from "@hello-pangea/dnd";

interface BoardViewProps {
  columns: Column[];
  tasks: Task[];
  onCreateColumn: (name: string) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onReorderColumns?: (newColumns: { id: string; position: number }[]) => void;
  onCreateTask: (columnId: string) => void;
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
  const [contextMenu, setContextMenu] = useState<{
    columnId: string;
    x: number;
    y: number;
  } | null>(null);
  const boardScrollRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const scrollTargetRef = useRef(0);

  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [contextMenu]);

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

  const handleDragUpdate = (update: DragUpdate) => {
    const destinationId = update.destination?.droppableId;
    if (destinationId && localColumns.some((c) => c.id === destinationId)) {
      setDragOverColumnId(destinationId);
    } else {
      setDragOverColumnId(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    setDragOverColumnId(null);
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
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <div
        className="h-full overflow-auto pb-2"
        ref={boardScrollRef}
        onWheel={(e) => {
          const target = e.target as HTMLElement;
          const scrollYEl = target.closest(
            "[data-scroll-y]"
          ) as HTMLElement | null;
          if (scrollYEl) {
            const atTop = scrollYEl.scrollTop === 0;
            const atBottom =
              scrollYEl.scrollTop + scrollYEl.clientHeight >=
              scrollYEl.scrollHeight - 1;
            const scrollingUp = e.deltaY < 0;
            const scrollingDown = e.deltaY > 0;
            if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) return;
          }
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            const container = boardScrollRef.current;
            if (!container) return;
            scrollTargetRef.current += e.deltaY * 1.5;
            if (scrollAnimRef.current) return;
            const animate = () => {
              const current = container.scrollLeft;
              const diff = scrollTargetRef.current - current;
              if (Math.abs(diff) < 0.5) {
                container.scrollLeft = scrollTargetRef.current;
                scrollAnimRef.current = null;
                return;
              }
              container.scrollLeft += diff * 0.15;
              scrollAnimRef.current = requestAnimationFrame(animate);
            };
            scrollAnimRef.current = requestAnimationFrame(animate);
          }
        }}
      >
        <div className="flex h-full gap-4">
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div
                className="flex h-full gap-4"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {localColumns.map((col, index) => {
                  const colTasks = tasksByColumn[col.id] || [];

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
                          } ${
                            dragOverColumnId === col.id
                              ? "ring-2 ring-primary/30 border-primary/30"
                              : ""
                          } transition-transform`}
                          style={provided.draggableProps.style}
                        >
                          {/* Column Header */}
                          <div
                            className="flex items-center justify-between p-3"
                            {...provided.dragHandleProps}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setContextMenu({
                                columnId: col.id,
                                x: e.clientX,
                                y: e.clientY
                              });
                            }}
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
                                  onClick={() => onCreateTask(col.id)}
                                >
                                  <Plus className="mr-2 h-3.5 w-3.5" />
                                  Add Task
                                </DropdownMenuItem>
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
                                data-scroll-y
                                className={`relative flex flex-col gap-2 px-3 pb-2 min-h-2.5 flex-1 max-h-[75vh] overflow-y-auto transition-colors ${
                                  snapshot.isDraggingOver
                                    ? "bg-primary/5 rounded-lg border-2 border-dashed border-primary/40"
                                    : "border-2 border-transparent"
                                }`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {snapshot.isDraggingOver && (
                                  <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-2">
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                                      Drop here
                                    </span>
                                  </div>
                                )}
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
                                        <TaskCard
                                          task={task}
                                          onClick={() =>
                                            onTaskClick && onTaskClick(task.id)
                                          }
                                        />
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-1 text-muted-foreground hover:text-foreground"
                              onClick={() => onCreateTask(col.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Task
                            </Button>
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
      </div>

      {/* Custom context menu for columns */}
      {contextMenu && (
        <div
          className="fixed z-50 min-w-32 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              onCreateTask(contextMenu.columnId);
              setContextMenu(null);
            }}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Add Task
          </button>
          <button
            className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              const name = window.prompt(
                "Rename column",
                localColumns.find((c) => c.id === contextMenu.columnId)?.name ||
                  ""
              );
              if (name) onUpdateColumn(contextMenu.columnId, name);
              setContextMenu(null);
            }}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Rename
          </button>
          <button
            className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive outline-hidden select-none hover:bg-accent hover:text-accent-foreground"
            onClick={() => {
              const colName = localColumns.find(
                (c) => c.id === contextMenu.columnId
              )?.name;
              if (colName && window.confirm(`Delete column "${colName}"?`)) {
                onDeleteColumn(contextMenu.columnId);
              }
              setContextMenu(null);
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </DragDropContext>
  );
}
