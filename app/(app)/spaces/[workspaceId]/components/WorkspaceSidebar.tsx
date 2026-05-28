"use client";

import { useRef } from "react";
import { Plus, Building2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent
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
  isLoading
}: WorkspaceSidebarProps) {
  const { data: storage, isLoading: isStorageLoading } =
    useTenantStorage(tenantId);

  const queryClient = useQueryClient();
  const { mutateAsync: reorderFolders } = useReorderFolders();
  const { mutateAsync: reorderBoards } = useReorderBoards();

  const sensors = useSensors(
    useSensor(PointerSensor, {
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

  const rootBoards = boardsByFolder["uncategorized"] || [];
  const folderItems = folders.map((f) => folderDndId(f.id));
  const rootBoardItems = rootBoards.map((b) => boardDndId(b.id));

  const { setNodeRef: setRootDropRef } = useDroppable({ id: rootDropId });

  const dragStateRef = useRef<{
    originalBoards: Board[] | null;
  }>({ originalBoards: null });

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

    const containerOrder: Array<string | null> = [null, ...folders.map((f) => f.id)];
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
    const safeIndex = Math.max(0, Math.min(insertAtIndex ?? targetContainer.length, targetContainer.length));
    const moved: Board = {
      ...activeBoard,
      folderId: targetFolderId ?? undefined
    };
    const nextTarget = [...targetContainer];
    nextTarget.splice(safeIndex, 0, moved);
    const nextTargetWithOrder = nextTarget.map((b: Board, idx: number) => ({ ...b, order: idx }));

    byContainer.set(originFolderId, nextOrigin);
    byContainer.set(targetFolderId, nextTargetWithOrder);

    const nextBoards = containerOrder.flatMap((fid) => byContainer.get(fid) || []);

    queryClient.setQueryData(
      boardsQueryKey(tenantId, workspaceId),
      nextBoards
    );
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("folder-") && overId.startsWith("folder-")) {
      const previousFolders =
        queryClient.getQueryData<Folder[]>(foldersQueryKey(tenantId, workspaceId)) ||
        folders;

      const oldIndex = previousFolders.findIndex(
        (f) => folderDndId(f.id) === activeId
      );
      const newIndex = previousFolders.findIndex(
        (f) => folderDndId(f.id) === overId
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
          folderId: activeId.slice("folder-".length),
          targetIndex: newIndex
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

    const containerOrder: Array<string | null> = [null, ...folders.map((f) => f.id)];

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
    const originIndex = originContainer.findIndex((b) => b.id === activeBoardId);
    if (originIndex < 0 || targetIndex == null) return;

    const targetContainer = byContainer.get(targetFolderId) || [];

    if (originFolderId === targetFolderId) {
      if (originIndex === targetIndex) return;

      const nextContainer = arrayMove(originContainer, originIndex, targetIndex);
      byContainer.set(
        targetFolderId,
        nextContainer.map((b: Board, idx: number) => ({ ...b, order: idx }))
      );
    } else {
      const nextOrigin = originContainer
        .filter((b) => b.id !== activeBoardId)
        .map((b: Board, idx: number) => ({ ...b, order: idx }));

      const insertIndex = Math.max(0, Math.min(targetIndex, targetContainer.length));
      const moved: Board = {
        ...activeBoard,
        folderId: targetFolderId ?? undefined
      };

      const nextTarget = [...targetContainer];
      nextTarget.splice(insertIndex, 0, moved);
      const nextTargetWithOrder = nextTarget.map((b: Board, idx: number) => ({ ...b, order: idx }));

      byContainer.set(originFolderId, nextOrigin);
      byContainer.set(targetFolderId, nextTargetWithOrder);
    }

    const nextBoards = containerOrder.flatMap((fid) => byContainer.get(fid) || []);

    queryClient.setQueryData(
      boardsQueryKey(tenantId, workspaceId),
      nextBoards
    );

    try {
      await reorderBoards({
        tenantId,
        workspaceId,
        boardId: activeBoardId,
        targetIndex,
        targetFolderId
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
      {/* Workspace Title */}
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-3">
        <Building2 className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{workspaceName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : folders.length === 0 && rootBoards.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            No folders yet.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-1">
              <SortableContext
                items={rootBoardItems}
                strategy={verticalListSortingStrategy}
              >
                <div
                  ref={setRootDropRef}
                  className="flex flex-col gap-0.5"
                >
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
