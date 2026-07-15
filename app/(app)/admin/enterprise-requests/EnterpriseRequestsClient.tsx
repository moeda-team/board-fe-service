"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ExternalLink,
  Video,
  Clock,
  Users,
  Building2,
  Mail,
  Phone,
  Globe,
  BarChart3,
  XCircle,
  Banknote,
  HardDrive,
  Zap,
  CalendarDays,
  Tag,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { gooeyToast } from "goey-toast";
import {
  useAdminEnterpriseRequests,
  useScheduleDiscovery,
  useCreateCustomInvoice,
  useUpdateEnterpriseRequestStatus,
  useGetEnterpriseRequestForInvoice,
} from "@/hooks/api/useAdminEnterpriseRequests";
import type { AdminEnterpriseRequest } from "@/types/admin-enterprise";
import type { EnterpriseRequestStatus } from "@/types/enterprise";

const STATUS_CONFIG: Record<
  EnterpriseRequestStatus,
  { label: string; color: string; bg: string }
> = {
  REQUIREMENT_REVIEW: { label: "Requirement Review", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  DISCOVERY_MEETING: { label: "Discovery Meeting", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  CONTRACT_ONBOARDING: { label: "Contract & Onboarding", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  COMPLETED: { label: "Completed", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  CANCELED: { label: "Canceled", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const ALL_STATUSES: EnterpriseRequestStatus[] = [
  "REQUIREMENT_REVIEW",
  "DISCOVERY_MEETING",
  "CONTRACT_ONBOARDING",
  "COMPLETED",
  "CANCELED",
];

function formatDate(str: string | null | undefined) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(str: string | null | undefined) {
  if (!str) return "—";
  return new Date(str).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatApiHits(val: number) {
  if (val === -1) return "Unlimited";
  if (val === 0) return "No Access";
  return `${val.toLocaleString()}/mo`;
}

// ── Stats Overview ─────────────────────────────────────────────────────────────

function StatsBar({ statusCounts }: { statusCounts?: Record<string, number> }) {
  if (!statusCounts) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {ALL_STATUSES.map((s) => {
        const cfg = STATUS_CONFIG[s];
        const count = statusCounts[s] ?? 0;
        return (
          <div
            key={s}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 ${cfg.bg}`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className={`w-4 h-4 ${cfg.color}`} />
              <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <span className={`text-lg font-bold ${cfg.color}`}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── User Avatar ────────────────────────────────────────────────────────────────

function UserAvatar({ user }: { user?: AdminEnterpriseRequest["user"] }) {
  if (!user) return null;
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
      {user.fullName.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Schedule Discovery Sheet ─────────────────────────────────────────────────

function ScheduleDiscoverySheet({
  request,
  onClose,
  onSuccess,
}: {
  request: AdminEnterpriseRequest;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const scheduleMutation = useScheduleDiscovery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingDate || !meetingPlatform || !meetingLink) {
      gooeyToast.error("Please fill in all fields");
      return;
    }
    scheduleMutation.mutate(
      { id: request.id, dto: { meetingDate, meetingPlatform, meetingLink } },
      {
        onSuccess: () => {
          gooeyToast.success("Discovery meeting scheduled — status updated to Discovery Meeting");
          onSuccess();
          onClose();
        },
        onError: () => gooeyToast.error("Failed to schedule discovery meeting"),
      }
    );
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-left flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Schedule Discovery Meeting
          </SheetTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Schedule a discovery call for <strong>{request.companyName}</strong>.
            This will automatically move the request to <strong>Discovery Meeting</strong> status.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-5">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Date & Time</label>
              <Input
                type="datetime-local"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Platform</label>
              <Input
                placeholder="e.g. Google Meet, Zoom, Microsoft Teams"
                value={meetingPlatform}
                onChange={(e) => setMeetingPlatform(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Meeting Link</label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-muted-foreground">Industry</span>
              <span className="font-medium">{request.industry}</span>
              <span className="text-muted-foreground">Users Needed</span>
              <span className="font-medium">
                {request.requestedUsers === 0 ? "Unlimited" : request.requestedUsers.toLocaleString()}
              </span>
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">
                {request.requestedStorageGb === 0 ? "Unlimited" : `${request.requestedStorageGb.toLocaleString()} GB`}
              </span>
              <span className="text-muted-foreground">Budget</span>
              <span className="font-medium">{request.budgetRange}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Meeting
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ── Custom Invoice Sheet ────────────────────────────────────────────────────────
// Accepts invoice-ready data resolved from the new API endpoint so tenantId
// is always available even when the EnterpriseRequest record has no tenantId yet.

type InvoiceFormData = {
  enterpriseRequestId: string;
  companyName: string;
  requestedUsers: number;
  requestedWorkspaces: number;
  requestedStorageGb: number;
  requestedApiHits: number;
  tenantId: string | null;
  tenant: {
    id: string;
    name: string;
    tier: string;
    maxUsers: number | null;
    maxWorkspaces: number | null;
    maxStorageGb: number | null;
    apiHitsLimit: number | null;
    subscriptionEndsAt: string | null;
  } | null;
};

function CustomInvoiceSheet({
  formData,
  onClose,
  onSuccess,
}: {
  formData: InvoiceFormData;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const invoiceMutation = useCreateCustomInvoice();

  // Pre-fill from the resolved invoice data
  const [amount, setAmount] = useState("");
  const [maxUsers, setMaxUsers] = useState(
    formData.requestedUsers > 0 ? String(formData.requestedUsers) : ""
  );
  const [maxWorkspaces, setMaxWorkspaces] = useState(
    formData.requestedWorkspaces > 0 ? String(formData.requestedWorkspaces) : ""
  );
  const [maxStorageGb, setMaxStorageGb] = useState(
    formData.requestedStorageGb > 0 ? String(formData.requestedStorageGb) : ""
  );
  const [apiHitsLimit, setApiHitsLimit] = useState(
    formData.requestedApiHits !== 0 ? String(formData.requestedApiHits) : ""
  );
  const [durationDays, setDurationDays] = useState("365");
  const [description, setDescription] = useState(
    `Enterprise contract — ${formData.companyName}`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !maxUsers || !maxWorkspaces || !maxStorageGb || !description) {
      gooeyToast.error("Please fill in all required fields");
      return;
    }
    if (!formData.tenantId) {
      gooeyToast.error("No tenant found for this request. Please link a tenant first.");
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/\D/g, ""));
    invoiceMutation.mutate(
      {
        tenantId: formData.tenantId,
        amount: parsedAmount,
        maxUsers: parseInt(maxUsers) || 0,
        maxWorkspaces: parseInt(maxWorkspaces) || 0,
        maxStorageGb: parseInt(maxStorageGb) || 0,
        apiHitsLimit: apiHitsLimit ? parseInt(apiHitsLimit) : -1,
        durationDays: parseInt(durationDays) || 365,
        description,
        enterpriseRequestId: formData.enterpriseRequestId,
      },
      {
        onSuccess: () => {
          gooeyToast.success("Custom invoice issued — status updated to Contract & Onboarding");
          onSuccess();
          onClose();
        },
        onError: () => gooeyToast.error("Failed to issue custom invoice"),
      }
    );
  };

  const formatAmountInput = (val: string) => {
    const raw = val.replace(/\D/g, "");
    return raw ? parseInt(raw).toLocaleString("id-ID") : "";
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-left flex items-center gap-2">
            <Banknote className="w-5 h-5 text-amber-600" />
            Issue Custom Invoice
          </SheetTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Create a custom invoice for <strong>{formData.companyName}</strong>.
            The status will automatically update to <strong>Contract &amp; Onboarding</strong> once the invoice is created.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-5">
          {/* Amount */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Invoice Amount (IDR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
              <Input
                type="text"
                inputMode="numeric"
                className="pl-8"
                placeholder="5.000.000"
                value={amount}
                onChange={(e) => setAmount(formatAmountInput(e.target.value))}
                required
              />
            </div>
          </div>

          {/* Grid: Users + Workspaces */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                <Users className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Max Users <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 100"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">0 = Unlimited</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                <LayoutGrid className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Max Workspaces <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 50"
                value={maxWorkspaces}
                onChange={(e) => setMaxWorkspaces(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">0 = Unlimited</p>
            </div>
          </div>

          {/* Grid: Storage + API */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                <HardDrive className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                Max Storage (GB) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={maxStorageGb}
                onChange={(e) => setMaxStorageGb(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">0 = Unlimited</p>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                <Zap className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
                API Hits Limit <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="e.g. 100000"
                value={apiHitsLimit}
                onChange={(e) => setApiHitsLimit(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">-1 = Unlimited, 0 = No Access</p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              <CalendarDays className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
              Contract Duration (days) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              30 = Monthly, 365 = Annual, 1095 = Multi-year
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium block mb-1.5">
              <Tag className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />
              Invoice Description <span className="text-red-500">*</span>
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700">
              <strong>Note:</strong> Creating this invoice will automatically move the request to{" "}
              <strong>Contract &amp; Onboarding</strong>. The invoice will be sent via Midtrans
              and the status will be updated upon successful payment.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={invoiceMutation.isPending}
            >
              {invoiceMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Banknote className="w-4 h-4 mr-2" />
              Issue Invoice
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function RequestDetailDrawer({
  request,
  open,
  onOpenChange,
  onRefresh,
}: {
  request: AdminEnterpriseRequest | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRefresh: () => void;
}) {
  const [showDiscoverySheet, setShowDiscoverySheet] = useState(false);
  const [showInvoiceSheet, setShowInvoiceSheet] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancelMutation = useUpdateEnterpriseRequestStatus();

  // Auto-fetch invoice data when drawer opens for DISCOVERY_MEETING
  const { data: invoiceFormData, isLoading: isLoadingInvoiceData } =
    useGetEnterpriseRequestForInvoice(
      open && request?.status === "DISCOVERY_MEETING" ? request.id : null
    );

  if (!request) return null;

  const statusCfg = STATUS_CONFIG[request.status];
  const isTerminal = request.status === "COMPLETED" || request.status === "CANCELED";

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: request.id, dto: { status: "CANCELED" } },
      {
        onSuccess: () => {
          gooeyToast.success("Request canceled");
          setShowCancelConfirm(false);
          onRefresh();
          onOpenChange(false);
        },
        onError: () => gooeyToast.error("Failed to cancel request"),
      }
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <SheetTitle className="text-left leading-snug">
                {request.companyName}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`${statusCfg.bg} ${statusCfg.color} border-0`}>
                {statusCfg.label}
              </Badge>
              <span className="text-xs text-muted-foreground">{request.industry}</span>
            </div>
          </SheetHeader>

          <div className="divide-y">
            {/* Submitted By */}
            {request.user && (
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Submitted By
                </h3>
                <div className="flex items-center gap-3">
                  <UserAvatar user={request.user} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{request.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{request.user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto shrink-0"
                    onClick={() => window.open(`mailto:${request.user!.email}`, "_blank")}
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Tenant */}
            {request.tenant && (
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Tenant
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{request.tenant.name}</p>
                    <p className="text-xs text-muted-foreground">Tier: {request.tenant.tier}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      request.tenant.tier === "CUSTOM"
                        ? "border-purple-300 text-purple-700"
                        : request.tenant.tier === "PRO"
                          ? "border-blue-300 text-blue-700"
                          : request.tenant.tier === "BASIC"
                            ? "border-green-300 text-green-700"
                            : "border-gray-300 text-gray-600"
                    }
                  >
                    {request.tenant.tier}
                  </Badge>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Contact
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">{request.contactName}</span>
                  <span className="text-muted-foreground text-xs">
                    — {request.contactTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <a href={`mailto:${request.contactEmail}`} className="hover:underline">
                    {request.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 shrink-0" />
                  {request.contactPhone}
                </div>
                {request.companyWebsite && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="w-4 h-4 shrink-0" />
                    <a
                      href={request.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {request.companyWebsite}
                    </a>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => window.open(`mailto:${request.contactEmail}`, "_blank")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email Contact
              </Button>
            </div>

            {/* Request Details */}
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Request Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Company Size</p>
                  <p className="font-medium">{request.companySize}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Department</p>
                  <p className="font-medium">{request.contactDepartment}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Billing</p>
                  <p className="font-medium">{request.billingType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Budget</p>
                  <p className="font-medium">{request.budgetRange}</p>
                </div>
              </div>
            </div>

            {/* Quotas */}
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Requested Quotas
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Users</p>
                  <p className="font-medium">
                    {request.requestedUsers === 0 ? "Unlimited" : request.requestedUsers.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Workspaces</p>
                  <p className="font-medium">
                    {request.requestedWorkspaces === 0 ? "Unlimited" : request.requestedWorkspaces.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Storage</p>
                  <p className="font-medium">
                    {request.requestedStorageGb === 0 ? "Unlimited" : `${request.requestedStorageGb.toLocaleString()} GB`}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">API Hits</p>
                  <p className="font-medium">{formatApiHits(request.requestedApiHits)}</p>
                </div>
              </div>
            </div>

            {/* Meeting Info */}
            {request.meetingDate && (
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Discovery Meeting
                </h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{formatDateTime(request.meetingDate)}</span>
                  </div>
                  {request.meetingPlatform && (
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{request.meetingPlatform}</span>
                    </div>
                  )}
                  {request.meetingLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => window.open(request.meetingLink!, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Join Meeting
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {request.additionalNotes && (
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Notes
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {request.additionalNotes}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                Submission
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Submitted {formatDateTime(request.createdAt)}</p>
                {request.user && (
                  <p>
                    By {request.user.fullName} ({request.user.email})
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {!isTerminal && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  Actions
                </h3>

                {request.status === "REQUIREMENT_REVIEW" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowDiscoverySheet(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Discovery Meeting
                  </Button>
                )}

                {request.status === "DISCOVERY_MEETING" && (
                  <>
                    {isLoadingInvoiceData ? (
                      <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading invoice data…
                      </Button>
                    ) : !invoiceFormData ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                        Failed to load invoice data. Please try reopening the drawer.
                      </div>
                    ) : !invoiceFormData.tenantId ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                        No tenant found for this request. Please link a tenant before issuing an invoice.
                      </div>
                    ) : (
                      <Button
                        className="w-full bg-amber-600 hover:bg-amber-700"
                        onClick={() => setShowInvoiceSheet(true)}
                      >
                        <Banknote className="w-4 h-4 mr-2" />
                        Issue Custom Invoice
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Request
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Schedule Discovery Sheet */}
      {showDiscoverySheet && request && (
        <ScheduleDiscoverySheet
          request={request}
          onClose={() => setShowDiscoverySheet(false)}
          onSuccess={onRefresh}
        />
      )}

      {/* Custom Invoice Sheet — uses API-resolved data */}
      {showInvoiceSheet && invoiceFormData && (
        <CustomInvoiceSheet
          formData={invoiceFormData}
          onClose={() => setShowInvoiceSheet(false)}
          onSuccess={onRefresh}
        />
      )}

      {/* Cancel Confirm */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={handleCancel}
        title="Cancel Enterprise Request"
        description={`Are you sure you want to cancel the enterprise request from "${request?.companyName}"? This action cannot be undone.`}
        confirmLabel={cancelMutation.isPending ? "Canceling…" : "Cancel Request"}
        isLoading={cancelMutation.isPending}
        variant="destructive"
      />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EnterpriseRequestsClient() {
  const { status: sessionStatus } = useSession();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnterpriseRequestStatus | "">("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<AdminEnterpriseRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthenticated = sessionStatus === "authenticated";
  const LIMIT = 20;

  const { data, isLoading, refetch } = useAdminEnterpriseRequests(
    {
      page,
      limit: LIMIT,
      search: search || undefined,
      status: statusFilter || undefined,
      industry: industryFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    isAuthenticated
  );

  const openDetail = (request: AdminEnterpriseRequest) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  const totalPages = data?.meta?.totalPages ?? 1;
  const rangeStart = data ? (page - 1) * LIMIT + 1 : 0;
  const rangeEnd = data ? Math.min(page * LIMIT, data.meta.total) : 0;

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
        <p className="text-sm text-muted-foreground">
          Please sign in to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Enterprise Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage B2B enterprise onboarding requests
            </p>
          </div>
          {data?.meta?.total !== undefined && (
            <div className="text-sm font-medium text-slate-500 shrink-0">
              {data.meta.total} total request{data.meta.total !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-5">
          {/* Stats Overview */}
          <StatsBar statusCounts={data?.statusCounts} />

          {/* Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative col-span-2 sm:col-span-3 lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                className="pl-9 h-9"
                placeholder="Search company name…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as EnterpriseRequestStatus | "");
                setPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 text-slate-700 col-span-1"
            >
              <option value="">All Statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>

            <Input
              className="h-9"
              placeholder="Industry…"
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
            />

            <Input
              type="date"
              className="h-9"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              title="From date"
            />

            <Input
              type="date"
              className="h-9"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              title="To date"
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : !data?.items.length ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <BarChart3 className="w-10 h-10 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-700">No requests found</h3>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3.5">Company</th>
                        <th className="px-5 py-3.5">Submitted By</th>
                        <th className="px-5 py-3.5">Industry</th>
                        <th className="px-5 py-3.5">Quotas</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Submitted</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.items.map((req) => {
                        const statusCfg = STATUS_CONFIG[req.status];
                        return (
                          <tr
                            key={req.id}
                            className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                            onClick={() => openDetail(req)}
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                  <Building2 className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {req.companyName}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    {req.billingType} · {req.companySize}
                                  </p>
                                  {req.tenant && (
                                    <span
                                      className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                                        req.tenant.tier === "CUSTOM"
                                          ? "border-purple-200 text-purple-700 bg-purple-50"
                                          : req.tenant.tier === "PRO"
                                            ? "border-blue-200 text-blue-700 bg-blue-50"
                                            : req.tenant.tier === "BASIC"
                                              ? "border-green-200 text-green-700 bg-green-50"
                                              : "border-slate-200 text-slate-600 bg-slate-50"
                                      }`}
                                    >
                                      {req.tenant.name} · {req.tenant.tier}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <UserAvatar user={req.user ?? undefined} />
                                <div>
                                  <p className="font-medium text-slate-800 text-xs">
                                    {req.user?.fullName ?? "—"}
                                  </p>
                                  <p className="text-xs text-slate-400">{req.user?.email ?? ""}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                {req.industry}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-xs text-slate-500 space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-700">
                                    {req.requestedUsers === 0 ? "∞" : req.requestedUsers.toLocaleString()}
                                  </span>
                                  <span>users</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-slate-700">
                                    {req.requestedStorageGb === 0 ? "∞" : req.requestedStorageGb.toLocaleString()}
                                  </span>
                                  <span>GB</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge className={`${statusCfg.bg} ${statusCfg.color} border-0 font-medium text-xs`}>
                                {statusCfg.label}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-500">
                              {formatDate(req.createdAt)}
                            </td>
                            <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {req.user?.email && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Email"
                                    className="text-slate-500 hover:text-blue-600"
                                    onClick={() => window.open(`mailto:${req.user!.email}`, "_blank")}
                                  >
                                    <Mail className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => openDetail(req)}
                                >
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data.meta.total > 0 && (
                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-3.5">
                    <p className="text-xs text-slate-500">
                      Showing <span className="font-medium text-slate-700">{rangeStart}–{rangeEnd}</span> of{" "}
                      <span className="font-medium text-slate-700">{data.meta.total}</span>
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

      {/* Detail Drawer */}
      <RequestDetailDrawer
        request={selectedRequest}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRefresh={refetch}
      />
    </div>
  );
}
