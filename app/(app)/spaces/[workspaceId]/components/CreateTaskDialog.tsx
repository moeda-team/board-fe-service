"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, X, Check, ChevronsUpDown } from "lucide-react";
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
import type { CreateTaskDto } from "@/types/api";
import type { Member } from "@/types/api";

interface CreateTaskDialogProps {
  columns: Column[];
  members: Member[];
  onSubmit: (dto: CreateTaskDto) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultColumnId?: string;
}

export function CreateTaskDialog({
  columns,
  members,
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
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [estimatedHours, setEstimatedHours] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
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
      ...(tags.length > 0 ? { tagIds: tags } : {}) // Sending tags as strings, backend might expect IDs but if it creates them it might accept strings
    };

    if (estimatedHours) {
      dto.customFields = [
        {
          customFieldId: "estimated_time",
          value: estimatedHours
        }
      ];
    }

    onSubmit(dto);

    // Reset form after submit
    setTitle("");
    setDescription("");
    setAssigneeIds([]);
    setDueDate(undefined);
    setEstimatedHours("");
    setTags([]);
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                        "justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Select date</span>}
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

            <div className="grid gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Estimated time (Hours)
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-9 pr-12"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                  Hour
                </span>
              </div>
            </div>

            <div className="grid gap-2">{/* Spacer for grid */}</div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Tags
            </label>
            <div className="flex flex-col gap-2">
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Input
                placeholder="Add new tags (Press Enter)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
            </div>
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
