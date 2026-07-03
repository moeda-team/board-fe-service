"use client";

import { useRef, useState, useEffect } from "react";
import {
  Plus,
  Building2,
  ChevronDown,
  Check,
  GripVertical,
  Folder as FolderIcon,
  FolderOpen,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import type { Folder } from "@/types/type-folders";
import type { Board } from "@/types/type-boards";
import { Button } from "@/components/ui/button";
import { FolderTree } from "./FolderTree";
import { useTenantStorage } from "@/hooks/api/useTenantStorage";
import { boardsQueryKey, useReorderBoards } from "@/hooks/api/useBoards";
import { foldersQueryKey, useReorderFolders } from "@/hooks/api/useFolders";
import { DocumentNavItem } from "./DocumentNavItem";

interface WorkspaceSidebarProps {
  workspaceName: string;
  tenantId: string;
  workspaceId: string;
  workspaces: { id: string; name: string }[];
  onSwitchWorkspace: (workspaceId: string) => void;
  folders: Folder[];
  boardsByFolder: Record<string, Board[]>;
  activeDocumentId: string | null;
  onSelectDocument: (board: Board) => void;
  onCreateFolder: () => void;
  onCreateDocument: (folderId: string) => void;
  onRenameFolderSubmit: (folderId: string, name: string) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameDocumentSubmit: (boardId: string, name: string) => void;
  onDeleteDocument: (board: Board) => void;
  onReorderFolder?: (folderId: string, targetIndex: number) => void;
  onReorderDocument?: (
    boardId: string,
    targetIndex: number,
    targetFolderId: string
  ) => void;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function WorkspaceSidebar({
  workspaceName,
  tenantId,
  workspaceId,
  workspaces,
  onSwitchWorkspace,
  folders,
  boardsByFolder,
  activeDocumentId,
  onSelectDocument,
  onCreateFolder,
  onCreateDocument,
  onRenameFolderSubmit,
  onDeleteFolder,
  onRenameDocumentSubmit,
  onDeleteDocument,
  onReorderFolder,
  onReorderDocument,
  isLoading
}: WorkspaceSidebarProps) {
  const [localFolders, setLocalFolders] = useState<Folder[]>(folders);
  const [localBoardsByFolder, setLocalBoardsByFolder] =
    useState<Record<string, Board[]>>(boardsByFolder);
  const [isMounted, setIsMounted] = useState(false);
  const { data: storage, isLoading: isStorageLoading } =
    useTenantStorage(tenantId);

  const queryClient = useQueryClient();
  const { mutateAsync: reorderFolders } = useReorderFolders();
  const { mutateAsync: reorderBoards } = useReorderBoards();

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor)
  );

  const folderDndId = (folderId: string) => `folder-${folderId}`;
  const boardDndId = (boardId: string) => `board-${boardId}`;
  const folderDropId = (folderId: string) => `folder-drop-${folderId}`;
  const rootDropId = "root-drop";

  const customCollisionDetection = (
    args: Parameters<typeof pointerWithin>[0]
  ) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions && pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const rootBoards = boardsByFolder["uncategorized"] || [];
  const folderItems = folders.map((f) => folderDndId(f.id));
  const rootBoardItems = rootBoards.map((b) => boardDndId(b.id));

  const { setNodeRef: setRootDropRef } = useDroppable({ id: rootDropId });

  const dragStateRef = useRef<{
    originalBoards: Board[] | null;
  }>({ originalBoards: null });

  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragActiveId(String(active.id));
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (!activeId.startsWith("board-")) return;

    const currentBoards = queryClient.getQueryData<Board[]>(
      boardsQueryKey(tenantId, workspaceId)
    );
    if (!currentBoards) return;

    const activeBoardId = activeId.slice("board-".length);
    const activeBoard = currentBoards.find((b) => b.id === activeBoardId);
    if (!activeBoard) return;

    if (!dragStateRef.current.originalBoards) {
      dragStateRef.current.originalBoards = [...currentBoards];
    }

    const originFolderId = activeBoard.folderId ?? null;

    let targetFolderId: string | null = null;
    let insertAtIndex: number | null = null;

    if (overId.startsWith("board-")) {
      const overBoardId = overId.slice("board-".length);
      const overBoard = currentBoards.find((b) => b.id === overBoardId);
      targetFolderId = overBoard?.folderId ?? null;
      const targetBoards = currentBoards.filter(
        (b) => (b.folderId ?? null) === targetFolderId
      );
      insertAtIndex = targetBoards.findIndex((b) => b.id === overBoardId);
      if (insertAtIndex < 0) insertAtIndex = targetBoards.length;
    } else if (overId.startsWith("folder-drop-")) {
      targetFolderId = overId.slice("folder-drop-".length);
      const targetBoards = currentBoards.filter(
        (b) => (b.folderId ?? null) === targetFolderId
      );
      insertAtIndex = targetBoards.length;
    } else if (overId === rootDropId) {
      targetFolderId = null;
      const targetBoards = currentBoards.filter(
        (b) => (b.folderId ?? null) === null
      );
      insertAtIndex = targetBoards.length;
    } else if (overId.startsWith("folder-")) {
      targetFolderId = overId.slice("folder-".length);
      const targetBoards = currentBoards.filter(
        (b) => (b.folderId ?? null) === targetFolderId
      );
      insertAtIndex = targetBoards.length;
    } else {
      return;
    }

    if (originFolderId === targetFolderId) return;

    const containerOrder: Array<string | null> = [
      null,
      ...folders.map((f) => f.id)
    ];
    const byContainer = new Map<string | null, Board[]>();
    for (const fid of containerOrder) {
      byContainer.set(fid, []);
    }
    for (const b of currentBoards) {
      const fid = b.folderId ?? null;
      if (!byContainer.has(fid)) byContainer.set(fid, []);
      byContainer.get(fid)?.push(b);
    }

    const originContainer = byContainer.get(originFolderId) || [];
    const nextOrigin = originContainer
      .filter((b) => b.id !== activeBoardId)
      .map((b: Board, idx: number) => ({ ...b, order: idx }));

    const targetContainer = byContainer.get(targetFolderId) || [];
    const safeIndex = Math.max(
      0,
      Math.min(insertAtIndex ?? targetContainer.length, targetContainer.length)
    );
    const moved: Board = {
      ...activeBoard,
      folderId: targetFolderId ?? undefined
    };
    const nextTarget = [...targetContainer];
    nextTarget.splice(safeIndex, 0, moved);
    const nextTargetWithOrder = nextTarget.map((b: Board, idx: number) => ({
      ...b,
      order: idx
    }));

    byContainer.set(originFolderId, nextOrigin);
    byContainer.set(targetFolderId, nextTargetWithOrder);

    const nextBoards = containerOrder.flatMap(
      (fid) => byContainer.get(fid) || []
    );

    queryClient.setQueryData(boardsQueryKey(tenantId, workspaceId), nextBoards);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setDragActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    let resolvedOverId = overId;
    if (activeId.startsWith("folder-") && overId.startsWith("board-")) {
      const overBoardId = overId.slice("board-".length);
      const allBoards = Object.values(boardsByFolder).flat();
      const overBoard = allBoards.find((b) => b.id === overBoardId);
      if (overBoard?.folderId) {
        resolvedOverId = folderDndId(overBoard.folderId);
      }
    }

    if (
      activeId.startsWith("folder-") &&
      resolvedOverId.startsWith("folder-")
    ) {
      const previousFolders =
        queryClient.getQueryData<Folder[]>(
          foldersQueryKey(tenantId, workspaceId)
        ) || folders;

      const oldIndex = previousFolders.findIndex(
        (f) => folderDndId(f.id) === activeId
      );
      const newIndex = previousFolders.findIndex(
        (f) => folderDndId(f.id) === resolvedOverId
      );

      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const nextFolders = arrayMove(previousFolders, oldIndex, newIndex).map(
        (f: Folder, idx: number) => ({ ...f, order: idx })
      );

      queryClient.setQueryData(
        foldersQueryKey(tenantId, workspaceId),
        nextFolders
      );

      try {
        await reorderFolders({
          tenantId,
          workspaceId,
          dto: {
            folderId: activeId.slice("folder-".length),
            targetIndex: newIndex
          }
        });
      } catch {
        queryClient.setQueryData(
          foldersQueryKey(tenantId, workspaceId),
          previousFolders
        );
        queryClient.invalidateQueries({
          queryKey: foldersQueryKey(tenantId, workspaceId)
        });
      }

      return;
    }

    if (!activeId.startsWith("board-")) return;

    const previousBoards = queryClient.getQueryData<Board[]>(
      boardsQueryKey(tenantId, workspaceId)
    );

    if (!previousBoards) return;

    const activeBoardId = activeId.slice("board-".length);
    const activeBoard = previousBoards.find((b) => b.id === activeBoardId);
    if (!activeBoard) return;

    const containerOrder: Array<string | null> = [
      null,
      ...folders.map((f) => f.id)
    ];

    const byContainer = new Map<string | null, Board[]>();
    for (const fid of containerOrder) {
      byContainer.set(fid, []);
    }
    for (const b of previousBoards) {
      const fid = b.folderId ?? null;
      if (!byContainer.has(fid)) byContainer.set(fid, []);
      byContainer.get(fid)?.push(b);
    }

    const originFolderId = activeBoard.folderId ?? null;

    const resolveBoardFolderId = (boardId: string) =>
      previousBoards.find((b) => b.id === boardId)?.folderId ?? null;

    let targetFolderId: string | null = null;
    let targetIndex: number | null = null;

    if (overId.startsWith("board-")) {
      const overBoardId = overId.slice("board-".length);
      targetFolderId = resolveBoardFolderId(overBoardId);
      const targetContainer = byContainer.get(targetFolderId) || [];
      targetIndex = targetContainer.findIndex((b) => b.id === overBoardId);
      if (targetIndex < 0) targetIndex = targetContainer.length;
    } else if (overId.startsWith("folder-drop-")) {
      targetFolderId = overId.slice("folder-drop-".length);
      const targetContainer = byContainer.get(targetFolderId) || [];
      targetIndex = targetContainer.length;
    } else if (overId === rootDropId) {
      targetFolderId = null;
      const targetContainer = byContainer.get(null) || [];
      targetIndex = targetContainer.length;
    } else if (overId.startsWith("folder-")) {
      targetFolderId = overId.slice("folder-".length);
      const targetContainer = byContainer.get(targetFolderId) || [];
      targetIndex = targetContainer.length;
    } else {
      return;
    }

    const originContainer = byContainer.get(originFolderId) || [];
    const originIndex = originContainer.findIndex(
      (b) => b.id === activeBoardId
    );
    if (originIndex < 0 || targetIndex == null) return;

    const targetContainer = byContainer.get(targetFolderId) || [];

    if (originFolderId === targetFolderId) {
      if (originIndex === targetIndex) return;

      const nextContainer = arrayMove(
        originContainer,
        originIndex,
        targetIndex
      );
      byContainer.set(
        targetFolderId,
        nextContainer.map((b: Board, idx: number) => ({ ...b, order: idx }))
      );
    } else {
      const nextOrigin = originContainer
        .filter((b) => b.id !== activeBoardId)
        .map((b: Board, idx: number) => ({ ...b, order: idx }));

      const insertIndex = Math.max(
        0,
        Math.min(targetIndex, targetContainer.length)
      );
      const moved: Board = {
        ...activeBoard,
        folderId: targetFolderId ?? undefined
      };

      const nextTarget = [...targetContainer];
      nextTarget.splice(insertIndex, 0, moved);
      const nextTargetWithOrder = nextTarget.map((b: Board, idx: number) => ({
        ...b,
        order: idx
      }));

      byContainer.set(originFolderId, nextOrigin);
      byContainer.set(targetFolderId, nextTargetWithOrder);
    }

    const nextBoards = containerOrder.flatMap(
      (fid) => byContainer.get(fid) || []
    );

    queryClient.setQueryData(boardsQueryKey(tenantId, workspaceId), nextBoards);

    try {
      await reorderBoards({
        tenantId,
        workspaceId,
        dto: {
          boardId: activeBoardId,
          targetIndex,
          targetFolderId: targetFolderId ?? ""
        }
      });
    } catch {
      const rollbackBoards =
        dragStateRef.current.originalBoards ?? previousBoards;
      queryClient.setQueryData(
        boardsQueryKey(tenantId, workspaceId),
        rollbackBoards
      );
      queryClient.invalidateQueries({
        queryKey: boardsQueryKey(tenantId, workspaceId)
      });
    } finally {
      dragStateRef.current.originalBoards = null;
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col rounded-xl border bg-sidebar text-sidebar-foreground shadow-sm overflow-hidden">
      {/* Workspace Switcher */}
      <TooltipProvider delay={300}>
        <div className="border-b border-sidebar-border px-2 py-2">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger
                render={
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 py-2 text-left hover:bg-sidebar-accent focus:outline-none"
                      >
                        <Building2 className="size-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium max-w-45">
                          {workspaceName}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      </button>
                    }
                  />
                }
              />
              <TooltipContent side="bottom" align="start">
                {workspaceName}
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-56">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => onSwitchWorkspace(ws.id)}
                  className="cursor-pointer gap-2"
                >
                  <span className="truncate">{ws.name || "Untitled"}</span>
                  {ws.id === workspaceId && (
                    <Check className="size-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : folders.length === 0 && rootBoards.length === 0 ? (
          <div className="flex flex-col gap-1">
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              No folders yet.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={onCreateFolder}
            >
              <Plus className="h-4 w-4" />
              New Folder
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-1">
              <SortableContext
                items={rootBoardItems}
                strategy={verticalListSortingStrategy}
              >
                <div ref={setRootDropRef} className="flex flex-col gap-0.5">
                  {rootBoards.map((board) => (
                    <DocumentNavItem
                      key={board.id}
                      board={board}
                      isActive={activeDocumentId === board.id}
                      onClick={() => onSelectDocument(board)}
                      onRenameSubmit={onRenameDocumentSubmit}
                      onDelete={onDeleteDocument}
                    />
                  ))}
                </div>
              </SortableContext>

              <SortableContext
                items={folderItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1">
                  {folders.map((folder) => (
                    <FolderTree
                      key={folder.id}
                      folder={folder}
                      boards={boardsByFolder[folder.id] || []}
                      activeDocumentId={activeDocumentId}
                      onSelectDocument={onSelectDocument}
                      onCreateDocument={onCreateDocument}
                      onRenameFolderSubmit={onRenameFolderSubmit}
                      onDeleteFolder={onDeleteFolder}
                      onRenameDocumentSubmit={onRenameDocumentSubmit}
                      onDeleteDocument={onDeleteDocument}
                    />
                  ))}
                </div>
              </SortableContext>

              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={onCreateFolder}
              >
                <Plus className="h-4 w-4" />
                New Folder
              </Button>
            </div>

            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)"
              }}
            >
              {dragActiveId
                ? (() => {
                    if (dragActiveId.startsWith("folder-")) {
                      const fid = dragActiveId.slice("folder-".length);
                      const folder = folders.find((f) => f.id === fid);
                      if (!folder) return null;
                      return (
                        <div
                          className="flex items-center gap-1 rounded-md border bg-background px-1 py-1 shadow-lg opacity-90"
                          style={{ width: 240 }}
                        >
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                          <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                          <span className="flex-1 truncate text-sm font-medium">
                            {folder.name || "Untitled"}
                          </span>
                        </div>
                      );
                    }
                    if (dragActiveId.startsWith("board-")) {
                      const bid = dragActiveId.slice("board-".length);
                      const allBoards = Object.values(boardsByFolder).flat();
                      const board = allBoards.find((b) => b.id === bid);
                      if (!board) return null;
                      return (
                        <div
                          className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5 shadow-lg opacity-90"
                          style={{ width: 240 }}
                        >
                          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-sm">
                            {board.name || "Untitled"}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()
                : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Storage</span>
            <span className="text-[10px] text-muted-foreground">
              {isStorageLoading
                ? "..."
                : `${storage?.percentageUsed ?? 0}% used`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-sidebar-accent border border-sidebar-border">
            <div
              className="h-full rounded-full bg-brand-blue transition-all"
              style={{ width: `${storage?.percentageUsed ?? 0}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {isStorageLoading
              ? "Loading..."
              : storage
                ? `${formatBytes(storage.usedBytes)} / ${formatBytes(storage.totalLimitBytes)}`
                : "-- / --"}
          </span>
        </div>
      </div>
    </aside>
  );
}
