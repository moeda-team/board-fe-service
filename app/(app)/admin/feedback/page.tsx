"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { useAdminFeedbacks, useUpdateFeedbackStatus } from "@/hooks/api/useAdminFeedbacks";
import type { AdminFeedback, AdminFeedbackStatus } from "@/types/admin-feedback";

const STATUS_CONFIG: Record<AdminFeedbackStatus, { label: string; color: string }> = {
  NEED_APPROVAL: { label: "Need Approval", color: "bg-yellow-100 text-yellow-700" },
  ON_HOLD: { label: "On Hold", color: "bg-orange-100 text-orange-700" },
  BACKLOG: { label: "Backlog", color: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  TESTING: { label: "Testing", color: "bg-purple-100 text-purple-700" },
  RELEASE: { label: "Release", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
};

const ALL_STATUSES: AdminFeedbackStatus[] = [
  "NEED_APPROVAL",
  "ON_HOLD",
  "BACKLOG",
  "IN_PROGRESS",
  "TESTING",
  "RELEASE",
  "REJECTED",
];

const TABS = [
  { key: "all", label: "All" },
  ...ALL_STATUSES.map((s) => ({ key: s, label: STATUS_CONFIG[s].label })),
];

function formatDate(str: string | null | undefined) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function FeedbackDetailModal({
  feedback,
  open,
  onClose,
}: {
  feedback: AdminFeedback | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!feedback) return null;

  const statusCfg = STATUS_CONFIG[feedback.status];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${open ? "" : "hidden"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-base font-semibold">Feedback Detail</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2">
            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
            <span className="text-xs text-muted-foreground">{feedback.category}</span>
          </div>
          <h3 className="text-lg font-semibold">{feedback.title}</h3>
          <div
            className="text-sm text-muted-foreground prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: feedback.description }}
          />
          {feedback.attachments && feedback.attachments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Attachments ({feedback.attachments.length})
              </p>
              <div className="space-y-1">
                {feedback.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Paperclip className="w-3 h-3" />
                    {a.fileName}
                  </a>
                ))}
              </div>
            </div>
          )}
          {feedback.submitter && (
            <div className="text-sm text-muted-foreground">
              Submitted by <strong>{feedback.submitter.fullName}</strong> ({feedback.submitter.email})
              <br />
              {formatDate(feedback.createdAt)}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FeedbackClient() {
  const { status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState<AdminFeedback | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const LIMIT = 20;

  const statusFilter = activeTab === "all" ? undefined : activeTab;

  const { data, isLoading } = useAdminFeedbacks(
    { page, limit: LIMIT, status: statusFilter },
    sessionStatus === "authenticated"
  );

  const updateStatus = useUpdateFeedbackStatus();

  const openDetail = (fb: AdminFeedback) => {
    setSelectedFeedback(fb);
    setModalOpen(true);
  };

  const handleStatusChange = (feedbackId: string, newStatus: AdminFeedbackStatus) => {
    updateStatus.mutate(
      { id: feedbackId, dto: { status: newStatus } },
      {
        onSuccess: () => gooeyToast.success("Status updated"),
        onError: () => gooeyToast.error("Failed to update status"),
      }
    );
  };

  const filtered = data?.items.filter((fb) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      fb.title.toLowerCase().includes(q) ||
      fb.category.toLowerCase().includes(q) ||
      (fb.submitter?.fullName ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / LIMIT));
  const pageItems = filtered?.slice((page - 1) * LIMIT, page * LIMIT) ?? [];

  if (sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-center">
        <ShieldAlert className="w-10 h-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Authentication required</h2>
        <p className="text-sm text-muted-foreground">Please sign in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">User Feedback</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage feature requests and feedback
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-5">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                className="h-9 pl-9"
                placeholder="Search feedback…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-700">No feedback found</h3>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3.5">Title</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Submitter</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pageItems.map((fb) => {
                        const statusCfg = STATUS_CONFIG[fb.status];
                        const attachmentCount = fb.attachments?.length ?? 0;
                        return (
                          <tr key={fb.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-slate-900 text-sm line-clamp-1">
                                {fb.title}
                              </p>
                              {attachmentCount > 0 && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                  <Paperclip className="w-3 h-3" />
                                  {attachmentCount}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                {fb.category}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="text-sm font-medium text-slate-800">
                                {fb.submitter?.fullName ?? fb.email ?? "—"}
                              </p>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                              {formatDate(fb.createdAt)}
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge className={`${statusCfg.color} border-0 font-medium text-xs`}>
                                {statusCfg.label}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => openDetail(fb)}
                                >
                                  View
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="h-7 w-7"><MoreHorizontal className="w-4 h-4" /></Button>} />
                                  <DropdownMenuContent align="end">
                                    {ALL_STATUSES.map((s) => (
                                      <DropdownMenuItem
                                        key={s}
                                        onClick={() => handleStatusChange(fb.id, s)}
                                        className={fb.status === s ? "font-semibold" : ""}
                                      >
                                        {STATUS_CONFIG[s].label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filtered && filtered.length > LIMIT && (
                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-3.5">
                    <p className="text-xs text-slate-500">
                      Showing <span className="font-medium text-slate-700">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, filtered.length)}</span> of{" "}
                      <span className="font-medium text-slate-700">{filtered.length}</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-7 w-7"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs text-slate-600 px-1">
                        <span className="font-semibold">{page}</span>
                        <span className="text-slate-400 mx-0.5">/</span>
                        <span>{totalPages}</span>
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-7 w-7"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FeedbackDetailModal
        feedback={selectedFeedback}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
