"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MoreHorizontal,
  Settings2,
  Trash2,
  Palette,
  Pencil
} from "lucide-react";
import { EditColumnDialog } from "./EditColumnDialog";
import { CreateColumnDialog } from "./CreateColumnDialog";
import type { Column } from "@/types/type-kanban-columns";
import type { Task } from "@/types/type-tasks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "./TaskCard";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  type DragUpdate
} from "@hello-pangea/dnd";

interface ColumnFormValues {
  name: string;
  color: string;
  isDone: boolean;
}

interface CreateColumnPayload extends ColumnFormValues {
  position: number;
}

interface BoardViewProps {
  columns: Column[];
  tasks: Task[];
  onCreateColumn: (payload: CreateColumnPayload) => void;
  onUpdateColumn: (columnId: string, values: ColumnFormValues) => void;
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
  onDeleteTask?: (taskId: string) => void;
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
  onTaskClick,
  onDeleteTask
}: BoardViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const boardScrollRef = useRef<HTMLDivElement>(null);

  const [localColumns, setLocalColumns] = useState<Column[]>(columns);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

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
      <div className="h-full overflow-auto pb-2" ref={boardScrollRef}>
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
                          className={`flex w-72 shrink-0 flex-col rounded-xl border border-border/60 bg-card shadow-sm max-h-[calc(100vh-200px)] ${
                            snapshot.isDragging
                              ? "shadow-2xl scale-[1.02] opacity-90 z-40 border-primary"
                              : ""
                          } ${
                            dragOverColumnId === col.id
                              ? "ring-2 ring-primary/30 border-primary/30"
                              : ""
                          } transition-transform`}
                          style={{
                            ...provided.draggableProps.style,
                            background: `linear-gradient(180deg, ${col.color || "#94a3b8"}08 0%, ${col.color || "#94a3b8"}04 100%)`
                          }}
                        >
                          {/* Column Header */}
                          <div
                            className="flex items-center justify-between p-3"
                            {...provided.dragHandleProps}
                            onContextMenu={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <div
                                      className="h-2.5 w-2.5 rounded-full cursor-pointer hover:scale-125 transition-transform"
                                      style={{
                                        backgroundColor: col.color || "#94a3b8"
                                      }}
                                      title="Change color"
                                    />
                                  }
                                />
                                <DropdownMenuContent
                                  align="start"
                                  className="p-2"
                                >
                                  <div className="grid grid-cols-4 gap-1">
                                    {[
                                      { color: "#94a3b8", label: "Gray" },
                                      { color: "#ef4444", label: "Red" },
                                      { color: "#f97316", label: "Orange" },
                                      { color: "#eab308", label: "Yellow" },
                                      { color: "#22c55e", label: "Green" },
                                      { color: "#14b8a6", label: "Teal" },
                                      { color: "#3b82f6", label: "Blue" },
                                      { color: "#8b5cf6", label: "Purple" },
                                      { color: "#ec4899", label: "Pink" },
                                      { color: "#6366f1", label: "Indigo" },
                                      { color: "#06b6d4", label: "Cyan" },
                                      { color: "#84cc16", label: "Lime" }
                                    ].map(({ color, label }) => (
                                      <DropdownMenuItem
                                        key={color}
                                        onClick={() =>
                                          onUpdateColumn(col.id, {
                                            name: col.name ?? "Untitled",
                                            isDone: col.isDone ?? false,
                                            color
                                          })
                                        }
                                        className="p-1 justify-center"
                                      >
                                        <div
                                          className="h-5 w-5 rounded-full border border-border/50"
                                          style={{ backgroundColor: color }}
                                          title={label}
                                        />
                                      </DropdownMenuItem>
                                    ))}
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                                    if (name)
                                      onUpdateColumn(col.id, {
                                        name,
                                        isDone: col.isDone ?? false,
                                        color: col.color || "#94a3b8"
                                      });
                                  }}
                                >
                                  <Pencil className="mr-2 h-3.5 w-3.5" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Palette className="mr-2 h-3.5 w-3.5" />
                                    Color
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuPortal>
                                    <DropdownMenuSubContent className="p-2">
                                      <div className="grid grid-cols-4 gap-1">
                                        {[
                                          { color: "#94a3b8", label: "Gray" },
                                          { color: "#ef4444", label: "Red" },
                                          { color: "#f97316", label: "Orange" },
                                          { color: "#eab308", label: "Yellow" },
                                          { color: "#22c55e", label: "Green" },
                                          { color: "#14b8a6", label: "Teal" },
                                          { color: "#3b82f6", label: "Blue" },
                                          { color: "#8b5cf6", label: "Purple" },
                                          { color: "#ec4899", label: "Pink" },
                                          { color: "#6366f1", label: "Indigo" },
                                          { color: "#06b6d4", label: "Cyan" },
                                          { color: "#84cc16", label: "Lime" }
                                        ].map(({ color, label }) => (
                                          <DropdownMenuItem
                                            key={color}
                                            onClick={() =>
                                              onUpdateColumn(col.id, {
                                                name: col.name ?? "Untitled",
                                                isDone: col.isDone ?? false,
                                                color
                                              })
                                            }
                                            className="p-1 justify-center"
                                          >
                                            <div
                                              className="h-5 w-5 rounded-full border border-border/50"
                                              style={{ backgroundColor: color }}
                                              title={label}
                                            />
                                          </DropdownMenuItem>
                                        ))}
                                      </div>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingColumn(col);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Settings2 className="mr-2 h-3.5 w-3.5" />
                                  Edit Column
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setConfirmDialog({
                                      open: true,
                                      title: "Delete Column",
                                      description: `Are you sure you want to delete "${col.name}"? This action cannot be undone.`,
                                      onConfirm: () => onDeleteColumn(col.id)
                                    });
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
                                className={`relative flex flex-col gap-2 px-3 pb-2 min-h-2.5 flex-1 overflow-y-auto transition-colors ${
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
                                              {onDeleteTask && (
                                                <DropdownMenuItem
                                                  variant="destructive"
                                                  onClick={() => {
                                                    setConfirmDialog({
                                                      open: true,
                                                      title: "Delete Task",
                                                      description: `Are you sure you want to delete this task? This action cannot be undone.`,
                                                      onConfirm: () =>
                                                        onDeleteTask(task.id)
                                                    });
                                                  }}
                                                >
                                                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                  Delete
                                                </DropdownMenuItem>
                                              )}
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
            <Button
              variant="ghost"
              className="h-10 justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Column
            </Button>
          </div>
        </div>
      </div>

      <CreateColumnDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        position={columns.length}
        onSubmit={(values) => onCreateColumn(values)}
      />
      <EditColumnDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        columnId={editingColumn?.id || ""}
        defaultValues={{
          name: editingColumn?.name || "",
          color: editingColumn?.color,
          isDone: editingColumn?.isDone
        }}
        onSubmit={(columnId, values) => {
          onUpdateColumn(columnId, values);
          setEditingColumn(null);
        }}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open: boolean) =>
          setConfirmDialog((prev) => ({ ...prev, open }))
        }
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel="Delete"
        onConfirm={confirmDialog.onConfirm}
      />
    </DragDropContext>
  );
}
