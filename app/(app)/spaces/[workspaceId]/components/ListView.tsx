"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildColumns } from "./columns";
import type { Task } from "@/types/type-tasks";
import type { Column } from "@/types/type-kanban-columns";
import type { Member } from "@/types/api";
import {
  ChevronDown,
  ChevronRight,
  FilterIcon,
  X,
  ArrowUpDown,
  PanelRightClose,
  PanelRightOpen,
  MoreHorizontal
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterState {
  statuses: string[];
  priorities: string[];
  assignees: string[];
  dueDate: string;
  tags: string[];
  progressMax: number;
}

interface ListViewProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  kanbanColumns?: Column[];
  members?: Member[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onCreateTask?: () => void;
  filter?: FilterState;
  setFilter?: React.Dispatch<React.SetStateAction<FilterState>>;
  showFilterPanel?: boolean;
  setShowFilterPanel?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const emptyFilter: FilterState = {
  statuses: [],
  priorities: [],
  assignees: [],
  dueDate: "",
  tags: [],
  progressMax: 100
};

/** Derive the unique set of tag names present across the given tasks. */
export function deriveAllTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  tasks.forEach((t) => {
    (t.tags || []).forEach((tg: any) => {
      const tagData = tg.tag || tg;
      const name = tagData.name || tagData.label || String(tagData);
      if (name) set.add(name);
    });
  });
  return Array.from(set);
}

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "Critical", color: "#991B1B" },
  { value: "HIGH", label: "High", color: "#DC2626" },
  { value: "MEDIUM", label: "Medium", color: "#EA580C" },
  { value: "LOW", label: "Low", color: "#6B7280" }
];

const DUE_DATE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This Week" },
  { value: "next_week", label: "Next Week" },
  { value: "overdue", label: "Overdue" },
  { value: "custom", label: "Custom Range" }
];

const STATUS_COLOR: Record<string, { color: string; dot: string }> = {
  backlog: { color: "#6B7280", dot: "#6B7280" },
  "to do": { color: "#2563EB", dot: "#2563EB" },
  "in progress": { color: "#D97706", dot: "#D97706" },
  review: { color: "#7C3AED", dot: "#7C3AED" },
  "in review": { color: "#7C3AED", dot: "#7C3AED" },
  completed: { color: "#16A34A", dot: "#16A34A" },
  blocked: { color: "#DC2626", dot: "#DC2626" }
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toggleArr(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function countActive(f: FilterState) {
  let c = 0;
  if (f.statuses.length) c++;
  if (f.priorities.length) c++;
  if (f.assignees.length) c++;
  if (f.dueDate) c++;
  if (f.tags.length) c++;
  if (f.progressMax < 100) c++;
  return c;
}

/* ------------------------------------------------------------------ */
/*  CollapsibleSection                                                 */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  action
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 px-4 py-3">
      <button
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-800"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-1.5">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          )}
          {title}
        </span>
        {action && (
          <span className="text-xs font-normal text-blue-600">{action}</span>
        )}
      </button>
      {open && <div className="mt-2 space-y-1 pl-1">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterPanel                                                        */
/* ------------------------------------------------------------------ */

export function FilterPanel({
  filter,
  setFilter,
  kanbanColumns,
  members,
  allTags,
  onClose
}: {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  kanbanColumns: Column[];
  members: Member[];
  allTags: string[];
  onClose: () => void;
}) {
  return (
    <div className="flex h-full w-75 shrink-0 flex-col border-l bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold text-gray-800">Filter</span>
        <div className="flex items-center gap-2">
          <button className="text-xs text-blue-600 hover:underline">
            Save Filter
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Status */}
        <CollapsibleSection
          title="Status"
          action={
            <span
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setFilter((f) => ({
                  ...f,
                  statuses: kanbanColumns.map((c) => c.id)
                }));
              }}
            >
              Select all
            </span>
          }
        >
          {kanbanColumns.map((col) => {
            const checked = filter.statuses.includes(col.id);
            const sc = STATUS_COLOR[(col.name || "").toLowerCase()] || {
              color: "#6B7280",
              dot: "#6B7280"
            };
            return (
              <label
                key={col.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setFilter((f) => ({
                      ...f,
                      statuses: toggleArr(f.statuses, col.id)
                    }))
                  }
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: sc.dot }}
                />
                {col.name}
              </label>
            );
          })}
        </CollapsibleSection>

        {/* Priority */}
        <CollapsibleSection title="Priority">
          {PRIORITY_OPTIONS.map((opt) => {
            const checked = filter.priorities.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setFilter((f) => ({
                      ...f,
                      priorities: toggleArr(f.priorities, opt.value)
                    }))
                  }
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-red-600"
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.label}
              </label>
            );
          })}
        </CollapsibleSection>

        {/* Assignee */}
        <CollapsibleSection title="Assignee">
          {members.map((m) => {
            const checked = filter.assignees.includes(m.id);
            const initials = (m.fullName || m.username || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            return (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setFilter((f) => ({
                      ...f,
                      assignees: toggleArr(f.assignees, m.id)
                    }))
                  }
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[9px] font-medium text-gray-600">
                  {initials}
                </span>
                {m.fullName || m.username || "Unknown"}
              </label>
            );
          })}
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-gray-400 italic hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filter.assignees.includes("__unassigned__")}
              onChange={() =>
                setFilter((f) => ({
                  ...f,
                  assignees: toggleArr(f.assignees, "__unassigned__")
                }))
              }
              className="h-3.5 w-3.5 rounded border-gray-300 accent-blue-600"
            />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[9px] font-medium text-gray-400">
              ?
            </span>
            Unassigned
          </label>
        </CollapsibleSection>

        {/* Due Date */}
        <CollapsibleSection title="Due Date">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 px-1 py-1">
            {DUE_DATE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="dueDate"
                  checked={filter.dueDate === opt.value}
                  onChange={() =>
                    setFilter((f) => ({ ...f, dueDate: opt.value }))
                  }
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Tags / Labels */}
        <CollapsibleSection title="Tags / Labels">
          <div className="px-1 py-1">
            {allTags.length === 0 ? (
              <p className="py-1 text-xs text-gray-400 italic">
                No tags available
              </p>
            ) : (
              <select
                className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 outline-none"
                value={filter.tags.length > 0 ? filter.tags[0] : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter((f) => ({
                    ...f,
                    tags: val ? [val] : []
                  }));
                }}
              >
                <option value="">Select labels</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CollapsibleSection>

        {/* Progress */}
        <CollapsibleSection title="Progress">
          <div className="px-1 py-2">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{filter.progressMax}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={filter.progressMax}
              onChange={(e) =>
                setFilter((f) => ({
                  ...f,
                  progressMax: Number(e.target.value)
                }))
              }
              className="w-full accent-blue-600"
            />
            <div className="mt-2">
              <label className="text-xs text-gray-500">
                Subtask Completion
              </label>
              <select className="mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none">
                <option>All</option>
                <option>Completed</option>
                <option>Incomplete</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t px-4 py-3">
        <button
          onClick={() => setFilter(emptyFilter)}
          className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
        <button className="flex-1 rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
          Apply Filter
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ListView                                                           */
/* ------------------------------------------------------------------ */

export function ListView({
  tasks,
  onTaskClick,
  kanbanColumns = [],
  searchQuery = "",
  filter: filterProp,
  setFilter: setFilterProp,
  showFilterPanel: showFilterPanelProp,
  setShowFilterPanel: setShowFilterPanelProp
}: ListViewProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  // Filter state can be controlled by the parent (so the panel can live at the
  // page level) or fall back to internal state for standalone usage.
  const [filterInternal, setFilterInternal] =
    useState<FilterState>(emptyFilter);
  const [showFilterPanelInternal, setShowFilterPanelInternal] = useState(false);
  const filter = filterProp ?? filterInternal;
  const setFilter = setFilterProp ?? setFilterInternal;
  const showFilterPanel = showFilterPanelProp ?? showFilterPanelInternal;
  const setShowFilterPanel =
    setShowFilterPanelProp ?? setShowFilterPanelInternal;
  const [groupBy, setGroupBy] = useState<string>("none");

  // Apply filters (including search)
  const filteredTasks = useMemo(() => {
    const f = filter;
    const activeCount = countActive(f);
    const hasSearch = searchQuery.trim().length > 0;

    if (activeCount === 0 && !hasSearch) return tasks;

    const q = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Search query
      if (hasSearch && !(task.title || "").toLowerCase().includes(q))
        return false;
      // Status
      if (f.statuses.length && !f.statuses.includes(task.columnId || ""))
        return false;
      // Priority
      if (f.priorities.length && !f.priorities.includes(task.priority || ""))
        return false;
      // Assignees
      if (f.assignees.length) {
        const taskAssigneeIds = (task.assignees || []).map((a) => a.userId);
        const hasUnassigned = f.assignees.includes("__unassigned__");
        const matchAssigned = f.assignees.some((id) =>
          taskAssigneeIds.includes(id)
        );
        const matchUnassigned = hasUnassigned && taskAssigneeIds.length === 0;
        if (!matchAssigned && !matchUnassigned) return false;
      }
      // Tags
      if (f.tags.length) {
        const taskTagNames = (task.tags || []).map((tg: any) => {
          const tagData = tg.tag || tg;
          return tagData.name || tagData.label || String(tagData);
        });
        if (!f.tags.some((t) => taskTagNames.includes(t))) return false;
      }
      // Progress
      if (f.progressMax < 100) {
        const total = task.subtaskCount ?? 0;
        const done = task.completedSubtaskCount ?? 0;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        if (pct > f.progressMax) return false;
      }
      return true;
    });
  }, [tasks, filter, searchQuery]);

  const columns = useMemo<ColumnDef<Task, any>[]>(
    () => buildColumns(kanbanColumns),
    [kanbanColumns]
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: { rowSelection, pagination }
  });

  const totalRows = filteredTasks.length;
  const { pageIndex, pageSize } = pagination;
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalRows);
  const pageCount = table.getPageCount();
  const activeFilterCount = countActive(filter);

  // Build filter chips for the toolbar
  const filterChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];
    if (filter.statuses.length) {
      chips.push({
        label: `Status: ${filter.statuses.length}`,
        onRemove: () => setFilter((f) => ({ ...f, statuses: [] }))
      });
    }
    if (filter.priorities.length) {
      chips.push({
        label: `Priority: ${filter.priorities.length}`,
        onRemove: () => setFilter((f) => ({ ...f, priorities: [] }))
      });
    }
    if (filter.assignees.length) {
      chips.push({
        label: `Assignee: ${filter.assignees.length}`,
        onRemove: () => setFilter((f) => ({ ...f, assignees: [] }))
      });
    }
    if (filter.dueDate) {
      const dd = DUE_DATE_OPTIONS.find((d) => d.value === filter.dueDate);
      chips.push({
        label: `Due: ${dd?.label || filter.dueDate}`,
        onRemove: () => setFilter((f) => ({ ...f, dueDate: "" }))
      });
    }
    if (filter.tags.length) {
      chips.push({
        label: `Tags: ${filter.tags.length}`,
        onRemove: () => setFilter((f) => ({ ...f, tags: [] }))
      });
    }
    if (filter.progressMax < 100) {
      chips.push({
        label: `Progress: ≤${filter.progressMax}%`,
        onRemove: () => setFilter((f) => ({ ...f, progressMax: 100 }))
      });
    }
    return chips;
  }, [filter]);

  const handleToggleFilter = () => {
    setShowFilterPanel((prev) => !prev);
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No tasks found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-white shadow-sm">
      {/* Main Table Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar: Filter + chips + Group by + actions */}
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
          {/* Filter toggle button */}
          <button
            onClick={handleToggleFilter}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              activeFilterCount > 0 || showFilterPanel
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>

          {/* Active filter chips */}
          {filterChips.length > 0 && (
            <>
              <button
                onClick={() => setFilter(emptyFilter)}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear All
              </button>
              {filterChips.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="ml-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </>
          )}

          <div className="flex-1" />

          {/* Group by + actions */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Group by</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-700 outline-none"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
            </select>
          </div>

          <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleToggleFilter}
            className={`flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100 ${
              showFilterPanel
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {showFilterPanel ? (
              <PanelRightClose className="h-3.5 w-3.5" />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-gray-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-10 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500"
                      style={{
                        width:
                          header.getSize() !== 150
                            ? header.getSize()
                            : undefined
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No tasks match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40"
                    onClick={() => onTaskClick?.(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-3 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-xs text-gray-500">
            Showing {start} - {end} of {totalRows} tasks
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Rows per page:</span>
              <select
                className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs outline-none"
                value={pageSize}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  table.setPageSize(s);
                  setPagination({ pageIndex: 0, pageSize: s });
                }}
              >
                {[10, 20, 50].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                &lt;
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => table.setPageIndex(i)}
                  className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                    i === pageIndex
                      ? "bg-blue-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
