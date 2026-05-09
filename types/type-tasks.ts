import type {
  ApiEnvelope,
  Task as TaskModel,
  CreateTaskDto as CreateTaskDtoModel,
  UpdateTaskDto as UpdateTaskDtoModel,
  MoveTaskDto as MoveTaskDtoModel
} from "@/types/api";

export type Task = TaskModel;
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
