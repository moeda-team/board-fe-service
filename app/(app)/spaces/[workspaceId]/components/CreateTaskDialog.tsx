"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Check, ChevronsUpDown } from "lucide-react";
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
import { useTags } from "@/hooks/api/useTags";

interface CreateTaskDialogProps {
  columns: Column[];
  members: Member[];
  tenantId: string;
  workspaceId: string;
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
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { data: tags = [] } = useTags(tenantId, workspaceId);

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

  const handleSubmit = () => {
    if (!title.trim() || !columnId) return;

    const dto: CreateTaskDto = {
      title: title.trim(),
      columnId,
      priority,
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(dueDate ? { dueDate: dueDate.toISOString() } : {}),
      ...(assigneeIds.length > 0 ? { assigneeIds } : {}),
      ...(selectedTagIds.length > 0 ? { tagIds: selectedTagIds } : {})
    };

    onSubmit(dto);

    // Reset form after submit
    setTitle("");
    setDescription("");
    setAssigneeIds([]);
    setDueDate(new Date());
    setSelectedTagIds([]);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Status / Column
              </label>
              <Select
                value={columnId}
                onValueChange={(val) => val && setColumnId(val)}
                items={columns.map((col) => ({
                  value: col.id,
                  label: col.name
                }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Assignees
              </label>
              <Popover
                open={assigneePopoverOpen}
                onOpenChange={setAssigneePopoverOpen}
              >
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="justify-between">
                      <span
                        className={
                          assigneeIds.length === 0
                            ? "text-muted-foreground"
                            : ""
                        }
                      >
                        {assigneeIds.length === 0
                          ? "Select assignees"
                          : `${assigneeIds.length} selected`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  }
                />
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
                            <AvatarImage
                              src={(member as any).avatarUrl || ""}
                            />
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
                <div className="flex flex-wrap gap-1 mt-1">
                  {assigneeIds.map((id) => {
                    const member = members.find((m) => m.id === id);
                    if (!member) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {member.fullName || member.username || member.email}
                        <button
                          onClick={() =>
                            setAssigneeIds((prev) =>
                              prev.filter((x) => x !== id)
                            )
                          }
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
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
                  {dueDate ? (
                    (() => {
                      const today = new Date();
                      const isToday =
                        dueDate.getDate() === today.getDate() &&
                        dueDate.getMonth() === today.getMonth() &&
                        dueDate.getFullYear() === today.getFullYear();
                      return isToday ? "Today" : format(dueDate, "PPP");
                    })()
                  ) : (
                    <span>Select date</span>
                  )}
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
            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="justify-between">
                    <span
                      className={
                        selectedTagIds.length === 0
                          ? "text-muted-foreground"
                          : ""
                      }
                    >
                      {selectedTagIds.length === 0
                        ? "Select tags"
                        : `${selectedTagIds.length} selected`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                }
              />
              <PopoverContent className="w-[280px] p-2">
                <div className="flex flex-col gap-1 max-h-[200px] overflow-auto">
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground p-2">
                      No tags available
                    </p>
                  )}
                  {tags.map((tag: Tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className="flex items-center gap-2 w-full px-2 py-2 rounded hover:bg-muted text-left"
                      >
                        <Checkbox checked={isSelected} />
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm truncate">{tag.name}</span>
                        {isSelected && <Check className="ml-auto h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
            {selectedTagIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedTagIds.map((tagId) => {
                  const tag = tags.find((t: Tag) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      style={{ backgroundColor: tag.color }}
                      className="flex items-center gap-1 text-white"
                    >
                      {tag.name}
                      <button
                        onClick={() => removeTag(tagId)}
                        className="ml-1 hover:text-white/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={!title.trim() || !columnId}>
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
