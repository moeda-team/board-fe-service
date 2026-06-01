"use client";

import { useState, useMemo, useEffect, useRef } from "react";

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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { Badge } from "@/components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";

import {
  useTaskDetail,
  useUpdateTask,
  taskDetailQueryKey
} from "@/hooks/api/useTasks";
import { useCustomFields } from "@/hooks/api/useCustomFields";

import {
  useTaskSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  taskSubtasksQueryKey
} from "@/hooks/api/useTaskSubtasks";

import {
  useTaskAttachments,
  useUploadAttachment,
  useDeleteAttachment
} from "@/hooks/api/useTaskAttachments";

import {
  useTaskActivities,
  taskActivitiesQueryKey
} from "@/hooks/api/useTaskActivities";

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

import type { TaskActivity, Subtask } from "@/types/type-tasks";
import type { Column } from "@/types/type-kanban-columns";
import type { Member, Tag as TagType } from "@/types/api";
import type { CustomField } from "@/types/type-custom-fields";
import { useQueryClient } from "@tanstack/react-query";
import { useTags } from "@/hooks/api/useTags";
import { useTenantSocket } from "@/hooks/useTenantSocket";
import { useMentions } from "@/hooks/api/useMentions";

interface SubtaskItemProps {
  subtask: Subtask;
  isChild?: boolean;
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  onToggle: () => void;
  onAddChild?: () => void;
}

function SubtaskItem({
  subtask,
  isChild = false,
  tenantId,
  workspaceId,
  boardId,
  taskId,
  onToggle,
  onAddChild
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateSubtask } = useUpdateSubtask();
  const { mutate: deleteSubtask } = useDeleteSubtask();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== subtask.title) {
      updateSubtask({
        tenantId,
        workspaceId,
        boardId,
        taskId,
        subtaskId: subtask.id,
        dto: { title: trimmed }
      });
    }
    setIsEditing(false);
    setEditTitle(subtask.title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(subtask.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    deleteSubtask({
      tenantId,
      workspaceId,
      boardId,
      taskId,
      subtaskId: subtask.id
    });
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center rounded-md border transition-all duration-200",
          isChild ? "gap-2 px-3 py-2 flex-1" : "gap-3 p-3",
          subtask.isDone
            ? "bg-muted/50"
            : "bg-card hover:bg-muted/30"
        )}
      >
        <Checkbox
          checked={subtask.isDone}
          onCheckedChange={onToggle}
          className={cn(
            "shrink-0",
            subtask.isDone
              ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              : ""
          )}
        />

        {isEditing ? (
          <Input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            className={cn("h-7 text-sm flex-1", isChild ? "h-6" : "h-7")}
          />
        ) : (
          <span
            className={cn(
              "text-sm flex-1 cursor-pointer select-none",
              subtask.isDone && "text-muted-foreground line-through"
            )}
            onClick={() => setIsEditing(true)}
            title="Click to edit"
          >
            {subtask.title}
          </span>
        )}

        {!isEditing && (
          <div className="flex items-center gap-0.5">
            {onAddChild && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddChild();
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subtask</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{subtask.title}</strong>? This action cannot be undone.
              {subtask.children && subtask.children.length > 0 && (
                <span className="block mt-1 text-destructive">
                  This subtask has {subtask.children.length} child(ren) that will also be removed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

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
  const [addingChildForParentId, setAddingChildForParentId] = useState<string | null>(null);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [debouncedMentionSearch, setDebouncedMentionSearch] = useState<
    string | null
  >(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce mention search to reduce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMentionSearch(mentionSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [mentionSearch]);

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
  const [editCustomFieldValues, setEditCustomFieldValues] = useState<
    Record<string, string>
  >({});
  const [selectedEditCustomFieldIds, setSelectedEditCustomFieldIds] = useState<
    string[]
  >([]);
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

  const { data: customFields = [] } = useCustomFields(
    tenantId,
    workspaceId,
    boardId
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

  const socket = useTenantSocket(tenantId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // WebSocket listener for real-time comment updates
  useEffect(() => {
    if (!socket || !tenantId || !workspaceId || !boardId || !task?.id) return;

    const handleNewActivity = () => {
      queryClient.invalidateQueries({
        queryKey: taskActivitiesQueryKey(
          tenantId,
          workspaceId,
          boardId,
          task.id
        )
      });
    };

    socket.on("task.comment.created", handleNewActivity);
    socket.on("task.comment.updated", handleNewActivity);
    socket.on("task.comment.deleted", handleNewActivity);

    return () => {
      socket.off("task.comment.created", handleNewActivity);
      socket.off("task.comment.updated", handleNewActivity);
      socket.off("task.comment.deleted", handleNewActivity);
    };
  }, [socket, tenantId, workspaceId, boardId, task?.id, queryClient]);

  // Auto-scroll to bottom when activities change or sheet opens
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      timer = setTimeout(() => {
        if (bottomRef.current && activities.length > 0) {
          bottomRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
          });
        }
      }, 250);
    }

    return () => {
      if (timer!) clearTimeout(timer);
    };
  }, [open, activities.length]);

  const { data: mentionResults = [], isLoading: isLoadingMentions } =
    useMentions(tenantId, workspaceId, debouncedMentionSearch);

  // Fallback: filter local workspace members when API returns empty or fails
  const filteredLocalMembers = useMemo(() => {
    if (mentionSearch === null) return [];
    const query = mentionSearch.toLowerCase();
    return members.filter((m) => {
      const name = (m.fullName || "").toLowerCase();
      const user = (m.username || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      return (
        name.includes(query) || user.includes(query) || email.includes(query)
      );
    });
  }, [members, mentionSearch]);

  // Use API results if available, otherwise fall back to local filtered members
  const mentionList =
    mentionResults.length > 0 ? mentionResults : filteredLocalMembers;

  const handleSelectMention = (username: string) => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const value = commentContent;
    const cursorPos = input.selectionStart ?? value.length;

    const beforeCursor = value.slice(0, cursorPos);
    const afterCursor = value.slice(cursorPos);
    const atIndex = beforeCursor.lastIndexOf("@");

    if (atIndex === -1) return;

    const newValue =
      value.slice(0, atIndex) + "@" + username + " " + afterCursor;
    setCommentContent(newValue);
    setMentionSearch(null);

    setTimeout(() => {
      input.focus();
      const newCursorPos = atIndex + username.length + 2;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommentContent(value);

    const cursorPos = e.target.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const match = textBeforeCursor.match(/(?:\s|^)@([a-zA-Z0-9_.]*)$/);

    if (match) {
      setMentionSearch(match[1]);
    } else {
      setMentionSearch(null);
    }
  };

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

  const { mutate: updateSubtask, mutateAsync: updateSubtaskAsync } = useUpdateSubtask();

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

      dto: { title: newSubtaskTitle.trim(), parentId: null }
    });

    setNewSubtaskTitle("");
  };

  const handleAddChildSubtask = (parentId: string) => {
    if (!newChildTitle.trim() || !taskId) return;

    createSubtask({
      tenantId,

      workspaceId,

      boardId,

      taskId,

      dto: { title: newChildTitle.trim(), parentId }
    });

    setNewChildTitle("");
    setAddingChildForParentId(null);
  };

  const handleToggleParent = async (parent: Subtask) => {
    if (!taskId || !tenantId || !workspaceId || !boardId) return;
    const newDone = !parent.isDone;
    const queryKey = taskSubtasksQueryKey(tenantId, workspaceId, boardId, taskId);

    queryClient.setQueryData<Subtask[]>(queryKey, (old) => {
      if (!old) return old;
      return old.map((st) => {
        if (st.id === parent.id) {
          return {
            ...st,
            isDone: newDone,
            children: st.children?.map((c) => ({ ...c, isDone: newDone }))
          };
        }
        return st;
      });
    });

    await Promise.all([
      updateSubtaskAsync({
        tenantId,
        workspaceId,
        boardId,
        taskId,
        subtaskId: parent.id,
        dto: { isDone: newDone }
      }),
      ...(parent.children?.map((child) =>
        updateSubtaskAsync({
          tenantId,
          workspaceId,
          boardId,
          taskId,
          subtaskId: child.id,
          dto: { isDone: newDone }
        })
      ) ?? [])
    ]);
  };

  const handleToggleChild = async (child: Subtask, parent: Subtask) => {
    if (!taskId || !tenantId || !workspaceId || !boardId) return;
    const newDone = !child.isDone;
    const siblings = parent.children ?? [];
    const allSiblingsDone = siblings.every((s) =>
      s.id === child.id ? newDone : s.isDone
    );
    const shouldCheckParent = newDone && !parent.isDone && allSiblingsDone;
    const shouldUncheckParent = !newDone && parent.isDone;

    const queryKey = taskSubtasksQueryKey(tenantId, workspaceId, boardId, taskId);

    queryClient.setQueryData<Subtask[]>(queryKey, (old) => {
      if (!old) return old;
      return old.map((st) => {
        if (st.id === parent.id) {
          return {
            ...st,
            isDone: shouldCheckParent
              ? true
              : shouldUncheckParent
                ? false
                : st.isDone,
            children: st.children?.map((c) =>
              c.id === child.id ? { ...c, isDone: newDone } : c
            )
          };
        }
        return st;
      });
    });

    await updateSubtaskAsync({
      tenantId,
      workspaceId,
      boardId,
      taskId,
      subtaskId: child.id,
      dto: { isDone: newDone }
    });

    if (shouldCheckParent) {
      await updateSubtaskAsync({
        tenantId,
        workspaceId,
        boardId,
        taskId,
        subtaskId: parent.id,
        dto: { isDone: true }
      });
    } else if (shouldUncheckParent) {
      await updateSubtaskAsync({
        tenantId,
        workspaceId,
        boardId,
        taskId,
        subtaskId: parent.id,
        dto: { isDone: false }
      });
    }
  };

  const completedSubtasks = subtasks.filter((st) => st.isDone).length;

  const progressPct =
    subtasks.length > 0
      ? (completedSubtasks / subtasks.length) * 100
      : 0;

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

    const filtered = activitySearch.trim()
      ? activities.filter((a) => {
          const q = activitySearch.toLowerCase();
          const content = (a.content || "").toLowerCase();
          const creator = (a.creator?.fullName || "").toLowerCase();
          const user = (a.user?.fullName || "").toLowerCase();
          const action = (a.action || "").toLowerCase();
          const entityType = (a.entityType || "").toLowerCase();
          return (
            content.includes(q) ||
            creator.includes(q) ||
            user.includes(q) ||
            action.includes(q) ||
            entityType.includes(q)
          );
        })
      : activities;

    filtered.forEach((activity) => {
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
  }, [activities, activitySearch]);

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

      const normalizedValues: Record<string, string> = {};
      (task.customFieldValues || []).forEach((v: any) => {
        const id =
          v?.customFieldId ||
          v?.customField?.id ||
          v?.customField?.customFieldId ||
          v?.id;
        const value = v?.value ?? v?.customFieldValue ?? v?.data;
        if (typeof id === "string") {
          normalizedValues[id] = value == null ? "" : String(value);
        }
      });
      setEditCustomFieldValues(normalizedValues);
      setSelectedEditCustomFieldIds(Object.keys(normalizedValues));
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

    const customFieldsPayload = selectedEditCustomFieldIds
      .map((customFieldId) => ({
        customFieldId,
        value: String(editCustomFieldValues[customFieldId] ?? "")
      }))
      .filter((x) => x.value.trim() !== "");

    const dto = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      columnId: editColumnId,
      dueDate: editDueDate?.toISOString(),
      assigneeIds: editAssigneeIds.length > 0 ? editAssigneeIds : undefined,
      tagIds: editTagIds.length > 0 ? editTagIds : undefined,
      customFields:
        customFieldsPayload.length > 0 ? customFieldsPayload : undefined
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

  const toggleEditCustomFieldSelection = (customFieldId: string) => {
    setSelectedEditCustomFieldIds((prev) =>
      prev.includes(customFieldId)
        ? prev.filter((id) => id !== customFieldId)
        : [...prev, customFieldId]
    );
    setEditCustomFieldValues((prev) =>
      prev[customFieldId] == null ? { ...prev, [customFieldId]: "" } : prev
    );
  };

  const viewCustomFieldItems = useMemo(() => {
    const values = (task?.customFieldValues ?? []) as any[];

    const formatValue = (cfv: any) => {
      const raw = cfv?.value;
      const field = cfv?.customField;

      if (raw == null) return "";
      const rawString = String(raw);
      const type = field?.type;

      if (type === "dropdown") {
        const options = Array.isArray(field?.options) ? field.options : [];
        const normalized = options
          .map((o: any) => (typeof o === "string" ? { label: o, value: o } : o))
          .filter(
            (o: any) =>
              o && typeof o.value === "string" && typeof o.label === "string"
          );
        return (
          normalized.find((o: any) => o.value === rawString)?.label ?? rawString
        );
      }

      if (type === "checkbox") {
        if (rawString === "true") return "Yes";
        if (rawString === "false") return "No";
        return rawString;
      }

      if (type === "date") {
        const d = new Date(rawString);
        if (!Number.isNaN(d.getTime())) {
          return format(d, "dd MMM yyyy");
        }
      }

      if (type === "number") {
        const suffix =
          field?.options &&
          typeof field.options === "object" &&
          !Array.isArray(field.options) &&
          "suffix" in field.options &&
          typeof (field.options as any).suffix === "string"
            ? (field.options as any).suffix
            : "";
        return suffix ? `${rawString}${suffix}` : rawString;
      }

      return rawString;
    };

    return values
      .map((cfv) => {
        const field = cfv?.customField;
        const id =
          cfv?.customFieldId || cfv?.customField?.id || cfv?.id || "unknown";
        const name = field?.name ?? "Custom Field";
        const value = formatValue(cfv);
        return { id: String(id), name: String(name), value };
      })
      .filter((x) => x.value.trim() !== "");
  }, [task?.customFieldValues]);

  const renderCustomFieldInput = (field: CustomField) => {
    const value = editCustomFieldValues[field.id] ?? "";

    const optionsObj =
      field.options &&
      typeof field.options === "object" &&
      !Array.isArray(field.options)
        ? (field.options as Record<string, unknown>)
        : null;

    const placeholder =
      field.type === "text" && typeof optionsObj?.placeholder === "string"
        ? optionsObj.placeholder
        : field.type === "number"
          ? "0"
          : "Enter value";

    const maxLength =
      field.type === "text" && typeof optionsObj?.maxLength === "number"
        ? optionsObj.maxLength
        : undefined;

    const min =
      field.type === "number" && typeof optionsObj?.min === "number"
        ? optionsObj.min
        : undefined;

    const max =
      field.type === "number" && typeof optionsObj?.max === "number"
        ? optionsObj.max
        : undefined;

    if (field.type === "dropdown") {
      const dropdownOptions = Array.isArray(field.options) ? field.options : [];
      const normalizedDropdownOptions = dropdownOptions
        .map((opt) =>
          typeof opt === "string"
            ? { label: opt, value: opt, color: undefined as string | undefined }
            : {
                label: typeof opt.label === "string" ? opt.label : "",
                value: typeof opt.value === "string" ? opt.value : "",
                color: typeof opt.color === "string" ? opt.color : undefined
              }
        )
        .filter((opt) => opt.label.trim() && opt.value.trim());

      const selectedOption = normalizedDropdownOptions.find(
        (o) => o.value === value
      );

      return (
        <Select
          value={value || undefined}
          onValueChange={(val) => {
            if (val == null) return;
            setEditCustomFieldValues((prev) => ({ ...prev, [field.id]: val }));
          }}
        >
          <SelectTrigger className="w-full">
            {selectedOption && (
              <div
                className="w-3 h-3 rounded-full border"
                style={{
                  backgroundColor: selectedOption.color || "transparent"
                }}
              />
            )}
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {normalizedDropdownOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: opt.color || "transparent" }}
                  />
                  <span>{opt.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "date") {
      const selected = value ? new Date(`${value}T00:00:00`) : undefined;
      const label = value ? format(new Date(`${value}T00:00:00`), "PPP") : null;
      return (
        <Popover>
          <PopoverTrigger>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {label || <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (!date) return;
                const formatted = format(date, "yyyy-MM-dd");
                setEditCustomFieldValues((prev) => ({
                  ...prev,
                  [field.id]: formatted
                }));
              }}
            />
          </PopoverContent>
        </Popover>
      );
    }

    if (field.type === "checkbox") {
      return (
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
          onClick={() => {
            const next = value === "true" ? "false" : "true";
            setEditCustomFieldValues((prev) => ({ ...prev, [field.id]: next }));
          }}
        >
          <Checkbox checked={value === "true"} />
          <span className="text-muted-foreground">
            {value === "true" ? "Yes" : "No"}
          </span>
        </button>
      );
    }

    if (field.type === "text") {
      return (
        <div className="grid gap-1">
          <Input
            type="text"
            value={value}
            onChange={(e) =>
              setEditCustomFieldValues((prev) => ({
                ...prev,
                [field.id]: e.target.value
              }))
            }
            placeholder={placeholder}
            maxLength={maxLength}
          />
          {typeof maxLength === "number" && (
            <p className="text-xs text-muted-foreground text-right">
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "number") {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) =>
            setEditCustomFieldValues((prev) => ({
              ...prev,
              [field.id]: e.target.value
            }))
          }
          placeholder={placeholder}
          min={min}
          max={max}
        />
      );
    }

    return (
      <Input
        type="text"
        value={value}
        onChange={(e) =>
          setEditCustomFieldValues((prev) => ({
            ...prev,
            [field.id]: e.target.value
          }))
        }
        placeholder={placeholder}
      />
    );
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

                    {customFields.length > 0 && (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-muted-foreground">
                            Custom Fields
                          </label>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                />
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Add Field
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                  Select fields
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {customFields.map((field) => (
                                  <DropdownMenuCheckboxItem
                                    key={field.id}
                                    checked={selectedEditCustomFieldIds.includes(
                                      field.id
                                    )}
                                    onClick={() =>
                                      toggleEditCustomFieldSelection(field.id)
                                    }
                                  >
                                    {field.name}
                                  </DropdownMenuCheckboxItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {selectedEditCustomFieldIds.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No custom fields selected.
                          </p>
                        ) : (
                          <div className="grid gap-4">
                            {selectedEditCustomFieldIds
                              .map((id) =>
                                customFields.find((f) => f.id === id)
                              )
                              .filter(Boolean)
                              .map((field) => (
                                <div
                                  key={(field as CustomField).id}
                                  className="grid gap-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-muted-foreground">
                                      {(field as CustomField).name}
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSelectedEditCustomFieldIds((prev) =>
                                          prev.filter(
                                            (x) =>
                                              x !== (field as CustomField).id
                                          )
                                        )
                                      }
                                      className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                      aria-label={`Remove ${(field as CustomField).name}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  {renderCustomFieldInput(field as CustomField)}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
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
                            {(() => {
                              const estTime = task?.estTime ?? undefined;
                              if (!estTime) return "N/A";
                              const days = estTime.days;
                              const hours = estTime.hours;
                              return `${days}d ${hours}h`;
                            })()}
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

                    {viewCustomFieldItems.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        <span className="text-sm font-medium">
                          Custom Fields
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {viewCustomFieldItems.map((item) => (
                            <div key={item.id} className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground font-medium">
                                {item.name}
                              </span>
                              <span className="text-sm">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                    {subtasks.map((parent) => (
                      <div key={parent.id} className="flex flex-col">
                        <SubtaskItem
                          subtask={parent}
                          tenantId={tenantId}
                          workspaceId={workspaceId}
                          boardId={boardId}
                          taskId={taskId || ""}
                          onToggle={() => handleToggleParent(parent)}
                          onAddChild={() => setAddingChildForParentId(parent.id)}
                        />

                        {parent.children && parent.children.length > 0 && (
                          <div className="relative pl-7">
                            {parent.children.map((child, idx, arr) => (
                              <div
                                key={child.id}
                                className="relative flex items-center"
                              >
                                {/* Vertical tree segment */}
                                <div
                                  className={cn(
                                    "absolute -left-[16px] top-0 w-[1px] bg-border/50",
                                    idx === arr.length - 1
                                      ? "h-1/2"
                                      : "bottom-0"
                                  )}
                                />
                                {/* Horizontal tree connector */}
                                <div className="absolute -left-[16px] top-1/2 w-[16px] h-[1px] -translate-y-1/2 bg-border/50" />

                                <SubtaskItem
                                  isChild
                                  subtask={child}
                                  tenantId={tenantId}
                                  workspaceId={workspaceId}
                                  boardId={boardId}
                                  taskId={taskId || ""}
                                  onToggle={() => handleToggleChild(child, parent)}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {addingChildForParentId === parent.id && (
                          <div className="pl-7 flex items-center gap-2 py-1">
                            <div className="flex flex-1 items-center gap-2">
                              <Input
                                placeholder="Add child subtask"
                                value={newChildTitle}
                                onChange={(e) => setNewChildTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddChildSubtask(parent.id);
                                  if (e.key === "Escape") setAddingChildForParentId(null);
                                }}
                                className="h-8"
                                autoFocus
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddChildSubtask(parent.id)}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" /> Add
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddingChildForParentId(null)}
                                className="shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}
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
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
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
                  <div ref={bottomRef} className="h-1 shrink-0" />
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

                  <div className="flex-1 flex flex-col gap-2 relative">
                    {mentionSearch !== null && (
                      <div className="absolute bottom-full left-0 right-0 mb-1 z-50 max-h-48 min-w-[200px] overflow-y-auto rounded-md border bg-popover shadow-md">
                        {isLoadingMentions &&
                        filteredLocalMembers.length === 0 ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        ) : mentionList.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                            No members found
                          </div>
                        ) : (
                          mentionList.map((member, idx) => (
                            <button
                              key={member.id || member.userId || idx}
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted cursor-pointer transition-colors"
                              onClick={() =>
                                handleSelectMention(
                                  member.username || member.fullName || ""
                                )
                              }
                            >
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarImage
                                  src={member.avatarUrl || undefined}
                                />
                                <AvatarFallback className="text-xs">
                                  {(member.fullName || member.username || "?")
                                    .charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">
                                  {member.fullName || member.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  @{member.username || member.fullName}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    <Input
                      ref={inputRef}
                      placeholder="Write a comment..."
                      className="h-9"
                      value={commentContent}
                      onChange={handleCommentChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          if (mentionSearch !== null) {
                            e.preventDefault();
                            if (mentionList.length > 0) {
                              const first = mentionList[0];
                              handleSelectMention(
                                first.username || first.fullName || ""
                              );
                            }
                            return;
                          }
                          e.preventDefault();

                          handleSubmitComment();
                        }
                        if (e.key === "Escape" && mentionSearch !== null) {
                          e.preventDefault();
                          setMentionSearch(null);
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
