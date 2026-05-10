export interface ApiResponse<T> {
    statusCode: number;
    status: string;
    message?: string;
    data: T;
}

export type ApiEnvelope<T> = ApiResponse<T> | T;

export function unwrapApiData<T>(payload: ApiEnvelope<T>): T {
    if (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload
    ) {
        return (payload as ApiResponse<T>).data;
    }

    return payload as T;
}

export function unwrapApiArrayData<T>(payload: ApiEnvelope<T[] | T>): T[] {
    const normalized = unwrapApiData<T[] | T>(payload);

    if (Array.isArray(normalized)) {
        return normalized;
    }

    if (normalized == null) {
        return [];
    }

    return [normalized];
}

// Payload DTOs
export type CreateRoleDto = Record<string, unknown>;
export type UpdateRoleDto = Record<string, unknown>;
export type InviteMemberDto = Record<string, unknown>;
export type UpdateMemberRoleDto = Record<string, unknown>;
export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    color?: string;
}

export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    color?: string;
}
export type AddWorkspaceMemberDto = Record<string, unknown>;
export type CreateFolderDto = Record<string, unknown>;
export type UpdateFolderDto = Record<string, unknown>;
export type CreateBoardDto = Record<string, unknown>;
export type UpdateBoardDto = Record<string, unknown>;
export type CreateColumnDto = Record<string, unknown>;
export type ColumnOrderDto = Record<string, unknown>;
export type ReorderColumnsDto = Record<string, unknown>;
export type UpdateColumnDto = Record<string, unknown>;
export type CreateDocumentDto = Record<string, unknown>;
export type UpdateDocumentDto = Record<string, unknown>;
export interface CreateTaskDto {
    columnId: string;
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    assigneeIds?: string[];
    tagIds?: string[];
    customFields?: { customFieldId: string; value: string }[];
}
export type UpdateTaskDto = Record<string, unknown>;
export type MoveTaskDto = Record<string, unknown>;

// Auth Me
export interface AuthMeUser {
    id: string;
    email: string;
    username: string;
    fullName: string;
    avatarUrl: string | null;
}

export interface AuthMeTenantRole {
    id: string;
    name: string;
    isDefault: boolean;
}

export interface AuthMeTenant {
    tenant: {
        id: string;
        name: string;
        domain: string | null;
        logoUrl: string | null;
    };
    role: AuthMeTenantRole;
    permissions: string[];
}

export interface AuthMeResponse {
    user: AuthMeUser;
    tenants: AuthMeTenant[];
}

export interface Tenant {
    id: string;
    name: string;
    domain: string | null;
    logoUrl: string | null;
    [key: string]: unknown;
}

export interface Permission {
    id: string;
    name: string;
    description: string | null;
    module: string;
    createdAt: string;
    [key: string]: unknown;
}

export interface RolePermission {
    roleId: string;
    permissionId: string;
    permission: Permission;
    [key: string]: unknown;
}

export interface Role {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    isDefault: boolean;
    totalMember: number;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    permissions: RolePermission[];
    [key: string]: unknown;
}

export interface Member {
    id: string;
    userId?: string;
    email?: string;
    username?: string;
    fullName?: string;
    role?: AuthMeTenantRole | string | null;
    status?: string;
    joinedAt?: string | null;
    spaceAccess?: string;
    [key: string]: unknown;
}

export interface Workspace {
    id: string;
    tenantId?: string;
    name?: string;
    description?: string | null;
    color?: string | null;
    imageUrl?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    deletedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
    [key: string]: unknown;
}

export interface Folder {
    id: string;
    workspaceId?: string;
    name?: string;
    [key: string]: unknown;
}

export interface Board {
    id: string;
    workspaceId?: string;
    folderId?: string;
    name?: string;
    color?: string;
    [key: string]: unknown;
}

export interface Column {
    id: string;
    boardId?: string;
    name?: string;
    order?: number;
    [key: string]: unknown;
}

export interface Document {
    id: string;
    folderId?: string;
    workspaceId?: string;
    name?: string;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface Task {
    id: string;
    boardId?: string;
    columnId?: string;
    title?: string;
    description?: string | null;
    priority?: string | null;
    assignees?: { userId: string; user?: AuthMeUser }[];
    assigneeIds?: string[];
    subtaskCount?: number;
    completedSubtaskCount?: number;
    tags?: any[];
    customFieldValues?: any[];
    attachments?: any[];
    dueDate?: string | null;
    finishDate?: string | null;
    order?: number;
    createdBy?: string;
    updatedBy?: string | null;
    creator?: AuthMeUser | null;
    updater?: AuthMeUser | null;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface Subtask {
    id: string;
    taskId: string;
    title: string;
    isDone: boolean;
    position: number;
    createdBy?: string;
    updatedBy?: string | null;
    createdAt?: string;
    updatedAt?: string;
    creator?: AuthMeUser | null;
    updater?: AuthMeUser | null;
}

export interface TaskActivity {
    id: string;
    tenantId: string;
    userId: string;
    entityType: string;
    entityId: string;
    action: string;
    details: Record<string, any>;
    createdAt: string;
    user: AuthMeUser;
}

export interface Attachment {
    id: string;
    taskId: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    createdBy: string;
    createdAt: string;
    creator?: AuthMeUser;
}
