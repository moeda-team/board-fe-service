"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTaskDetail } from "@/hooks/api/useTasks";
import { useTaskSubtasks, useCreateSubtask, useUpdateSubtask } from "@/hooks/api/useTaskSubtasks";
import { useTaskActivities } from "@/hooks/api/useTaskActivities";
import { useTaskAttachments, useUploadAttachment, useDeleteAttachment } from "@/hooks/api/useTaskAttachments";
import { Plus, Paperclip, CheckCircle2, Circle, Clock, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskDetailSheetProps {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailSheet({
  tenantId,
  workspaceId,
  boardId,
  taskId,
  open,
  onOpenChange,
}: TaskDetailSheetProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

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

  const { data: activities = [], isLoading: isLoadingActivities } = useTaskActivities(
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

  const { mutate: createSubtask } = useCreateSubtask();
  const { mutate: updateSubtask } = useUpdateSubtask();
  const { mutate: uploadAttachment } = useUploadAttachment();
  const { mutate: deleteAttachment } = useDeleteAttachment();

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
      e.target.value = ''; // Reset input
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
      dto: { title: newSubtaskTitle.trim() },
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
      dto: { isDone: !currentIsDone },
    });
  };

  if (!taskId) return null;

  const completedSubtasks = subtasks.filter((st) => st.isDone).length;
  const progressPct =
    subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  // Extract assignees correctly based on the API response structure
  const assigneesList = (task?.assignees || []).map((a: any) => a.user || a);
  const tagList = (task?.tags || []).map((t: any) => t.tag || t);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full data-[side=right]:sm:max-w-4xl p-0 flex flex-col gap-0 border-l">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-semibold">
            Task Information
          </SheetTitle>
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
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">{task?.title}</h2>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {task?.description || "No description provided."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {/* Status / Column (We would need columns passed down to show name, for now just show a placeholder or nothing, since task only has columnId) */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Status</span>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="h-2 w-2 rounded-full bg-brand-blue" />
                        <span>{task?.priority || "Default"}</span> {/* We might want to pass column name here */}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Priority</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          {task?.priority || "None"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Est time</span>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {task?.customFieldValues?.find((f: any) => f.customField?.name?.toLowerCase()?.includes("time"))?.value || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground font-medium">Due Date</span>
                      <div className="text-sm">
                        {task?.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "No date"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignees & Tags */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium">Assignee</span>
                    <div className="flex gap-2">
                      {assigneesList.length > 0 ? (
                        assigneesList.map((user: any) => (
                          <Avatar key={user.id || Math.random()} className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{user.fullName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
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
                            style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
                          >
                            {tag.name || tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No tags</span>
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
                          st.isDone ? "bg-muted/50" : "bg-card hover:bg-muted/30"
                        )}
                      >
                        <Checkbox
                          checked={st.isDone}
                          onCheckedChange={() => handleToggleSubtask(st.id, st.isDone)}
                          className={st.isDone ? "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" : ""}
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
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <Paperclip className="h-6 w-6 text-brand-blue mb-2" />
                    <span className="text-sm text-brand-blue font-medium">
                      Drag or click your attachment
                    </span>
                  </label>
                  
                  {attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-2">
                        {attachments.map((att: any) => (
                           <div key={att.id} className="flex items-center gap-2 p-2 border rounded bg-muted/20 text-sm group relative pr-8">
                              <Paperclip className="w-4 h-4 text-muted-foreground shrink-0" />
                              <a href={att.fileUrl} target="_blank" rel="noreferrer" className="truncate max-w-37.5 hover:underline">
                                {att.fileName}
                              </a>
                              <button 
                                onClick={() => deleteAttachment({ tenantId, workspaceId, boardId, taskId: taskId!, attachmentId: att.id })}
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
                <h3 className="font-semibold">Activity</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 flex flex-col gap-6">
                  {isLoadingActivities ? (
                    <div className="text-center text-sm text-muted-foreground">
                      Loading activity...
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">
                      No activity recorded yet.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={activity.user?.avatarUrl || undefined} />
                            <AvatarFallback>
                              {activity.user?.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-0.5">
                            <div className="text-sm">
                              <span className="font-medium text-brand-blue">
                                {activity.user?.fullName || "Unknown user"}
                              </span>{" "}
                              <span className="text-muted-foreground">
                                {activity.action.toLowerCase() === "moved"
                                  ? "Moved this task"
                                  : `${activity.action.toLowerCase()} this task`}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(activity.createdAt), "dd MMM yyyy, HH:mm")}
                            </span>
                            {/* Activity Detail extra info (like moved from X to Y) */}
                            {activity.action === "MOVED" && activity.details?.move && (
                                <div className="text-xs mt-1 bg-muted p-1.5 rounded text-muted-foreground">
                                  Moved to a new column
                                </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Optional Comment Input Box could go here */}
              <div className="p-4 border-t bg-background">
                 <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback>Me</AvatarFallback>
                    </Avatar>
                    <Input placeholder="Write a comment..." className="h-9" />
                 </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
