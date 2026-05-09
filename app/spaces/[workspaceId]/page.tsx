"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useWorkspaces } from "@/hooks/api/useWorkspaces";
import {
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder
} from "@/hooks/api/useFolders";
import { documentsQueryKey, useCreateDocument } from "@/hooks/api/useDocuments";
import { useBoards } from "@/hooks/api/useBoards";
import {
  useKanbanColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn
} from "@/hooks/api/useKanbanColumns";
import { useTasks, useCreateTask, useMoveTask } from "@/hooks/api/useTasks";
import apiClient from "@/lib/apiClient";
import { unwrapApiArrayData } from "@/types/api";
import type { DocumentsEnvelope } from "@/types/type-documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Document } from "@/types/type-documents";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { ViewTabs, type ViewType } from "./components/ViewTabs";
import { BoardView } from "./components/BoardView";
import { ListView } from "./components/ListView";
import { GanttView } from "./components/GanttView";

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

  // Fetch documents for all folders using useQueries
  const documentQueries = useQueries({
    queries: folders.map((folder) => ({
      queryKey: documentsQueryKey(tenantId, workspaceId, folder.id),
      queryFn: async () => {
        const { data } = await apiClient.get<DocumentsEnvelope>(
          `/api/tenants/${tenantId}/workspaces/${workspaceId}/folders/${folder.id}/documents`
        );
        return unwrapApiArrayData(data);
      },
      enabled: !!tenantId && !!workspaceId && !!folder.id
    }))
  });

  const documentsByFolder = useMemo(() => {
    const map: Record<string, Document[]> = {};
    folders.forEach((folder, i) => {
      map[folder.id] = documentQueries[i]?.data || [];
    });
    return map;
  }, [folders, documentQueries]);

  const allDocuments = useMemo(
    () => Object.values(documentsByFolder).flat(),
    [documentsByFolder]
  );

  const activeDocument = useMemo(
    () => allDocuments.find((d) => d.id === activeDocumentId) || null,
    [allDocuments, activeDocumentId]
  );

  // Auto-select first document when data loads
  useEffect(() => {
    if (!activeDocumentId && allDocuments.length > 0) {
      const firstDoc = allDocuments[0];
      setActiveDocumentId(firstDoc.id);
      // Try to use document's boardId if available, otherwise first board
      const boardId = (firstDoc as unknown as Record<string, unknown>)
        .boardId as string | undefined;
      if (boardId) {
        setActiveBoardId(boardId);
      } else if (boards.length > 0) {
        setActiveBoardId(boards[0].id);
      }
    }
  }, [activeDocumentId, allDocuments, boards]);

  // When document changes, update board
  const handleSelectDocument = (doc: Document) => {
    setActiveDocumentId(doc.id);
    const boardId = (doc as unknown as Record<string, unknown>).boardId as
      | string
      | undefined;
    if (boardId) {
      setActiveBoardId(boardId);
    } else if (boards.length > 0) {
      setActiveBoardId(boards[0].id);
    }
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

  // Mutations
  const { mutate: createFolder } = useCreateFolder();
  const { mutate: updateFolder } = useUpdateFolder();
  const { mutate: deleteFolder } = useDeleteFolder();
  const { mutate: createDocument } = useCreateDocument();
  const { mutate: createColumn } = useCreateColumn();
  const { mutate: updateColumn } = useUpdateColumn();
  const { mutate: deleteColumn } = useDeleteColumn();
  const { mutate: createTask } = useCreateTask();
  const { mutate: moveTask } = useMoveTask();

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
    <div className="flex h-full w-full overflow-hidden">
      {/* Secondary Sidebar */}
      <WorkspaceSidebar
        workspaceName={workspace?.name || "Workspace"}
        folders={folders}
        documentsByFolder={documentsByFolder}
        activeDocumentId={activeDocumentId}
        onSelectDocument={handleSelectDocument}
        onCreateFolder={() => {
          const name = window.prompt("Folder name");
          if (name?.trim()) {
            createFolder({ tenantId, workspaceId, dto: { name: name.trim() } });
          }
        }}
        onCreateDocument={(folderId) => {
          const name = window.prompt("Document name");
          if (name?.trim()) {
            createDocument({
              tenantId,
              workspaceId,
              folderId,
              dto: { name: name.trim() }
            });
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
        isLoading={isFoldersLoading || documentQueries.some((q) => q.isLoading)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
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
                if (!activeBoardId) return;
                const title = window.prompt("Task title");
                if (title?.trim()) {
                  const firstColumnId = columns[0]?.id;
                  if (firstColumnId) {
                    createTask({
                      tenantId,
                      workspaceId,
                      boardId: activeBoardId,
                      dto: { title: title.trim(), columnId: firstColumnId }
                    });
                  }
                }
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-4">
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
              onCreateTask={(columnId, title) =>
                activeBoardId &&
                createTask({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  dto: { title, columnId }
                })
              }
              onMoveTask={(taskId, columnId) =>
                activeBoardId &&
                moveTask({
                  tenantId,
                  workspaceId,
                  boardId: activeBoardId,
                  taskId,
                  dto: { columnId }
                })
              }
            />
          )}
          {activeView === "list" && <ListView tasks={filteredTasks} />}
          {activeView === "gantt" && <GanttView tasks={filteredTasks} />}
        </div>
      </div>
    </div>
  );
}
