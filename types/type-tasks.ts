import type {
  ApiEnvelope,
  Task as TaskModel,
  Subtask as SubtaskModel,
  TaskActivity as TaskActivityModel,
  Attachment as AttachmentModel,
  TaskComment as TaskCommentModel,
  CreateTaskDto as CreateTaskDtoModel,
  UpdateTaskDto as UpdateTaskDtoModel,
  MoveTaskDto as MoveTaskDtoModel
} from "@/types/api";

export type Task = TaskModel;
export type Subtask = SubtaskModel;
export type TaskActivity = TaskActivityModel;
export type Attachment = AttachmentModel;
export type TaskComment = TaskCommentModel;
export type CreateTaskDto = CreateTaskDtoModel;
export type UpdateTaskDto = UpdateTaskDtoModel;
export type MoveTaskDto = MoveTaskDtoModel;

export interface TasksParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
}

export interface CreateTaskParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  dto: CreateTaskDto;
}

export interface UpdateTaskParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  dto: UpdateTaskDto;
}

export interface DeleteTaskParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
}

export interface MoveTaskParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  dto: MoveTaskDto;
}

export type TasksEnvelope = ApiEnvelope<Task[] | Task>;
export type TaskEnvelope = ApiEnvelope<Task>;
export type SubtasksEnvelope = ApiEnvelope<Subtask[]>;
export type SubtaskEnvelope = ApiEnvelope<Subtask>;
export type TaskActivitiesEnvelope = ApiEnvelope<TaskActivity[]>;
export type AttachmentsEnvelope = ApiEnvelope<Attachment[]>;
export type TaskCommentsEnvelope = ApiEnvelope<TaskComment[]>;
export type TaskCommentEnvelope = ApiEnvelope<TaskComment>;

export interface CreateTaskCommentParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  dto: { content: string; parentId?: string | null; files?: File[] };
}

export interface UpdateTaskCommentParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  commentId: string;
  dto: { content: string };
}

export interface DeleteTaskCommentParams {
  tenantId: string;
  workspaceId: string;
  boardId: string;
  taskId: string;
  commentId: string;
}
