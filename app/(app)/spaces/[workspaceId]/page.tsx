"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2, Plus, Search, Settings2 } from "lucide-react";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import {
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder
} from "@/hooks/api/useFolders";
import {
  useBoards,
  useCreateBoard,
  useUpdateBoard,
  useDeleteBoard
} from "@/hooks/api/useBoards";
import {
  columnsQueryKey,
  useKanbanColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useReorderColumns
} from "@/hooks/api/useKanbanColumns";
import {
  taskDetailQueryKey,
  tasksQueryKey,
  useTasks,
  useCreateTask,
  useMoveTask,
  useDeleteTask
} from "@/hooks/api/useTasks";
import type { Board } from "@/types/type-boards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { ViewTabs, type ViewType } from "./components/ViewTabs";
import { BoardView } from "./components/BoardView";
import { ListView } from "./components/ListView";
import { GanttView } from "./components/GanttView";
import { CreateTaskDialog } from "./components/CreateTaskDialog";
import { NameDialog } from "./components/NameDialog";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RenameBoardDialog } from "./components/RenameBoardDialog";
import { CustomFieldManager } from "./components/CustomFieldManager";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { useTenantMembers } from "@/hooks/api/useTenantMembers";
import type { CreateTaskDto, Member } from "@/types/api";
import { useTenantSocket } from "@/hooks/useTenantSocket";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const workspaceId = (params.workspaceId as string) || "";

  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const tenantId = authMe?.tenants?.[0]?.tenant?.id ?? "";

  const { data: workspaces = [], isLoading: isWorkspacesLoading } =
    useWorkspaces(tenantId);
  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId),
    [workspaces, workspaceId]
  );

  const { data: folders = [], isLoading: isFoldersLoading } = useFolders(
    tenantId,
    workspaceId
  );
  const { data: boards = [], isLoading: isBoardsLoading } = useBoards(
    tenantId,
    workspaceId
  );

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [creatingInColumnId, setCreatingInColumnId] = useState<
    string | undefined
  >(undefined);

  const [isRenameBoardOpen, setIsRenameBoardOpen] = useState(false);
  const [isCustomFieldManagerOpen, setIsCustomFieldManagerOpen] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // NameDialog state for folder/document operations
  const [nameDialog, setNameDialog] = useState<{
    open: boolean;
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    submitLabel?: string;
    onSubmit: (value: string) => void;
  }>({ open: false, title: "", onSubmit: () => {} });

  const boardsByFolder = useMemo(() => {
    const map: Record<string, Board[]> = {};
    boards.forEach((board) => {
      const folderId = board.folderId || "uncategorized";
      if (!map[folderId]) map[folderId] = [];
      map[folderId].push(board);
    });
    return map;
  }, [boards]);

  const activeDocument = useMemo(
    () => boards.find((b) => b.id === activeDocumentId) || null,
    [boards, activeDocumentId]
  );

  // Auto-select first board when data loads
  useEffect(() => {
    if (!activeDocumentId && boards.length > 0) {
      const firstBoard = boards[0];
      setActiveDocumentId(firstBoard.id);
      setActiveBoardId(firstBoard.id);
    }
  }, [activeDocumentId, boards]);

  // When board changes, update active board
  const handleSelectDocument = (board: Board) => {
    setActiveDocumentId(board.id);
    setActiveBoardId(board.id);
  };

  // Column & Task queries for active board
  const { data: columns = [] } = useKanbanColumns(
    tenantId,
    workspaceId,
    activeBoardId || ""
  );

  console.log("columns:", columns);
  const { data: tasks = [] } = useTasks(
    tenantId,
    workspaceId,
    activeBoardId || ""
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter((t) => (t.title || "").toLowerCase().includes(q));
  }, [tasks, searchQuery]);

  const { data: membersData } = useTenantMembers(tenantId, 1, 100);
  const members = useMemo<Member[]>(() => {
    return (membersData?.activeMembers || []).map((m) => ({
      id: m.userId,
      userId: m.userId,
      email: m.user.email,
      username: m.user.username,
      fullName: m.user.fullName,
      avatarUrl: m.user.avatarUrl
    }));
  }, [membersData]);

  console.log("membersData123:", membersData);

  // Mutations
  const { mutate: createFolder } = useCreateFolder();
  const { mutate: updateFolder } = useUpdateFolder();
  const { mutate: deleteFolder } = useDeleteFolder();
  const { mutate: createBoard } = useCreateBoard();
  const { mutate: updateBoard } = useUpdateBoard();
  const { mutate: deleteBoard } = useDeleteBoard();
  const { mutate: createColumn } = useCreateColumn();
  const { mutate: updateColumn } = useUpdateColumn();
  const { mutate: deleteColumn } = useDeleteColumn();
  const { mutate: reorderColumns } = useReorderColumns();
  const { mutate: createTask } = useCreateTask();
  const { mutate: moveTask } = useMoveTask();
  const { mutate: deleteTask } = useDeleteTask();
  const queryClient = useQueryClient();
  const socket = useTenantSocket(tenantId || null);

  const handleMoveTask = (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newPosition?: number
  ) => {
    if (!activeBoardId) return;
    moveTask({
      tenantId,
      workspaceId,
      boardId: activeBoardId,
      taskId,
      dto: {
        taskId,
        sourceColumnId,
        destinationColumnId,
        newPosition
      }
    });
  };

  useEffect(() => {
    if (!socket || !tenantId || !workspaceId || !activeBoardId) return;

    const columnsKey = columnsQueryKey(tenantId, workspaceId, activeBoardId);
    const tasksKey = tasksQueryKey(tenantId, workspaceId, activeBoardId);

    const invalidateColumns = () => {
      queryClient.invalidateQueries({ queryKey: columnsKey });
    };

    const handleTaskEvent = (payload: any) => {
      queryClient.invalidateQueries({ queryKey: tasksKey });
      if (
        selectedTaskId &&
        payload?.taskId === selectedTaskId &&
        payload?.boardId === activeBoardId
      ) {
        queryClient.invalidateQueries({
          queryKey: taskDetailQueryKey(
            tenantId,
            workspaceId,
            activeBoardId,
            payload.taskId
          )
        });
      }
    };

    const columnEvents = [
      "column.created",
      "column.updated",
      "column.reordered",
      "column.deleted"
    ];
    columnEvents.forEach((event) => socket.on(event, invalidateColumns));

    const taskEvents = [
      "task.created",
      "task.updated",
      "task.reordered",
      "task.moved",
      "task.deleted"
    ];
    taskEvents.forEach((event) => socket.on(event, handleTaskEvent));

    return () => {
      columnEvents.forEach((event) => socket.off(event, invalidateColumns));
      taskEvents.forEach((event) => socket.off(event, handleTaskEvent));
    };
  }, [
    socket,
    tenantId,
    workspaceId,
    activeBoardId,
    queryClient,
    selectedTaskId
  ]);

  const isLoading =
    isAuthLoading || isWorkspacesLoading || isFoldersLoading || isBoardsLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!tenantId || !workspaceId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Workspace not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full gap-2 pr-2 overflow-hidden">
      {/* Secondary Sidebar */}
      <WorkspaceSidebar
        workspaceName={workspace?.name || "Workspace"}
        tenantId={tenantId}
        folders={folders}
        boardsByFolder={boardsByFolder}
        activeDocumentId={activeDocumentId}
        onSelectDocument={handleSelectDocument}
        onCreateFolder={() => {
          setNameDialog({
            open: true,
            title: "New Folder",
            description: "Enter a name for the new folder.",
            placeholder: "Folder name",
            submitLabel: "Create",
            onSubmit: (name) => {
              createFolder({ tenantId, workspaceId, dto: { name } });
            }
          });
        }}
        onCreateDocument={(folderId) => {
          setNameDialog({
            open: true,
            title: "New Document",
            description: "Enter a name for the new document.",
            placeholder: "Document name",
            submitLabel: "Create",
            onSubmit: (name) => {
              createBoard({ tenantId, workspaceId, dto: { name, folderId } });
            }
          });
        }}
        onRenameDocumentSubmit={(boardId, name) => {
          updateBoard({
            tenantId,
            workspaceId,
            boardId,
            dto: { name }
          });
        }}
        onDeleteDocument={(board) => {
          setConfirmDialog({
            open: true,
            title: "Delete Document",
            description: `Are you sure you want to delete "${board.name}"? This action cannot be undone.`,
            onConfirm: () =>
              deleteBoard({ tenantId, workspaceId, boardId: board.id })
          });
        }}
        onRenameFolderSubmit={(folderId, name) => {
          updateFolder({
            tenantId,
            workspaceId,
            folderId,
            dto: { name }
          });
        }}
        onDeleteFolder={(folder) => {
          setConfirmDialog({
            open: true,
            title: "Delete Folder",
            description: `Are you sure you want to delete "${folder.name}"? This action cannot be undone.`,
            onConfirm: () =>
              deleteFolder({ tenantId, workspaceId, folderId: folder.id })
          });
        }}
        isLoading={isFoldersLoading || isBoardsLoading}
      />

      {/* Main Content */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {activeDocument?.name || "Select a document"}
              </h1>
              {activeDocument && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsRenameBoardOpen(true)}
                >
                  Rename
                </Button>
              )}
            </div>
            <ViewTabs activeView={activeView} onChange={setActiveView} />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-64 pl-8 text-sm"
              />
            </div>
            {activeBoardId && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setIsCustomFieldManagerOpen(true)}
              >
                <Settings2 className="h-3.5 w-3.5" />
                Custom Fields
              </Button>
            )}
            <Button
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => {
                setCreatingInColumnId(undefined);
                setIsCreateTaskOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 p-4">
          {!activeBoardId && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No board available. Select a document or create a board.
            </div>
          )}
          {activeView === "board" && activeBoardId && (
            <BoardView
              columns={columns}
              tasks={filteredTasks}
              onCreateColumn={(name, isDone) =>
                activeBoardId &&
                createColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  dto: { name, isDone }
                })
              }
              onUpdateColumn={(columnId, name, isDone) =>
                activeBoardId &&
                updateColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  columnId,
                  dto: { name, isDone }
                })
              }
              onDeleteColumn={(columnId) =>
                activeBoardId &&
                deleteColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  columnId
                })
              }
              onReorderColumns={(newOrder) =>
                activeBoardId &&
                reorderColumns({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  dto: { columns: newOrder }
                })
              }
              onCreateTask={(columnId) => {
                setCreatingInColumnId(columnId);
                setIsCreateTaskOpen(true);
              }}
              onMoveTask={handleMoveTask}
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
              onDeleteTask={(taskId) =>
                activeBoardId &&
                deleteTask({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  taskId
                })
              }
            />
          )}
          {activeView === "list" && <ListView tasks={filteredTasks} />}
          {activeView === "gantt" && <GanttView tasks={filteredTasks} />}
        </div>
      </div>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        columns={columns}
        defaultColumnId={creatingInColumnId}
        members={members}
        tenantId={tenantId}
        workspaceId={workspaceId}
        boardId={activeBoardId || ""}
        onSubmit={(dto: CreateTaskDto) => {
          if (activeBoardId) {
            createTask({
              tenantId,
              workspaceId,
              boardId: activeBoardId,
              dto
            });
            setIsCreateTaskOpen(false);
          }
        }}
      />
      <NameDialog
        open={nameDialog.open}
        onOpenChange={(open) => {
          if (!open) setNameDialog((prev) => ({ ...prev, open: false }));
        }}
        title={nameDialog.title}
        description={nameDialog.description}
        placeholder={nameDialog.placeholder}
        defaultValue={nameDialog.defaultValue}
        submitLabel={nameDialog.submitLabel}
        onSubmit={nameDialog.onSubmit}
      />
      <RenameBoardDialog
        open={isRenameBoardOpen}
        onOpenChange={setIsRenameBoardOpen}
        currentName={activeDocument?.name || ""}
        onSubmit={(name) => {
          if (activeBoardId) {
            updateBoard({
              tenantId,
              workspaceId,
              boardId: activeBoardId,
              dto: { name }
            });
          }
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
      {activeBoardId && (
        <CustomFieldManager
          tenantId={tenantId}
          workspaceId={workspaceId}
          boardId={activeBoardId}
          open={isCustomFieldManagerOpen}
          onOpenChange={setIsCustomFieldManagerOpen}
        />
      )}
      {activeDocumentId && (
        <TaskDetailSheet
          tenantId={tenantId}
          workspaceId={workspaceId}
          boardId={activeDocumentId}
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
          columns={columns}
          members={members}
        />
      )}
    </div>
  );
}
