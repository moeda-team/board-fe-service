"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2, Plus, Search } from "lucide-react";
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
  useMoveTask
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
      fullName: m.user.fullName
    }));
  }, [membersData]);

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
    <div className="flex h-full w-full">
      {/* Secondary Sidebar */}
      <WorkspaceSidebar
        workspaceName={workspace?.name || "Workspace"}
        folders={folders}
        boardsByFolder={boardsByFolder}
        activeDocumentId={activeDocumentId}
        onSelectDocument={handleSelectDocument}
        onCreateFolder={() => {
          const name = window.prompt("Folder name");
          if (name?.trim()) {
            createFolder({ tenantId, workspaceId, dto: { name: name.trim() } });
          }
        }}
        onCreateDocument={(folderId) => {
          const name = window.prompt("Board name");
          if (name?.trim()) {
            createBoard({
              tenantId,
              workspaceId,
              dto: { name: name.trim(), folderId }
            });
          }
        }}
        onRenameDocument={(board) => {
          const name = window.prompt("Rename board", board.name || "");
          if (name?.trim()) {
            updateBoard({
              tenantId,
              workspaceId,
              boardId: board.id,
              dto: { name: name.trim() }
            });
          }
        }}
        onDeleteDocument={(board) => {
          if (window.confirm(`Delete board "${board.name}"?`)) {
            deleteBoard({ tenantId, workspaceId, boardId: board.id });
          }
        }}
        onRenameFolder={(folder) => {
          const name = window.prompt("Rename folder", folder.name || "");
          if (name?.trim()) {
            updateFolder({
              tenantId,
              workspaceId,
              folderId: folder.id,
              dto: { name: name.trim() }
            });
          }
        }}
        onDeleteFolder={(folder) => {
          if (window.confirm(`Delete folder "${folder.name}"?`)) {
            deleteFolder({ tenantId, workspaceId, folderId: folder.id });
          }
        }}
        isLoading={isFoldersLoading || isBoardsLoading}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">
              {activeDocument?.name || "Select a document"}
            </h1>
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
        <div className="flex-1 p-4">
          {!activeBoardId && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No board available. Select a document or create a board.
            </div>
          )}
          {activeView === "board" && activeBoardId && (
            <BoardView
              columns={columns}
              tasks={filteredTasks}
              onCreateColumn={(name) =>
                activeBoardId &&
                createColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  dto: { name }
                })
              }
              onUpdateColumn={(columnId, name) =>
                activeBoardId &&
                updateColumn({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  columnId,
                  dto: { name }
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
      {activeDocumentId && (
        <TaskDetailSheet
          tenantId={tenantId}
          workspaceId={workspaceId}
          boardId={activeDocumentId}
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          onOpenChange={(open) => !open && setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
