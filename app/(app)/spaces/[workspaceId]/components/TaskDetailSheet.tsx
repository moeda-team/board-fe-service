"use client";

import { useState, useMemo, useEffect } from "react";

import { format } from "date-fns";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

import {
  useTaskDetail,
  useUpdateTask,
  taskDetailQueryKey
} from "@/hooks/api/useTasks";

import {
  useTaskSubtasks,
  useCreateSubtask,
  useUpdateSubtask
} from "@/hooks/api/useTaskSubtasks";

import {
  useTaskAttachments,
  useUploadAttachment,
  useDeleteAttachment
} from "@/hooks/api/useTaskAttachments";

import { useTaskActivities } from "@/hooks/api/useTaskActivities";

import {
  useCreateTaskComment,
  useDeleteTaskComment
} from "@/hooks/api/useTaskComments";

import { useAuthMe } from "@/hooks/api/useAuth";

import {
  Plus,
  Paperclip as Papanclip,
  CheckCircle2,
  Circle,
  Clock,
  Tag,
  X,
  Send,
  Trash2,
  Loader2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Edit2,
  Save
} from "lucide-react";

import type { TaskActivity } from "@/types/type-tasks";
import type { Column } from "@/types/type-kanban-columns";
import type { Member, Tag as TagType } from "@/types/api";
import { useQueryClient } from "@tanstack/react-query";
import { useTags } from "@/hooks/api/useTags";

interface TaskDetailSheetProps {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: Column[];
  members: Member[];
}

export function TaskDetailSheet({
  tenantId,
  workspaceId,
  boardId,
  taskId,
  open,
  onOpenChange,
  columns,
  members
}: TaskDetailSheetProps) {
  const queryClient = useQueryClient();
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM"
  );
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined);
  const [editColumnId, setEditColumnId] = useState<string>("");
  const [editAssigneeIds, setEditAssigneeIds] = useState<string[]>([]);
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const { data: authMe } = useAuthMe();

  const currentUser = authMe?.user;

  const { data: task, isLoading: isLoadingTask } = useTaskDetail(
    tenantId,

    workspaceId,

    boardId,

    taskId || ""
  );

  const { data: subtasks = [], isLoading: isLoadingSubtasks } = useTaskSubtasks(
    tenantId,

    workspaceId,

    boardId,

    taskId || ""
  );

  const { data: attachments = [] } = useTaskAttachments(
    tenantId,

    workspaceId,

    boardId,

    taskId || ""
  );

  const { data: activities = [], isLoading: isLoadingActivities } =
    useTaskActivities(tenantId, workspaceId, boardId, taskId || "");

  // Activity feed combines comments and task activities

  // Deduplicate members by normalized name to prevent showing same person multiple times
  const uniqueMembers = useMemo(() => {
    const seen = new Set<string>();
    return members.filter((m) => {
      // Normalize name: lowercase, remove extra spaces
      const nameKey = (m.fullName || m.username || m.email || m.id)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
      if (seen.has(nameKey)) return false;
      seen.add(nameKey);
      return true;
    });
  }, [members]);

  const { mutate: createSubtask } = useCreateSubtask();

  const { mutate: updateSubtask } = useUpdateSubtask();

  const { mutate: uploadAttachment } = useUploadAttachment();

  const { mutate: deleteAttachment } = useDeleteAttachment();

  const { mutate: createComment } = useCreateTaskComment();

  const { mutate: deleteComment } = useDeleteTaskComment();

  const handleSubmitComment = () => {
    if (!commentContent.trim() || !taskId) return;

    createComment(
      {
        tenantId,

        workspaceId,

        boardId,

        taskId,

        dto: { content: commentContent.trim() }
      },

      {
        onSuccess: () => setCommentContent("")
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (!taskId) return;

    deleteComment({ tenantId, workspaceId, boardId, taskId, commentId });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && taskId) {
      uploadAttachment({
        tenantId,

        workspaceId,

        boardId,

        taskId,

        file
      });

      e.target.value = ""; // Reset input
    }
  };

  const handleAddSubtask = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;

    if (!newSubtaskTitle.trim() || !taskId) return;

    createSubtask({
      tenantId,

      workspaceId,

      boardId,

      taskId,

      dto: { title: newSubtaskTitle.trim() }
    });

    setNewSubtaskTitle("");
  };

  const handleToggleSubtask = (subtaskId: string, currentIsDone: boolean) => {
    if (!taskId) return;

    updateSubtask({
      tenantId,

      workspaceId,

      boardId,

      taskId,

      subtaskId,

      dto: { isDone: !currentIsDone }
    });
  };

  const completedSubtasks = subtasks.filter((st) => st.isDone).length;

  const progressPct =
    subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  // Extract assignees correctly based on the API response structure

  const assigneesList = (task?.assignees || []).map((a: any) => a.user || a);

  const tagList = (task?.tags || []).map((t: any) => t.tag || t);

  // Group activities by date

  const groupedActivities = useMemo(() => {
    const groups: Record<string, TaskActivity[]> = {};

    if (!activities.length) return groups;

    const today = new Date();

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    activities.forEach((activity) => {
      const date = new Date(activity.createdAt);

      const dateKey = format(date, "yyyy-MM-dd");

      const todayKey = format(today, "yyyy-MM-dd");

      const yesterdayKey = format(yesterday, "yyyy-MM-dd");

      let label: string;

      if (dateKey === todayKey) {
        label = "Today";
      } else if (dateKey === yesterdayKey) {
        label = "Yesterday";
      } else {
        label = format(date, "d MMMM yyyy");
      }

      if (!groups[label]) {
        groups[label] = [];
      }

      groups[label].push(activity);
    });

    return groups;
  }, [activities]);

  // Tags for editing
  const { data: tags = [] } = useTags(tenantId, workspaceId);

  // Update task mutation
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  // Initialize edit state when task loads or edit mode opens
  useEffect(() => {
    if (task && isEditing) {
      setEditTitle(task.title || "");
      setEditDescription(task.description || "");
      setEditPriority((task.priority as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM");
      setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setEditColumnId(task.columnId || "");
      // Derive assigneeIds from assignees array if assigneeIds is not available
      const assigneeIds = task.assigneeIds?.length
        ? task.assigneeIds
        : (task.assignees || []).map(
            (a: any) => a.userId || a.user?.id || a.id
          );
      setEditAssigneeIds(assigneeIds);
      const taskTagIds = (task.tags || []).map(
        (t: any) => t.tag?.id || t.id || t
      );
      setEditTagIds(taskTagIds);
    }
  }, [task, isEditing]);

  // Reset edit mode when sheet closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  const handleSave = () => {
    if (!taskId || !editTitle.trim()) return;

    const dto = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      columnId: editColumnId,
      dueDate: editDueDate?.toISOString(),
      assigneeIds: editAssigneeIds.length > 0 ? editAssigneeIds : undefined,
      tagIds: editTagIds.length > 0 ? editTagIds : undefined
    };

    updateTask(
      { tenantId, workspaceId, boardId, taskId, dto },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: taskDetailQueryKey(tenantId, workspaceId, boardId, taskId)
          });
          setIsEditing(false);
        }
      }
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const toggleTag = (tagId: string) => {
    setEditTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const selectedTags = useMemo(() => {
    return tags.filter((t: TagType) => editTagIds.includes(t.id));
  }, [tags, editTagIds]);

  const unselectedTags = useMemo(() => {
    return tags.filter((t: TagType) => !editTagIds.includes(t.id));
  }, [tags, editTagIds]);

  const dueDateLabel = useMemo(() => {
    if (!editDueDate) return null;
    const today = new Date();
    const isToday =
      editDueDate.getDate() === today.getDate() &&
      editDueDate.getMonth() === today.getMonth() &&
      editDueDate.getFullYear() === today.getFullYear();
    return isToday ? "Today" : format(editDueDate, "PPP");
  }, [editDueDate]);

  if (!taskId) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full data-[side=right]:sm:max-w-4xl p-0 flex flex-col gap-0 border-l">
          <div className="p-6 flex items-center justify-center text-muted-foreground">
            No task selected
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-4xl p-0 flex flex-col gap-0 border-l">
        <SheetHeader className="px-6 py-4 border-b pr-12">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              Task Information
            </SheetTitle>
            {!isLoadingTask && !isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            )}
            {isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editTitle.trim() || isUpdating}
                  className="gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        {isLoadingTask ? (
          <div className="p-6 flex items-center justify-center text-muted-foreground">
            Loading task details...
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Panel: Task Info & Subtasks */}

            <ScrollArea className="flex-1 border-r bg-background">
              <div className="p-6 flex flex-col gap-8">
                {/* Header & Properties */}

                {isEditing ? (
                  // EDIT MODE
                  <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Task title
                      </label>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Task title"
                      />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Grid for Column, Priority, Due Date, Assignees, Tags */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Column/Status */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Status / Column
                        </label>
                        <Popover
                          open={columnPopoverOpen}
                          onOpenChange={setColumnPopoverOpen}
                        >
                          <PopoverTrigger className="flex min-h-10 h-auto w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            <div className="flex items-center gap-2">
                              {editColumnId ? (
                                (() => {
                                  const col = columns.find(
                                    (c) => c.id === editColumnId
                                  );
                                  if (!col)
                                    return (
                                      <span className="text-muted-foreground">
                                        Select column
                                      </span>
                                    );
                                  return (
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{
                                          backgroundColor:
                                            col.color || "#6366f1"
                                        }}
                                      />
                                      <span>{col.name}</span>
                                    </div>
                                  );
                                })()
                              ) : (
                                <span className="text-muted-foreground">
                                  Select column
                                </span>
                              )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[260px] p-1"
                            align="start"
                          >
                            <div className="flex flex-col max-h-[250px] overflow-auto">
                              {columns.length === 0 && (
                                <p className="text-sm text-muted-foreground p-3 text-center">
                                  No columns available
                                </p>
                              )}
                              {columns.map((col) => (
                                <button
                                  key={col.id}
                                  onClick={() => {
                                    setEditColumnId(col.id);
                                    setColumnPopoverOpen(false);
                                  }}
                                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-left text-sm hover:bg-muted transition-colors ${
                                    editColumnId === col.id ? "bg-muted" : ""
                                  }`}
                                >
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                      backgroundColor: col.color || "#6366f1"
                                    }}
                                  />
                                  <span className="flex-1">{col.name}</span>
                                  {editColumnId === col.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Priority */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Priority
                        </label>
                        <Select
                          value={editPriority}
                          onValueChange={(val) =>
                            val &&
                            setEditPriority(val as "LOW" | "MEDIUM" | "HIGH")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Due Date */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Due Date
                        </label>
                        <Popover>
                          <PopoverTrigger>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !editDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dueDateLabel || <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editDueDate}
                              onSelect={setEditDueDate}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Assignees */}
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Assignees
                        </label>
                        <Popover
                          open={assigneePopoverOpen}
                          onOpenChange={setAssigneePopoverOpen}
                        >
                          <PopoverTrigger>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
                            >
                              <div className="flex items-center gap-2">
                                {editAssigneeIds.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    Select assignees
                                  </span>
                                ) : (
                                  <span>{editAssigneeIds.length} selected</span>
                                )}
                              </div>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-2">
                            <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
                              {uniqueMembers.length === 0 && (
                                <p className="text-sm text-muted-foreground p-2">
                                  No members available
                                </p>
                              )}
                              {uniqueMembers
                                .filter((m) => !editAssigneeIds.includes(m.id))
                                .map((member) => (
                                  <button
                                    key={member.id}
                                    onClick={() => {
                                      setEditAssigneeIds((prev) => [
                                        ...prev,
                                        member.id
                                      ]);
                                    }}
                                    className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-left"
                                  >
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage
                                        src={member.avatarUrl || ""}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {(
                                          member.fullName ||
                                          member.username ||
                                          "U"
                                        )
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm truncate">
                                      {member.fullName ||
                                        member.username ||
                                        member.email}
                                    </span>
                                  </button>
                                ))}
                              {uniqueMembers.filter(
                                (m) => !editAssigneeIds.includes(m.id)
                              ).length === 0 &&
                                uniqueMembers.length > 0 && (
                                  <p className="text-sm text-muted-foreground p-2 text-center">
                                    All members assigned
                                  </p>
                                )}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {editAssigneeIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {editAssigneeIds.map((id) => {
                              const member = uniqueMembers.find(
                                (m) => m.id === id
                              );
                              if (!member) return null;
                              return (
                                <div
                                  key={id}
                                  className="group flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 pr-1 text-xs"
                                >
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={member.avatarUrl || ""} />
                                    <AvatarFallback className="text-[8px]">
                                      {(
                                        member.fullName ||
                                        member.username ||
                                        "U"
                                      )
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate max-w-20">
                                    {member.fullName || member.username}
                                  </span>
                                  <span
                                    onClick={() =>
                                      setEditAssigneeIds((prev) =>
                                        prev.filter((x) => x !== id)
                                      )
                                    }
                                    className="ml-0.5 p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer"
                                  >
                                    <X className="h-3 w-3" />
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="grid gap-2 col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Tags
                        </label>
                        <Popover
                          open={tagPopoverOpen}
                          onOpenChange={setTagPopoverOpen}
                        >
                          <PopoverTrigger>
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal h-auto min-h-10 py-2"
                            >
                              <div className="flex flex-wrap gap-1 items-center">
                                {selectedTags.length === 0 ? (
                                  <span className="text-muted-foreground">
                                    Select tags
                                  </span>
                                ) : (
                                  selectedTags.map((tag: TagType) => (
                                    <Badge
                                      key={tag.id}
                                      style={{ backgroundColor: tag.color }}
                                      className="text-white text-xs"
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))
                                )}
                              </div>
                              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-2">
                            <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
                              {tags.length === 0 && (
                                <p className="text-sm text-muted-foreground p-2">
                                  No tags available
                                </p>
                              )}
                              {unselectedTags.map((tag: TagType) => (
                                <button
                                  key={tag.id}
                                  onClick={() => toggleTag(tag.id)}
                                  className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-left"
                                >
                                  <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span className="text-sm">{tag.name}</span>
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        {selectedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedTags.map((tag: TagType) => (
                              <Badge
                                key={tag.id}
                                style={{ backgroundColor: tag.color }}
                                className="text-white text-xs pr-1"
                              >
                                {tag.name}
                                <button
                                  onClick={() => toggleTag(tag.id)}
                                  className="ml-1 hover:text-white/80"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // VIEW MODE
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold">{task?.title}</h2>

                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {task?.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                      {/* Status / Column */}
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Status
                        </span>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 rounded-full bg-brand-blue" />
                          <span>
                            {columns.find((c) => c.id === task?.columnId)
                              ?.name || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Priority
                        </span>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {task?.priority || "None"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Est time
                        </span>

                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />

                          <span>
                            {task?.customFieldValues?.find((f: any) =>
                              f.customField?.name
                                ?.toLowerCase()
                                ?.includes("time")
                            )?.value || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Due Date
                        </span>

                        <div className="text-sm">
                          {task?.dueDate
                            ? format(new Date(task.dueDate), "dd MMM yyyy")
                            : "No date"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignees & Tags */}

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Assignee</span>

                    <div className="flex gap-2">
                      {assigneesList.length > 0 ? (
                        assigneesList.map((user: any) => (
                          <Avatar
                            key={user.id || Math.random()}
                            className="h-8 w-8"
                          >
                            <AvatarImage src={user.avatarUrl} />

                            <AvatarFallback>
                              {user.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Tags</span>

                    <div className="flex flex-wrap gap-2">
                      {tagList.length > 0 ? (
                        tagList.map((tag: any) => (
                          <span
                            key={tag.id || tag}
                            className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                            style={
                              tag.color
                                ? {
                                    backgroundColor: `${tag.color}20`,

                                    color: tag.color
                                  }
                                : {}
                            }
                          >
                            {tag.name || tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No tags
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Subtasks */}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subtask</span>

                    <span className="text-sm text-muted-foreground">
                      {completedSubtasks}/{subtasks.length}
                    </span>
                  </div>

                  {/* Progress Bar */}

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    {subtasks.map((st) => (
                      <div
                        key={st.id}
                        className={cn(
                          "flex items-center gap-3 rounded-md border p-3 transition-colors",

                          st.isDone
                            ? "bg-muted/50"
                            : "bg-card hover:bg-muted/30"
                        )}
                      >
                        <Checkbox
                          checked={st.isDone}
                          onCheckedChange={() =>
                            handleToggleSubtask(st.id, st.isDone)
                          }
                          className={
                            st.isDone
                              ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                              : ""
                          }
                        />

                        <span
                          className={cn(
                            "text-sm flex-1",

                            st.isDone && "text-muted-foreground line-through"
                          )}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        placeholder="Add new subtask"
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={handleAddSubtask}
                        className="h-9"
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddSubtask()}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="mr-1 h-4 w-4" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Attachments */}

                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium">Attachments</span>

                  <label className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />

                    <Papanclip className="h-6 w-6 text-brand-blue mb-2" />

                    <span className="text-sm text-brand-blue font-medium">
                      Drag or click your attachment
                    </span>
                  </label>

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachments.map((att: any) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 p-2 border rounded bg-muted/20 text-sm group relative pr-8"
                        >
                          <Papanclip className="w-4 h-4 text-muted-foreground shrink-0" />

                          <a
                            href={att.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate max-w-37.5 hover:underline"
                          >
                            {att.fileName}
                          </a>

                          <button
                            onClick={() =>
                              deleteAttachment({
                                tenantId,

                                workspaceId,

                                boardId,

                                taskId: taskId!,

                                attachmentId: att.id
                              })
                            }
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                          >
                            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Right Panel: Activity */}

            <div className="w-80 bg-muted/20 flex flex-col">
              <div className="p-4 border-b bg-background/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Activity</h3>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search activity"
                      className="h-8 w-36 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 flex flex-col gap-5">
                  {isLoadingActivities ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No activity yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {Object.entries(groupedActivities).map(
                        ([dateLabel, dateActivities]: [
                          string,

                          TaskActivity[]
                        ]) => (
                          <div key={dateLabel} className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {dateLabel}
                              </span>

                              <div className="h-px flex-1 bg-border" />
                            </div>

                            <div className="flex flex-col gap-4">
                              {(dateActivities as TaskActivity[]).map(
                                (activity) => {
                                  // Handle COMMENT feed type

                                  if (activity.feedType === "COMMENT") {
                                    return (
                                      <div
                                        key={activity.id}
                                        className="flex gap-3 group"
                                      >
                                        <Avatar className="h-8 w-8 shrink-0">
                                          <AvatarImage
                                            src={
                                              activity.creator?.avatarUrl ||
                                              undefined
                                            }
                                          />

                                          <AvatarFallback>
                                            {activity.creator?.fullName?.charAt(
                                              0
                                            ) || "U"}
                                          </AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-brand-blue">
                                              {activity.creator?.fullName ||
                                                "Unknown user"}
                                            </span>

                                            {currentUser?.id ===
                                              activity.creator?.id && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteComment(
                                                    activity.id
                                                  )
                                                }
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                                                title="Delete comment"
                                              >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                              </button>
                                            )}
                                          </div>

                                          <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                            {activity.content}
                                          </p>

                                          <span className="text-xs text-muted-foreground">
                                            {format(
                                              new Date(activity.createdAt),

                                              "dd MMM yyyy, HH:mm"
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Handle ACTIVITY feed type

                                  return (
                                    <div
                                      key={activity.id}
                                      className="flex gap-3"
                                    >
                                      <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarImage
                                          src={
                                            activity.user?.avatarUrl ||
                                            undefined
                                          }
                                        />

                                        <AvatarFallback>
                                          {activity.user?.fullName?.charAt(0) ||
                                            "U"}
                                        </AvatarFallback>
                                      </Avatar>

                                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-sm font-medium text-brand-blue">
                                            {activity.user?.fullName ||
                                              "Unknown user"}
                                          </span>

                                          <span className="text-sm text-muted-foreground">
                                            {activity.action === "CREATED" &&
                                              activity.entityType === "TASK" &&
                                              " created this task"}

                                            {activity.action === "CREATED" &&
                                              activity.entityType ===
                                                "SUBTASK" &&
                                              " added a subtask"}

                                            {activity.action === "CREATED" &&
                                              activity.entityType ===
                                                "COMMENT" &&
                                              " added a comment"}

                                            {activity.action === "UPDATED" &&
                                              " updated this task"}

                                            {activity.action === "MOVED" &&
                                              " moved this task"}

                                            {activity.action === "DELETED" &&
                                              " deleted " +
                                                (activity.entityType ===
                                                "SUBTASK"
                                                  ? "a subtask"
                                                  : "this task")}
                                          </span>
                                        </div>

                                        <span className="text-xs text-muted-foreground">
                                          {format(
                                            new Date(activity.createdAt),

                                            "dd MMM yyyy, HH:mm"
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Comment Input */}

              <div className="p-4 border-t bg-background">
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarImage src={currentUser?.avatarUrl || undefined} />

                    <AvatarFallback>
                      {currentUser?.fullName?.charAt(0) || "Me"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 flex flex-col gap-2">
                    <Input
                      placeholder="Write a comment..."
                      className="h-9"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();

                          handleSubmitComment();
                        }
                      }}
                    />

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={!commentContent.trim()}
                        onClick={handleSubmitComment}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
