"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Search, Settings2 } from "lucide-react";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import { getActiveTenantId } from "@/lib/tenant";
import {
  foldersQueryKey,
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
  useReorderFolders
} from "@/hooks/api/useFolders";
import {
  boardsQueryKey,
  useBoards,
  useCreateBoard,
  useDeleteBoard,
  useReorderBoards,
  useUpdateBoard
} from "@/hooks/api/useBoards";
import {
  columnsQueryKey,
  useCreateColumn,
  useDeleteColumn,
  useKanbanColumns,
  useReorderColumns,
  useUpdateColumn
} from "@/hooks/api/useKanbanColumns";
import {
  taskDetailQueryKey,
  tasksQueryKey,
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useTasks
} from "@/hooks/api/useTasks";
import { useTenantMembers } from "@/hooks/api/useTenantMembers";
import { useTenantSocket } from "@/hooks/useTenantSocket";
import type { CreateTaskDto, Member, Task } from "@/types/api";
import type { Board } from "@/types/type-boards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { BoardView } from "./components/BoardView";
import { CreateTaskDialog } from "./components/CreateTaskDialog";
import { GanttView } from "./components/GanttView";
import {
  ListView,
  FilterPanel,
  emptyFilter,
  deriveAllTags,
  type FilterState
} from "./components/ListView";
import { NameDialog } from "./components/NameDialog";
import { RenameBoardDialog } from "./components/RenameBoardDialog";
import { CustomFieldManager } from "./components/CustomFieldManager";
import { TaskDetailSheet } from "./components/TaskDetailSheet";
import { ViewTabs, type ViewType } from "./components/ViewTabs";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = (params.workspaceId as string) || "";

  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const tenantId = getActiveTenantId(authMe);

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const [listFilter, setListFilter] = useState<FilterState>(emptyFilter);
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const [isRenameBoardOpen, setIsRenameBoardOpen] = useState(false);
  const [isCustomFieldManagerOpen, setIsCustomFieldManagerOpen] =
    useState(false);

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
  const { mutate: reorderFolders } = useReorderFolders();
  const { mutate: createBoard } = useCreateBoard();
  const { mutate: updateBoard } = useUpdateBoard();
  const { mutate: deleteBoard } = useDeleteBoard();
  const { mutate: reorderBoards } = useReorderBoards();
  const { mutate: createColumn } = useCreateColumn();
  const { mutate: updateColumn } = useUpdateColumn();
  const { mutate: deleteColumn } = useDeleteColumn();
  const { mutate: reorderColumns } = useReorderColumns();
  const { mutateAsync: createTaskAsync } = useCreateTask();

  const handleCreateTask = async (dto: CreateTaskDto) => {
    const tempId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tempTask: Task = {
      id: tempId,
      columnId: dto.columnId,
      title: dto.title,
      description: dto.description || null,
      priority: dto.priority || null,
      dueDate: dto.dueDate || null,
      assigneeIds: dto.assigneeIds || [],
      subtaskCount: 0,
      completedSubtaskCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0
    };

    setOptimisticTasks((prev) => [...prev, tempTask]);

    try {
      await createTaskAsync({
        tenantId,
        workspaceId,
        boardId: activeBoardId!,
        dto
      });
    } catch {
      // Error handled by mutation meta toast
    } finally {
      setOptimisticTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };
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

  useEffect(() => {
    if (!socket || !tenantId || !workspaceId) return;

    const foldersKey = foldersQueryKey(tenantId, workspaceId);
    const boardsKey = boardsQueryKey(tenantId, workspaceId);

    const invalidateFolders = () => {
      queryClient.invalidateQueries({ queryKey: foldersKey });
    };

    const invalidateBoards = () => {
      queryClient.invalidateQueries({ queryKey: boardsKey });
    };

    const folderEvents = [
      "folder.created",
      "folder.updated",
      "folder.reordered",
      "folder.deleted"
    ];
    folderEvents.forEach((event) => socket.on(event, invalidateFolders));

    const boardEvents = [
      "board.created",
      "board.updated",
      "board.reordered",
      "board.deleted"
    ];
    boardEvents.forEach((event) => socket.on(event, invalidateBoards));

    return () => {
      folderEvents.forEach((event) => socket.off(event, invalidateFolders));
      boardEvents.forEach((event) => socket.off(event, invalidateBoards));
    };
  }, [socket, tenantId, workspaceId, queryClient]);

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
        workspaceId={workspaceId}
        workspaces={workspaces.map((ws) => ({
          id: ws.id,
          name: ws.name || ""
        }))}
        onSwitchWorkspace={(id) => router.push(`/spaces/${id}`)}
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
        onReorderFolder={(folderId, targetIndex) => {
          reorderFolders({
            tenantId,
            workspaceId,
            dto: { folderId, targetIndex }
          });
        }}
        onReorderDocument={(boardId, targetIndex, targetFolderId) => {
          reorderBoards({
            tenantId,
            workspaceId,
            dto: { boardId, targetIndex, targetFolderId }
          });
        }}
        isLoading={isFoldersLoading || isBoardsLoading}
      />

      {/* Main Content */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
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
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Task"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 pl-8 text-sm"
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
              className="h-8 gap-1 bg-blue-600 text-xs hover:bg-blue-700"
              onClick={() => setIsCreateTaskOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center justify-between border-b px-6 py-2">
          <ViewTabs activeView={activeView} onChange={setActiveView} />
          {activeView === "list" && (
            <span className="text-xs text-gray-400">
              {members.length} members{" "}
              {members.length > 0 && "\u2022 Updated just now"}
            </span>
          )}
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
              onCreateColumn={(payload) =>
                activeBoardId &&
                createColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  dto: payload
                })
              }
              onUpdateColumn={(columnId, payload) =>
                activeBoardId &&
                updateColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  columnId,
                  dto: payload
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
              tenantId={tenantId}
              workspaceId={workspaceId}
              boardId={activeBoardId || ""}
              optimisticTasks={optimisticTasks}
              onCreateTask={handleCreateTask}
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
          {activeView === "list" && (
            <ListView
              tasks={tasks}
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
              kanbanColumns={columns}
              members={members}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCreateTask={() => setIsCreateTaskOpen(true)}
              filter={listFilter}
              setFilter={setListFilter}
              showFilterPanel={showFilterPanel}
              setShowFilterPanel={setShowFilterPanel}
            />
          )}
          {activeView === "gantt" && <GanttView tasks={filteredTasks} />}
        </div>
      </div>

      {/* Filter Panel — page-level right sidebar (pushes the layout) */}
      {activeView === "list" && showFilterPanel && (
        <FilterPanel
          filter={listFilter}
          setFilter={setListFilter}
          kanbanColumns={columns}
          members={members}
          allTags={deriveAllTags(tasks)}
          onClose={() => setShowFilterPanel(false)}
        />
      )}

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        columns={columns}
        tenantId={tenantId}
        workspaceId={workspaceId}
        boardId={activeBoardId || ""}
        onSubmit={(dto: CreateTaskDto) => {
          if (activeBoardId) {
            handleCreateTask(dto);
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
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }}
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
