"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Loader2,
  ShieldAlert,
  Search,
  Filter,
  Bell,
  Download,
  ChevronDown,
  ListFilter,
  CalendarDays,
  Image as ImageIcon,
  Video,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import {
  useAdminChangelogs,
  useDeleteChangelog
} from "@/hooks/api/useAdminChangelogs";
import type { Changelog } from "@/types/type-changelogs";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import ChangelogForm from "./ChangelogForm";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const VERSION_COLORS = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-pink-50 text-pink-600",
  "bg-sky-50 text-sky-600",
  "bg-rose-50 text-rose-600"
];

const MENU_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-pink-100 text-pink-600",
  "bg-sky-100 text-sky-600",
  "bg-rose-100 text-rose-600"
];

function hashIndex(value: string, len: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash + value.charCodeAt(i)) % len;
  }
  return hash;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatTimeWIB(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  })} WIB`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

export default function AdminChangelog() {
  const { status } = useSession();
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const isSuperAdmin = authMe?.user?.isSuperAdmin === true;

  const { data: changelogs = [], isLoading: isListLoading } =
    useAdminChangelogs(isSuperAdmin);

  const deleteMutation = useDeleteChangelog();

  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<Changelog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Changelog | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const sortedChangelogs = useMemo(
    () =>
      [...changelogs].sort((a, b) => {
        const aDate = new Date(a.releaseDate ?? a.createdAt).getTime();
        const bDate = new Date(b.releaseDate ?? b.createdAt).getTime();
        return bDate - aDate;
      }),
    [changelogs]
  );

  const tabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of sortedChangelogs) {
      const menu = entry.menu?.trim();
      if (menu) counts.set(menu, (counts.get(menu) ?? 0) + 1);
    }
    return [
      { key: "all", label: "Semua", count: sortedChangelogs.length },
      ...Array.from(counts.entries()).map(([label, count]) => ({
        key: label,
        label,
        count
      }))
    ];
  }, [sortedChangelogs]);

  const filtered = useMemo(() => {
    let result = sortedChangelogs;
    if (activeTab !== "all") {
      result = result.filter((e) => e.menu === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          (e.version ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [sortedChangelogs, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const rangeStart =
    filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  const openCreate = () => {
    setEditing(null);
    setView("form");
  };

  const openEdit = (changelog: Changelog) => {
    setEditing(changelog);
    setView("form");
  };

  const closeForm = () => {
    setEditing(null);
    setView("list");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id },
      { onSuccess: () => setDeleteTarget(null) }
    );
  };

  // ── Auth gating ──────────────────────────────────────────────────────────
  if (status === "loading" || isAuthLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
        <ShieldAlert className="size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Authentication required</h2>
        <p className="text-sm text-muted-foreground">
          Please sign in to access this page.
        </p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
        <ShieldAlert className="size-10 text-destructive" />
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page is restricted to super administrators only.
        </p>
      </div>
    );
  }

  // ── Create / Edit form view ───────────────────────────────────────────────
  if (view === "form") {
    return <ChangelogForm changelog={editing} onClose={closeForm} />;
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-slate-50">
      {/* Top header (content row, not a navbar) */}
      <div className="flex flex-wrap items-center justify-end gap-3 border-b bg-white px-6 py-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search update..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button variant="outline">
          <Filter className="size-4" />
          Filter
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={openCreate}>
          <Plus className="size-4" />
          Buat Changelog
        </Button>
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
        </button>
      </div>

      <div className="px-6 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900">Changelog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola semua update dan perubahan pada produk PapanClip.
        </p>

        {/* Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-b">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`relative flex items-center gap-2 pb-3 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.key === "all" && <ListFilter className="size-4" />}
                {tab.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
                {isActive && (
                  <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="mt-5 rounded-2xl border bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search changelog..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Button variant="outline" className="text-slate-600">
                <ListFilter className="size-4" />
                Menu
                <ChevronDown className="size-4" />
              </Button>
              <Button variant="outline" className="text-slate-600">
                <CalendarDays className="size-4" />
                Tanggal Rilis
                <ChevronDown className="size-4" />
              </Button>
            </div>
            <Button variant="outline" className="text-slate-600">
              <Download className="size-4" />
              Export
            </Button>
          </div>

          {/* Table */}
          {isListLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <FileText className="size-10 text-slate-300" />
              <h3 className="text-base font-semibold text-slate-700">
                Belum ada changelog
              </h3>
              <p className="max-w-sm text-sm text-slate-500">
                Buat entri changelog pertama untuk memberi tahu pengguna tentang
                fitur dan perbaikan baru.
              </p>
              <Button
                className="mt-1 bg-blue-600 hover:bg-blue-700"
                onClick={openCreate}
              >
                <Plus className="size-4" />
                Buat Changelog
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-y bg-slate-50/60 text-left text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Menu</th>
                    <th className="px-4 py-3">Nama Update</th>
                    <th className="px-4 py-3">Versi</th>
                    <th className="px-4 py-3">Tanggal Rilis</th>
                    <th className="px-4 py-3">Media</th>
                    <th className="px-4 py-3">Dipublikasikan Oleh</th>
                    <th className="px-4 py-3">Dibuat Pada</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pageItems.map((entry) => {
                    const menu = entry.menu?.trim() || "";
                    const imageCount = entry.attachments?.length ?? 0;
                    const videoCount = entry.youtubeUrl ? 1 : 0;
                    const author = entry.creator?.fullName ?? "-";
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/60">
                        {/* Menu */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                menu
                                  ? MENU_COLORS[
                                      hashIndex(menu, MENU_COLORS.length)
                                    ]
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {menu ? getInitials(menu) : "—"}
                            </span>
                            <span className="text-sm font-medium text-slate-700">
                              {menu || "-"}
                            </span>
                          </div>
                        </td>
                        {/* Nama Update */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {entry.title}
                          </p>
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-500">
                            {entry.content}
                          </p>
                        </td>
                        {/* Versi */}
                        <td className="px-4 py-3">
                          {entry.version ? (
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                                VERSION_COLORS[
                                  hashIndex(
                                    entry.version,
                                    VERSION_COLORS.length
                                  )
                                ]
                              }`}
                            >
                              v{entry.version.replace(/^v/i, "")}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        {/* Tanggal Rilis */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-slate-600">
                            <CalendarDays className="size-3.5 text-slate-400" />
                            {formatDate(entry.releaseDate)}
                          </span>
                        </td>
                        {/* Media */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs text-slate-500">
                              <ImageIcon className="size-3.5" />
                              {imageCount}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs text-slate-500">
                              <Video className="size-3.5" />
                              {videoCount}
                            </span>
                          </div>
                        </td>
                        {/* Dipublikasikan Oleh */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage
                                src={entry.creator?.avatarUrl ?? ""}
                                alt={author}
                              />
                              <AvatarFallback className="bg-slate-800 text-[10px] text-white">
                                {getInitials(author)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                              <p className="text-sm font-medium text-slate-700">
                                {author}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Admin
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Dibuat Pada */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm text-slate-700">
                            {formatDate(entry.createdAt)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatTimeWIB(entry.createdAt)}
                          </p>
                        </td>
                        {/* Aksi */}
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(entry)}>
                                <Pencil className="size-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(entry)}
                              >
                                <Trash2 className="size-4" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
              <p className="text-sm text-slate-500">
                Menampilkan {rangeStart} - {rangeEnd} dari {filtered.length}{" "}
                data
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        size="icon-sm"
                        variant={p === currentPage ? "default" : "outline"}
                        className={
                          p === currentPage
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-8 appearance-none rounded-lg border border-input bg-white pl-3 pr-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} / halaman
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus changelog"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
