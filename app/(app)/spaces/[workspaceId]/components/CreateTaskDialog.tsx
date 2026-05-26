"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  X,
  Check,
  ChevronsUpDown,
  Plus,
  MoreHorizontal,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Column } from "@/types/type-kanban-columns";
import type { CreateTaskDto, Tag } from "@/types/api";
import type { Member } from "@/types/api";
import { useCustomFields } from "@/hooks/api/useCustomFields";
import type { CustomField } from "@/types/type-custom-fields";
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag
} from "@/hooks/api/useTags";

interface CreateTaskDialogProps {
  columns: Column[];
  members: Member[];
  tenantId: string;
  workspaceId: string;
  boardId: string;
  onSubmit: (dto: CreateTaskDto) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumnId?: string;
}

export function CreateTaskDialog({
  columns,
  members,
  tenantId,
  workspaceId,
  boardId,
  onSubmit,
  open,
  onOpenChange,
  defaultColumnId
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(
    defaultColumnId || columns[0]?.id || ""
  );
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [columnPopoverOpen, setColumnPopoverOpen] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("#6366f1");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});
  const [selectedCustomFieldIds, setSelectedCustomFieldIds] = useState<string[]>(
    []
  );

  const { data: customFields = [] } = useCustomFields(
    tenantId,
    workspaceId,
    boardId
  );

  const { data: tags = [] } = useTags(tenantId, workspaceId);
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  // Reset columnId and dueDate when dialog opens
  useEffect(() => {
    if (open) {
      setColumnId(defaultColumnId || columns[0]?.id || "");
      setDueDate(new Date());
      setCustomFieldValues({});
      setSelectedCustomFieldIds([]);
    }
  }, [open, defaultColumnId, columns]);

  const tagColors = [
    "#6366f1", // indigo
    "#3b82f6", // blue
    "#06b6d4", // cyan
    "#10b981", // emerald
    "#84cc16", // lime
    "#eab308", // yellow
    "#f59e0b", // amber
    "#f97316", // orange
    "#ef4444", // red
    "#ec4899", // pink
    "#a855f7", // purple
    "#6b7280" // gray
  ];

  // Memoize date display to prevent hydration mismatch
  const dueDateLabel = useMemo(() => {
    if (!dueDate) return null;
    const today = new Date();
    const isToday =
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear();
    return isToday ? "Today" : format(dueDate, "PPP");
  }, [dueDate]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const removeTag = (tagId: string) => {
    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
  };

  const selectedTags = useMemo(() => {
    return tags.filter((t: Tag) => selectedTagIds.includes(t.id));
  }, [tags, selectedTagIds]);

  const unselectedTags = useMemo(() => {
    return tags.filter(
      (t: Tag) =>
        !selectedTagIds.includes(t.id) &&
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [tags, selectedTagIds, tagSearch]);

  const canCreateNewTag =
    tagSearch.trim() &&
    !tags.some(
      (t: Tag) => t.name.toLowerCase() === tagSearch.trim().toLowerCase()
    );

  const handleCreateTag = async (nameOverride?: string) => {
    const name = nameOverride?.trim() || editTagName.trim() || tagSearch.trim();
    if (!name) return;
    try {
      const newTag = await createTag.mutateAsync({
        tenantId,
        workspaceId,
        dto: { name, color: editTagColor }
      });
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setTagSearch("");
      setEditTagName("");
      setIsCreatingTag(false);
    } catch {
      // Error handled by mutation meta
    }
  };

  const handleTagSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (canCreateNewTag && !isCreatingTag) {
        setEditTagColor(tagColors[0]);
        handleCreateTag(tagSearch);
      }
    }
  };

  const handleUpdateTag = async (tagId: string) => {
    try {
      await updateTag.mutateAsync({
        tenantId,
        workspaceId,
        tagId,
        dto: { name: editTagName.trim(), color: editTagColor }
      });
      setEditingTagId(null);
    } catch {
      // Error handled by mutation meta
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag.mutateAsync({ tenantId, workspaceId, tagId });
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
      setEditingTagId(null);
    } catch {
      // Error handled by mutation meta
    }
  };

  const startEditingTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const startCreatingTag = () => {
    setIsCreatingTag(true);
    setEditTagColor(tagColors[0]);
    if (tagSearch.trim()) {
      setEditTagName(tagSearch.trim());
    } else {
      setEditTagName("");
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    const customFieldsPayload = selectedCustomFieldIds
      .map((customFieldId) => ({
        customFieldId,
        value: String(customFieldValues[customFieldId] ?? "")
      }))
      .filter((x) => x.value.trim() !== "");

    const dto: CreateTaskDto = {
      title: title.trim(),
      columnId,
      priority,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
      ...(assigneeIds.length > 0 ? { assigneeIds } : {}),
      ...(selectedTagIds.length > 0 ? { tagIds: selectedTagIds } : {}),
      ...(customFieldsPayload.length > 0
        ? { customFields: customFieldsPayload }
        : {})
    };

    onSubmit(dto);

    // Reset form after submit
    setTitle("");
    setDescription("");
    setAssigneeIds([]);
    setDueDate(undefined);
    setSelectedTagIds([]);
    setCustomFieldValues({});
    setSelectedCustomFieldIds([]);
  };

  const toggleCustomFieldSelection = (customFieldId: string) => {
    setSelectedCustomFieldIds((prev) =>
      prev.includes(customFieldId)
        ? prev.filter((id) => id !== customFieldId)
        : [...prev, customFieldId]
    );
    setCustomFieldValues((prev) =>
      prev[customFieldId] == null ? { ...prev, [customFieldId]: "" } : prev
    );
  };

  const renderCustomFieldInput = (field: CustomField) => {
    const value = customFieldValues[field.id] ?? "";

    if (field.type === "dropdown") {
      const dropdownOptions = Array.isArray(field.options) ? field.options : [];

      return (
        <Select
          value={value || undefined}
          onValueChange={(val) => {
            if (val == null) return;
            setCustomFieldValues((prev) => ({ ...prev, [field.id]: val }));
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            {dropdownOptions.map((opt) => {
              const normalized =
                typeof opt === "string"
                  ? { value: opt, label: opt }
                  : { value: opt.value, label: opt.label };

              return (
                <SelectItem key={normalized.value} value={normalized.value}>
                  {normalized.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "date") {
      const selected = value ? new Date(`${value}T00:00:00`) : undefined;
      const label = value ? format(new Date(`${value}T00:00:00`), "PPP") : null;
      return (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              />
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label || <span>Select date</span>}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={(date) => {
                if (!date) return;
                const formatted = format(date, "yyyy-MM-dd");
                setCustomFieldValues((prev) => ({
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
            setCustomFieldValues((prev) => ({ ...prev, [field.id]: next }));
          }}
        >
          <Checkbox checked={value === "true"} />
          <span className="text-muted-foreground">{value === "true" ? "Yes" : "No"}</span>
        </button>
      );
    }

    return (
      <Input
        type={field.type === "number" ? "number" : "text"}
        value={value}
        onChange={(e) =>
          setCustomFieldValues((prev) => ({
            ...prev,
            [field.id]: e.target.value
          }))
        }
        placeholder={field.type === "number" ? "0" : "Enter value"}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Task title
            </label>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Description
            </label>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-25"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
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
                    {columnId ? (
                      (() => {
                        const col = columns.find((c) => c.id === columnId);
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
                                backgroundColor: col.color || "#6366f1"
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
                <PopoverContent className="w-[260px] p-1" align="start">
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
                          setColumnId(col.id);
                          setColumnPopoverOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-left text-sm hover:bg-muted transition-colors ${
                          columnId === col.id ? "bg-muted" : ""
                        }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: col.color || "#6366f1" }}
                        />
                        <span className="flex-1">{col.name}</span>
                        {columnId === col.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Assignees
              </label>
              <Popover
                open={assigneePopoverOpen}
                onOpenChange={setAssigneePopoverOpen}
              >
                <PopoverTrigger>
                  <div className="flex min-h-10 h-auto w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="flex items-center gap-2">
                      {assigneeIds.length === 0 ? (
                        <span className="text-muted-foreground">
                          Select assignees
                        </span>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {assigneeIds.slice(0, 3).map((id, idx) => {
                              const member = members.find((m) => m.id === id);
                              if (!member) return null;
                              return (
                                <Avatar
                                  key={id}
                                  className="h-6 w-6 border-2 border-background"
                                  style={{ zIndex: assigneeIds.length - idx }}
                                >
                                  <AvatarImage src={member.avatarUrl || ""} />
                                  <AvatarFallback className="text-[10px]">
                                    {(member.fullName || member.username || "U")
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                          </div>
                          {assigneeIds.length > 3 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              +{assigneeIds.length - 3}
                            </span>
                          )}
                          {assigneeIds.length > 0 &&
                            assigneeIds.length <= 3 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                {assigneeIds.length} selected
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-2">
                  <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
                    {members.length === 0 && (
                      <p className="text-sm text-muted-foreground p-2">
                        No members available
                      </p>
                    )}
                    {members.map((member) => {
                      const isSelected = assigneeIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => {
                            setAssigneeIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== member.id)
                                : [...prev, member.id]
                            );
                          }}
                          className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-left"
                        >
                          <Checkbox checked={isSelected} />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatarUrl || ""} />
                            <AvatarFallback className="text-xs">
                              {(member.fullName || member.username || "U")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate">
                            {member.fullName || member.username || member.email}
                          </span>
                          {isSelected && <Check className="ml-auto h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
              {assigneeIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-h-[72px] overflow-y-auto pr-1">
                  {assigneeIds.map((id) => {
                    const member = members.find((m) => m.id === id);
                    if (!member) return null;
                    return (
                      <div
                        key={id}
                        className="group flex items-center gap-1.5 rounded-full bg-muted px-2 py-1 pr-1 text-sm shrink-0"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.avatarUrl || ""} />
                          <AvatarFallback className="text-[10px]">
                            {(member.fullName || member.username || "U")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-24">
                          {member.fullName || member.username || member.email}
                        </span>
                        <span
                          onClick={() =>
                            setAssigneeIds((prev) =>
                              prev.filter((x) => x !== id)
                            )
                          }
                          className="ml-0.5 p-0.5 rounded-full hover:bg-muted-foreground/20 cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Priority
              </label>
              <Select
                value={priority}
                onValueChange={(val) =>
                  val && setPriority(val as "LOW" | "MEDIUM" | "HIGH")
                }
                items={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" }
                ]}
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

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Due Date
              </label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDateLabel || <span>Select date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setDueDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tags
            </label>
            <Popover
              open={tagPopoverOpen}
              onOpenChange={(open) => {
                if (!open && (editingTagId || isCreatingTag)) return;
                setTagPopoverOpen(open);
              }}
            >
              <PopoverTrigger className="flex min-h-10 h-auto w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                <div className="flex flex-wrap gap-1 items-center">
                  {selectedTags.length === 0 ? (
                    <span className="text-muted-foreground">Select tags</span>
                  ) : (
                    selectedTags.map((tag: Tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                        className="flex items-center gap-1 text-white text-xs"
                      >
                        {tag.name}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag.id);
                          }}
                          className="ml-0.5 hover:text-white/80 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))
                  )}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <div className="flex flex-col max-h-[350px]">
                  {/* Selected tags section */}
                  {selectedTags.length > 0 && (
                    <div className="p-2 border-b">
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map((tag: Tag) => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color }}
                            className="flex items-center gap-1 text-white text-xs pr-1"
                          >
                            {tag.name}
                            <button
                              onClick={() => toggleTag(tag.id)}
                              className="hover:text-white/80"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search/Create input */}
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search or create tag..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={handleTagSearchKeyDown}
                      className="h-8"
                    />
                  </div>

                  {/* Tag list */}
                  <div className="flex-1 overflow-auto">
                    {/* Create new tag option */}
                    {canCreateNewTag && (
                      <button
                        onClick={startCreatingTag}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-left text-sm"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <span>Create "{tagSearch.trim()}"</span>
                      </button>
                    )}

                    {/* Unselected tags */}
                    {unselectedTags.length > 0 && (
                      <>
                        <div className="px-2 py-0.5 text-xs text-muted-foreground">
                          Select an option
                        </div>
                        {unselectedTags.map((tag: Tag) => (
                          <div
                            key={tag.id}
                            className="group flex items-center gap-1.5 px-2 h-6 rounded hover:bg-muted cursor-pointer"
                          >
                            <div
                              onClick={() => toggleTag(tag.id)}
                              className="flex items-center gap-1.5 flex-1 text-left"
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm truncate leading-none">
                                {tag.name}
                              </span>
                            </div>
                            <Popover
                              open={editingTagId === tag.id}
                              onOpenChange={(open) => {
                                if (open) {
                                  startEditingTag(tag);
                                } else {
                                  setEditingTagId(null);
                                }
                              }}
                            >
                              <PopoverTrigger>
                                <span className="opacity-0 group-hover:opacity-100 rounded hover:bg-muted-foreground/10 transition-opacity cursor-pointer flex items-center justify-center w-5 h-5">
                                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                </span>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[220px] p-3"
                                align="end"
                              >
                                <div className="grid gap-3">
                                  <Input
                                    value={editTagName}
                                    onChange={(e) =>
                                      setEditTagName(e.target.value)
                                    }
                                    className="h-8"
                                    placeholder="Tag name"
                                  />
                                  <div className="flex flex-wrap gap-1.5">
                                    {tagColors.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => setEditTagColor(color)}
                                        className={`w-6 h-6 rounded-full transition-all ${editTagColor === color ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2 pt-1 border-t">
                                    <button
                                      onClick={() => handleDeleteTag(tag.id)}
                                      className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 px-2 py-1.5 rounded hover:bg-destructive/10 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete
                                    </button>
                                    <div className="flex-1" />
                                    <Button
                                      size="sm"
                                      className="h-8"
                                      onClick={() => handleUpdateTag(tag.id)}
                                      disabled={
                                        !editTagName.trim() ||
                                        updateTag.isPending
                                      }
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        ))}
                      </>
                    )}

                    {unselectedTags.length === 0 &&
                      !canCreateNewTag &&
                      tags.length > 0 && (
                        <p className="text-sm text-muted-foreground p-3 text-center">
                          No matching tags
                        </p>
                      )}

                    {tags.length === 0 && !canCreateNewTag && (
                      <p className="text-sm text-muted-foreground p-3 text-center">
                        No tags available. Type to create one.
                      </p>
                    )}
                  </div>

                  {/* Create tag inline form */}
                  {isCreatingTag && (
                    <div className="p-3 border-t bg-muted/50">
                      <div className="grid gap-3">
                        <Input
                          value={editTagName}
                          onChange={(e) => setEditTagName(e.target.value)}
                          className="h-8"
                          placeholder="Tag name"
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {tagColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setEditTagColor(color)}
                              className={`w-6 h-6 rounded-full transition-all ${editTagColor === color ? "ring-2 ring-offset-1 ring-primary" : ""}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              setIsCreatingTag(false);
                              setEditTagName("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => handleCreateTag()}
                            disabled={
                              !editTagName.trim() || createTag.isPending
                            }
                          >
                            Create
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* TODO: Render dynamic custom field inputs here based on Board's custom fields */}

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
                      <DropdownMenuLabel>Select fields</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {customFields.map((field) => (
                        <DropdownMenuCheckboxItem
                          key={field.id}
                          checked={selectedCustomFieldIds.includes(field.id)}
                          onClick={() => toggleCustomFieldSelection(field.id)}
                        >
                          {field.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {selectedCustomFieldIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No custom fields selected.
                </p>
              ) : (
                <div className="grid gap-4">
                  {selectedCustomFieldIds
                    .map((id) => customFields.find((f) => f.id === id))
                    .filter(Boolean)
                    .map((field) => (
                      <div key={(field as CustomField).id} className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-muted-foreground">
                            {(field as CustomField).name}
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedCustomFieldIds((prev) =>
                                prev.filter((x) => x !== (field as CustomField).id)
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
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
