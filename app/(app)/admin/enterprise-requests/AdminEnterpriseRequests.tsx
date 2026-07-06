"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldAlert,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  FileText,
  X,
  Building2,
  TrendingUp,
  Send,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useAdminEnterpriseRequests } from "@/hooks/api/useAdminEnterpriseRequests";
import type {
  AdminEnterpriseRequest,
  EnterpriseRequestStatus,
  EnterpriseRequestStatusLabel
} from "@/types/enterprise";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_LABELS: Record<
  EnterpriseRequestStatus,
  EnterpriseRequestStatusLabel
> = {
  REQUIREMENT_REVIEW: "New",
  DISCOVERY_MEETING: "Under Review",
  CONTRACT_ONBOARDING: "Proposal Sent",
  COMPLETED: "Won",
  CANCELED: "Lost"
};

const STATUS_STYLES: Record<EnterpriseRequestStatusLabel, string> = {
  New: "bg-blue-50 text-blue-600 border-blue-100",
  "Under Review": "bg-amber-50 text-amber-600 border-amber-100",
  "Proposal Sent": "bg-purple-50 text-purple-600 border-purple-100",
  Negotiation: "bg-orange-50 text-orange-600 border-orange-100",
  Won: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Lost: "bg-red-50 text-red-600 border-red-100"
};

const STAT_CARD_CONFIG = [
  {
    key: "REQUIREMENT_REVIEW",
    label: "New Requests",
    sublabel: "Awaiting initial review",
    icon: Sparkles,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    key: "DISCOVERY_MEETING",
    label: "Discovery Scheduled",
    sublabel: "Meetings planned",
    icon: CalendarDays,
    color: "text-indigo-600",
    bg: "bg-indigo-50"
  },
  {
    key: "CONTRACT_ONBOARDING",
    label: "Proposal Sent",
    sublabel: "Commercial proposals delivered",
    icon: Send,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    key: "COMPLETED",
    label: "Closed Won",
    sublabel: "Converted enterprise customers",
    icon: Trophy,
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  }
] as const;

const BUDGET_OPTIONS = [
  { value: "under-5m", label: "Under Rp 5M", min: 0, max: 5_000_000 },
  { value: "5-10m", label: "Rp 5-10M", min: 5_000_000, max: 10_000_000 },
  { value: "10-25m", label: "Rp 10-25M", min: 10_000_000, max: 25_000_000 },
  { value: "25-50m", label: "Rp 25-50M", min: 25_000_000, max: 50_000_000 },
  { value: "50m+", label: "Rp 50M+", min: 50_000_000, max: Infinity }
];

const INDUSTRIES = [
  "Technology",
  "Manufacturing",
  "Finance",
  "Healthcare",
  "Retail",
  "Construction",
  "Education",
  "Other"
];

const STATUS_FILTERS: {
  value: EnterpriseRequestStatus;
  label: EnterpriseRequestStatusLabel;
}[] = [
  { value: "REQUIREMENT_REVIEW", label: "New" },
  { value: "DISCOVERY_MEETING", label: "Under Review" },
  { value: "CONTRACT_ONBOARDING", label: "Proposal Sent" },
  { value: "COMPLETED", label: "Won" },
  { value: "CANCELED", label: "Lost" }
];

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-indigo-500"
];

function hashIndex(value: string, len: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash + value.charCodeAt(i)) % len;
  }
  return hash;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function formatNumberID(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

function formatCurrencyIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(n);
}

function formatBudgetRange(value: string): string {
  if (!value) return "-";
  const numbers = value.match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return value;

  const parse = (v: string) => Number(v.replace(/\./g, ""));
  const parts = numbers.map(parse);

  const formatCompact = (n: number) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(0)}M`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return formatNumberID(n);
  };

  if (parts.length === 2) {
    return `Rp ${formatCompact(parts[0])}–${formatCompact(parts[1])}/month`;
  }
  return `Rp ${formatCompact(parts[0])}/month`;
}

function parseBudgetValue(value: string): number | null {
  const numbers = value.match(/\d+(\.\d+)?/g);
  if (!numbers || numbers.length === 0) return null;
  const max = numbers
    .map((n) => Number(n.replace(/\./g, "")))
    .reduce((a, b) => Math.max(a, b), 0);
  return max;
}

function formatCompanySize(value: string): string {
  if (!value) return "-";
  const match = value.match(/\d[\d,\s+-]*/);
  if (!match) return value;
  const nums = value.match(/\d+/g);
  if (nums && nums.length === 2) {
    return `${nums[1]} Employees`;
  }
  if (nums && nums.length === 1) {
    return `${nums[0]} Employees`;
  }
  return value;
}

function formatRelativeDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function exportEnterpriseRequestsCsv(items: AdminEnterpriseRequest[]) {
  const headers = [
    "Company",
    "Industry",
    "Company Size",
    "Budget",
    "Status",
    "Assigned Account Manager",
    "Contact Name",
    "Contact Email",
    "Contact Phone",
    "Submitted Date"
  ];
  const rows = items.map((r) =>
    [
      r.companyName,
      r.industry,
      r.companySize,
      r.budgetRange,
      STATUS_LABELS[r.status ?? "REQUIREMENT_REVIEW"],
      r.assignedAccountManager?.fullName ?? "Unassigned",
      r.contactName,
      r.contactEmail,
      r.contactPhone,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "-"
    ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enterprise-requests-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminEnterpriseRequests() {
  const { status } = useSession();
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const isSuperAdmin = authMe?.user?.isSuperAdmin === true;
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const statusQueryParam =
    selectedStatuses.length === 1 ? selectedStatuses[0] : "";
  const industryQueryParam =
    selectedIndustries.length === 1 ? selectedIndustries[0] : "";
  const budgetQueryParam =
    selectedBudgets.length === 1 ? selectedBudgets[0] : "";

  const { data: listResponse, isLoading: isListLoading } =
    useAdminEnterpriseRequests(
      {
        page,
        limit: pageSize,
        search: search.trim(),
        status: statusQueryParam as EnterpriseRequestStatus,
        industry: industryQueryParam,
        budget: budgetQueryParam
      },
      isSuperAdmin
    );

  const items = listResponse?.items ?? [];
  const meta = listResponse?.meta;
  const totalItems = meta?.total ?? items.length;
  const totalPages =
    meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const statusLabel = item.status ? STATUS_LABELS[item.status] : null;
      if (
        selectedStatuses.length > 0 &&
        (!item.status || !selectedStatuses.includes(item.status))
      ) {
        return false;
      }
      if (
        selectedIndustries.length > 0 &&
        !selectedIndustries.includes(item.industry)
      ) {
        return false;
      }
      if (selectedBudgets.length > 0) {
        const budgetValue = parseBudgetValue(item.budgetRange);
        if (budgetValue == null) return false;
        const matches = selectedBudgets.some((b) => {
          const option = BUDGET_OPTIONS.find((o) => o.value === b);
          if (!option) return false;
          return budgetValue > option.min && budgetValue <= option.max;
        });
        if (!matches) return false;
      }
      return true;
    });
  }, [items, selectedStatuses, selectedIndustries, selectedBudgets]);

  const stats = useMemo(() => {
    const counts = new Map<EnterpriseRequestStatus, number>();
    for (const item of items) {
      if (item.status) {
        counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
      }
    }
    return counts;
  }, [items]);

  const toggleSelection = (
    value: string,
    selected: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedBudgets([]);
    setSelectedIndustries([]);
    setSearch("");
    setPage(1);
  };

  const hasFilters =
    selectedStatuses.length > 0 ||
    selectedBudgets.length > 0 ||
    selectedIndustries.length > 0 ||
    search.trim().length > 0;

  const handleExport = () => {
    exportEnterpriseRequestsCsv(filteredItems);
  };

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

  return (
    <div className="min-h-full bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Enterprise Requests
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage incoming enterprise subscription requests.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search Enterprise Requests"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button
              variant="outline"
              className={showFilters ? "bg-slate-50" : ""}
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="size-4" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARD_CONFIG.map((stat) => {
            const count = stats.get(stat.key as EnterpriseRequestStatus) ?? 0;
            const Icon = stat.icon;
            return (
              <div
                key={stat.key}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}
                    >
                      <Icon className={`size-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {count}
                      </p>
                      <p className="text-xs font-medium text-slate-600">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-400">{stat.sublabel}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <TrendingUp className="size-3" />
                  <span>
                    {count > 0
                      ? `${Math.round((count / Math.max(1, totalItems)) * 100)}%`
                      : "0%"}
                  </span>
                  <span className="text-slate-400 font-normal">of total</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="mt-6 flex gap-6">
          {/* Table area */}
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border bg-white shadow-sm">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Enterprise Requests
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600"
                  >
                    {totalItems} Total
                  </Badge>
                </div>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="size-3.5" />
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Table */}
              {isListLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <FileText className="size-10 text-slate-300" />
                  <h3 className="text-base font-semibold text-slate-700">
                    No enterprise requests found
                  </h3>
                  <p className="max-w-sm text-sm text-slate-500">
                    There are no enterprise requests matching your current
                    filters.
                  </p>
                  {hasFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-y bg-slate-50/60 text-left text-xs font-medium text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Company</th>
                        <th className="px-4 py-3">Industry</th>
                        <th className="px-4 py-3">Employees</th>
                        <th className="px-4 py-3">Budget</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned Account Manager</th>
                        <th className="px-4 py-3">Submitted Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredItems.map((request) => {
                        const status = request.status ?? "REQUIREMENT_REVIEW";
                        const statusLabel = STATUS_LABELS[status];
                        const manager = request.assignedAccountManager;
                        const managerName = manager?.fullName ?? "Unassigned";
                        const initials = getInitials(request.companyName);
                        const color =
                          AVATAR_COLORS[
                            hashIndex(request.companyName, AVATAR_COLORS.length)
                          ];

                        return (
                          <tr key={request.id} className="hover:bg-slate-50/60">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}
                                >
                                  {initials || "—"}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {request.companyName}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {request.companyWebsite}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {request.industry}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {formatCompanySize(request.companySize)}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {formatBudgetRange(request.budgetRange)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[statusLabel]}`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="size-7">
                                  <AvatarImage
                                    src={manager?.avatarUrl ?? ""}
                                    alt={managerName}
                                  />
                                  <AvatarFallback className="bg-slate-200 text-[10px] text-slate-700">
                                    {manager ? getInitials(managerName) : "—"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-700">
                                  {managerName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {formatRelativeDate(request.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button variant="ghost" size="icon-sm" />
                                  }
                                >
                                  <MoreHorizontal className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/enterprise-requests/${request.id}`
                                      )
                                    }
                                  >
                                    <Eye className="size-4" />
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/enterprise-requests/${request.id}/edit`
                                      )
                                    }
                                  >
                                    <Pencil className="size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/enterprise-requests/${request.id}/schedule`
                                      )
                                    }
                                  >
                                    <CalendarDays className="size-4" />
                                    Schedule discovery
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/admin/enterprise-requests/${request.id}/proposal`
                                      )
                                    }
                                  >
                                    <ArrowUpRight className="size-4" />
                                    Generate proposal
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
              {filteredItems.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    {items.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                    {Math.min(currentPage * pageSize, totalItems)} of{" "}
                    {totalItems} results
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
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
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
                            {size} / page
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

          {/* Filters sidebar */}
          {showFilters && (
            <div className="w-72 shrink-0 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-5">
                {/* Status */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Status</p>
                    {selectedStatuses.length > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setSelectedStatuses([])}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {STATUS_FILTERS.map((s) => (
                      <label
                        key={s.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <Checkbox
                          checked={selectedStatuses.includes(s.value)}
                          onCheckedChange={() =>
                            toggleSelection(
                              s.value,
                              selectedStatuses,
                              setSelectedStatuses
                            )
                          }
                        />
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[s.label]}`}
                        >
                          {s.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">Budget</p>
                    {selectedBudgets.length > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setSelectedBudgets([])}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {BUDGET_OPTIONS.map((b) => (
                      <label
                        key={b.value}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <Checkbox
                          checked={selectedBudgets.includes(b.value)}
                          onCheckedChange={() =>
                            toggleSelection(
                              b.value,
                              selectedBudgets,
                              setSelectedBudgets
                            )
                          }
                        />
                        {b.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900">
                      Industry
                    </p>
                    {selectedIndustries.length > 0 && (
                      <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setSelectedIndustries([])}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {INDUSTRIES.map((industry) => (
                      <label
                        key={industry}
                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                      >
                        <Checkbox
                          checked={selectedIndustries.includes(industry)}
                          onCheckedChange={() =>
                            toggleSelection(
                              industry,
                              selectedIndustries,
                              setSelectedIndustries
                            )
                          }
                        />
                        {industry}
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
