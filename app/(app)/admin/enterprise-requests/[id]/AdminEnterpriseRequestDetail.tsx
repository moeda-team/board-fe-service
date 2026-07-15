"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldAlert,
  ChevronRight,
  Building2,
  Globe,
  Users,
  CalendarDays,
  User,
  CheckCircle2,
  Calendar,
  FileText,
  UserPlus,
  ArrowLeft,
  Clock,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api/useAuth";
import {
  useAdminEnterpriseRequest,
  useUpdateEnterpriseRequestStatus,
  useAssignEnterpriseRequestManager
} from "@/hooks/api/useAdminEnterpriseRequests";
import { gooeyToast } from "goey-toast";
import type {
  AdminEnterpriseRequest,
  EnterpriseRequestStatus,
  EnterpriseRequestStatusLabel
} from "@/types/enterprise";

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

const STATUS_BADGE_STYLES: Record<EnterpriseRequestStatusLabel, string> = {
  New: "bg-blue-50 text-blue-600 border-blue-100",
  "Under Review": "bg-amber-50 text-amber-600 border-amber-100",
  "Proposal Sent": "bg-purple-50 text-purple-600 border-purple-100",
  Negotiation: "bg-orange-50 text-orange-600 border-orange-100",
  Won: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Lost: "bg-red-50 text-red-600 border-red-100"
};

const SALES_STAGES = [
  {
    key: "REQUIREMENT_REVIEW",
    title: "Request Received",
    subtitle: "Initial review of customer requirements"
  },
  {
    key: "DISCOVERY_MEETING",
    title: "Discovery",
    subtitle: "Schedule discovery call"
  },
  {
    key: "CONTRACT_ONBOARDING",
    title: "Solution Design",
    subtitle: "Define solution & scope"
  },
  {
    key: "PROPOSAL",
    title: "Proposal",
    subtitle: "Send proposal to customer"
  },
  {
    key: "CONTRACT",
    title: "Contract",
    subtitle: "Contract negotiation"
  },
  {
    key: "COMPLETED",
    title: "Go Live",
    subtitle: "Onboarding & implementation"
  }
] as const;

const MANAGERS = [
  { id: "1", fullName: "Rudi Hartono", avatarUrl: null },
  { id: "2", fullName: "Sarah Wijaya", avatarUrl: null },
  { id: "3", fullName: "Andi Pratama", avatarUrl: null },
  { id: "4", fullName: "Dewi Ananda", avatarUrl: null }
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
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
  return value;
}

function formatCompanySize(value: string): string {
  if (!value) return "-";
  const nums = value.match(/\d+/g);
  if (nums && nums.length === 2) {
    return `${nums[1]} Employees`;
  }
  if (nums && nums.length === 1) {
    return `${nums[0]} Employees`;
  }
  return value;
}

function getStageIndex(status?: EnterpriseRequestStatus | null) {
  if (!status) return 0;
  const map: Record<EnterpriseRequestStatus, number> = {
    REQUIREMENT_REVIEW: 0,
    DISCOVERY_MEETING: 1,
    CONTRACT_ONBOARDING: 3,
    COMPLETED: 5,
    CANCELED: 0
  };
  return map[status] ?? 0;
}

export default function AdminEnterpriseRequestDetail({ id }: { id: string }) {
  const { status } = useSession();
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const isSuperAdmin = authMe?.user?.isSuperAdmin === true;
  const router = useRouter();

  const { data: request, isLoading: isRequestLoading } =
    useAdminEnterpriseRequest(id, isSuperAdmin);
  const updateStatus = useUpdateEnterpriseRequestStatus();
  const assignManager = useAssignEnterpriseRequestManager();

  const [selectedStatus, setSelectedStatus] = useState<
    EnterpriseRequestStatus | ""
  >("");
  const assignmentRef = useRef<HTMLDivElement>(null);

  if (status === "loading" || isAuthLoading || isRequestLoading) {
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

  if (!request) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-10 text-center">
        <FileText className="size-10 text-slate-300" />
        <h2 className="text-lg font-semibold">Request not found</h2>
        <p className="text-sm text-muted-foreground">
          The enterprise request you are looking for does not exist.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/enterprise-requests")}
        >
          Back to list
        </Button>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[request.status ?? "REQUIREMENT_REVIEW"];
  const currentStage = getStageIndex(request.status);

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    const newStatus = value as EnterpriseRequestStatus;
    setSelectedStatus(newStatus);
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          gooeyToast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
          setSelectedStatus("");
        },
        onError: () => {
          setSelectedStatus("");
        }
      }
    );
  };

  const handleAssignManager = (managerId: string) => {
    assignManager.mutate(
      { id, managerId },
      {
        onSuccess: () => {
          gooeyToast.success("Account manager assigned");
        }
      }
    );
  };

  return (
    <div className="min-h-full bg-slate-50">
      {/* Breadcrumb + Header */}
      <div className="border-b bg-white px-6 py-6">
        <button
          onClick={() => router.push("/admin/enterprise-requests")}
          className="mb-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Enterprise Requests
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Enterprise Request Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review customer requirements and progress the enterprise
              opportunity.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/enterprise-requests/${id}/schedule`)
              }
            >
              <Calendar className="size-4" />
              Schedule Discovery Meeting
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                router.push(`/admin/enterprise-requests/${id}/proposal`)
              }
            >
              <FileText className="size-4" />
              Generate Proposal
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusChange("CONTRACT_ONBOARDING")}
              disabled={updateStatus.isPending}
            >
              <CheckCircle2 className="size-4" />
              Mark as Qualified
            </Button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Company Information */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="size-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Company Information
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center gap-5 sm:col-span-2">
                  <div className="flex size-16 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
                    {getInitials(request.companyName)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {request.companyName}
                    </p>
                    <p className="text-sm text-slate-500">{request.industry}</p>
                  </div>
                </div>

                <InfoRow label="Company Name" value={request.companyName} />
                <InfoRow label="Industry" value={request.industry} />
                <InfoRow
                  label="Website"
                  value={request.companyWebsite}
                  isLink
                />
                <InfoRow
                  label="Company Size"
                  value={formatCompanySize(request.companySize)}
                />
                <InfoRow label="Department" value={request.contactDepartment} />
              </div>
            </div>

            {/* Primary Contact & Internal Assignment */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <User className="size-4" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Primary Contact
                  </h2>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src="" alt={request.contactName} />
                    <AvatarFallback className="bg-slate-800 text-sm text-white">
                      {getInitials(request.contactName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {request.contactName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {request.contactTitle}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <InfoRow label="Full Name" value={request.contactName} />
                  <InfoRow label="Job Title" value={request.contactTitle} />
                  <InfoRow
                    label="Work Email"
                    value={request.contactEmail}
                    isLink
                  />
                  <InfoRow label="Phone Number" value={request.contactPhone} />
                </div>
              </div>

              <div
                ref={assignmentRef}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Users className="size-4" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Internal Assignment
                  </h2>
                </div>
                <div className="mt-5 space-y-4">
                  <AssignmentRow
                    label="Account Manager"
                    value={request.assignedAccountManager ?? null}
                    managers={MANAGERS}
                    onAssign={handleAssignManager}
                    isLoading={assignManager.isPending}
                  />
                  <AssignmentRow
                    label="Solutions Architect"
                    value={null}
                    managers={MANAGERS}
                    onAssign={handleAssignManager}
                    isLoading={assignManager.isPending}
                  />
                  <AssignmentRow
                    label="Implementation Lead"
                    value={null}
                    managers={MANAGERS}
                    onAssign={handleAssignManager}
                    isLoading={assignManager.isPending}
                  />
                </div>
              </div>
            </div>

            {/* Request Summary */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="size-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">
                  Request Summary
                </h2>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {request.additionalNotes || "No additional notes provided."}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <SummaryItem
                  icon={<Wallet className="size-4 text-blue-600" />}
                  label="Budget"
                  value={formatBudgetRange(request.budgetRange)}
                />
                <SummaryItem
                  icon={<Users className="size-4 text-blue-600" />}
                  label="Employees"
                  value={formatCompanySize(request.companySize)}
                />
                <SummaryItem
                  icon={<CalendarDays className="size-4 text-blue-600" />}
                  label="Requested On"
                  value={formatDate(request.createdAt)}
                />
                <SummaryItem
                  icon={<Clock className="size-4 text-blue-600" />}
                  label="Expected Go Live"
                  value="Q3 2025"
                />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Enterprise Status */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Enterprise Status
              </h2>
              <div className="mt-4">
                <Badge
                  variant="outline"
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_STYLES[statusLabel]}`}
                >
                  <span className="mr-1.5 size-2 rounded-full bg-current" />
                  {statusLabel}
                </Badge>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-slate-500">
                  Update Status
                </label>
                <Select
                  value={selectedStatus || request.status}
                  onValueChange={handleStatusChange}
                  disabled={updateStatus.isPending}
                >
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUIREMENT_REVIEW">New</SelectItem>
                    <SelectItem value="DISCOVERY_MEETING">
                      Under Review
                    </SelectItem>
                    <SelectItem value="CONTRACT_ONBOARDING">
                      Proposal Sent
                    </SelectItem>
                    <SelectItem value="COMPLETED">Won</SelectItem>
                    <SelectItem value="CANCELED">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sales Stage Progress */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Sales Stage Progress
              </h2>
              <div className="mt-4 space-y-0">
                {SALES_STAGES.map((stage, index) => {
                  const isActive = index <= currentStage;
                  const isCurrent = index === currentStage;
                  return (
                    <div key={stage.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isActive ? (
                            isCurrent ? (
                              index + 1
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )
                          ) : (
                            index + 1
                          )}
                        </div>
                        {index !== SALES_STAGES.length - 1 && (
                          <div
                            className={`mt-1 h-full w-px ${
                              isActive ? "bg-blue-600" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="pb-6">
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {stage.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {stage.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() =>
                  router.push(`/admin/enterprise-requests/${id}/schedule`)
                }
              >
                <Calendar className="size-4" />
                Schedule Discovery Call
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  assignmentRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                  })
                }
              >
                <UserPlus className="size-4" />
                Assign Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isLink
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  const displayValue = value || "-";
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {isLink && value ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noreferrer"
          className="mt-0.5 flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
        >
          {value}
          <Globe className="size-3" />
        </a>
      ) : (
        <p className="mt-0.5 text-sm font-medium text-slate-900">
          {displayValue}
        </p>
      )}
    </div>
  );
}

function SummaryItem({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function AssignmentRow({
  label,
  value,
  managers,
  onAssign,
  isLoading
}: {
  label: string;
  value: { id: string; fullName: string; avatarUrl: string | null } | null;
  managers: { id: string; fullName: string; avatarUrl: string | null }[];
  onAssign: (managerId: string) => void;
  isLoading: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="relative mt-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          disabled={isLoading}
        >
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage
                src={value?.avatarUrl ?? ""}
                alt={value?.fullName ?? ""}
              />
              <AvatarFallback className="bg-slate-200 text-[10px] text-slate-700">
                {value ? getInitials(value.fullName) : "—"}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-slate-900">
              {value?.fullName ?? "Unassigned"}
            </span>
          </div>
          <ChevronRight className="size-4 text-slate-400" />
        </button>
        {open && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white py-1 shadow-lg">
            {managers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onAssign(m.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <Avatar className="size-6">
                  <AvatarImage src={m.avatarUrl ?? ""} alt={m.fullName} />
                  <AvatarFallback className="bg-slate-200 text-[10px] text-slate-700">
                    {getInitials(m.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-700">{m.fullName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
