"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useSession } from "next-auth/react";
import {
  useCurrentPlan,
  usePaymentHistory,
  useCustomPaymentHistory,
  useCustomPendingPayment,
  useCancelPendingPayment,
  useCancelSubscriptionRenewal,
} from "@/hooks/api/usePayments";
import { useEnterpriseRequests } from "@/hooks/api/useEnterpriseRequests";
import { getActiveTenantId } from "@/lib/tenant";
import { PaymentTransaction, PaymentTier, TenantSubscriptionStatus } from "@/types/payments";
import type { EnterpriseRequest, EnterpriseRequestStatus } from "@/types/enterprise";
import {
  AlertTriangle,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  MoreHorizontal,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import DynamicTabs from "../components/Layout/DynamicTabs";
import { DataTable } from "../components/table/DataTable";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { gooeyToast } from "goey-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_LABELS: Record<PaymentTier, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PRO: "Pro",
  CUSTOM: "Enterprise",
};

const TIER_BADGE_CLASSES: Record<PaymentTier, string> = {
  FREE: "bg-slate-100 text-slate-700",
  BASIC: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
  CUSTOM: "bg-amber-100 text-amber-700",
};

// Status badge — handles both uppercase FE states and lowercase Midtrans raw statuses
const getStatusBadge = (status: string) => {
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    PENDING: "text-yellow-600 border-yellow-600 bg-yellow-50",
    SETTLEMENT: "text-green-600 border-green-600 bg-green-50",
    CAPTURE: "text-green-600 border-green-600 bg-green-50",
    SUCCESS: "text-green-600 border-green-600 bg-green-50",
    FAILURE: "text-red-600 border-red-600 bg-red-50",
    DENY: "text-red-600 border-red-600 bg-red-50",
    FAILED: "text-red-600 border-red-600 bg-red-50",
    CANCEL: "text-gray-600 border-gray-600 bg-gray-50",
    CANCELLED: "text-gray-600 border-gray-600 bg-gray-50",
    EXPIRE: "text-orange-600 border-orange-600 bg-orange-50",
    EXPIRED: "text-orange-600 border-orange-600 bg-orange-50",
  };
  return map[s] ?? "text-gray-600 border-gray-600 bg-gray-50";
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const bytesToGb = (bytes: number) => {
  if (bytes === 0) return "0";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
  return `${gb.toFixed(2)} GB`;
};

const getDaysUntil = (dateStr: string | null) => {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── Enterprise Request helpers ──────────────────────────────────────────────

const ENTERPRISE_STATUS_CONFIG: Record<
  EnterpriseRequestStatus,
  { label: string; color: string }
> = {
  REQUIREMENT_REVIEW: { label: "Requirement Review", color: "bg-blue-100 text-blue-700" },
  DISCOVERY_MEETING: { label: "Discovery Meeting", color: "bg-purple-100 text-purple-700" },
  CONTRACT_ONBOARDING: { label: "Contract & Onboarding", color: "bg-amber-100 text-amber-700" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
  CANCELED: { label: "Canceled", color: "bg-red-100 text-red-700" },
};

function EnterpriseRequestsList({
  requests,
}: {
  requests: EnterpriseRequest[];
}) {
  return (
    <div className="divide-y">
      {requests.map((req) => {
        const statusCfg =
          ENTERPRISE_STATUS_CONFIG[req.status ?? "REQUIREMENT_REVIEW"];
        return (
          <div
            key={req.id}
            className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{req.companyName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {req.industry} &middot; {req.billingType}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(req.createdAt ?? null) ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Badge className={statusCfg.color}>
                {statusCfg.label}
              </Badge>
              {req.status !== "COMPLETED" && req.status !== "CANCELED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    (window.location.href = "/enterprise/submitted")
                  }
                >
                  View
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared columns for both regular & custom history tables ─────────────────

const paymentColumns: ColumnDef<PaymentTransaction>[] = [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.original.orderId.slice(-12)}
      </span>
    ),
  },
  {
    accessorKey: "tierToUpgrade",
    header: "Plan",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={TIER_BADGE_CLASSES[row.original.tierToUpgrade] ?? ""}
      >
        {TIER_LABELS[row.original.tierToUpgrade] ?? row.original.tierToUpgrade}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDate(row.original.createdAt) ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "grossAmount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatCurrency(row.original.grossAmount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={getStatusBadge(row.original.status)}
      >
        {row.original.status.toLowerCase()}
      </Badge>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Settings = () => {
  const { data: authMe, isLoading: isAuthLoading, isFetched } = useAuthMe();
  const { data: session } = useSession();
  const tenantId = getActiveTenantId(authMe) ?? "";

  // billing | history | enterprise (outer tabs), regular | custom (sub-tabs inside history)
  const [outerTab, setOuterTab] = useState<"billing" | "history" | "enterprise">("billing");
  const [historySubTab, setHistorySubTab] = useState<"regular" | "custom">("regular");
  const [pageIndex, setPageIndex] = useState(0);

  // Cancel renewal dialog
  const [cancelRenewalOpen, setCancelRenewalOpen] = useState(false);

  // ── Data queries ──────────────────────────────────────────────────────────

  const { data: currentPlan } = useCurrentPlan(tenantId);

  const { data: regularHistory, isLoading: isRegularHistoryLoading } =
    usePaymentHistory({ tenantId, page: pageIndex + 1, limit: 10 });

  const { data: customHistory, isLoading: isCustomHistoryLoading } =
    useCustomPaymentHistory(tenantId);

  const { data: customPending } = useCustomPendingPayment(tenantId);

  const { data: enterpriseRequests, isLoading: isEnterpriseLoading } =
    useEnterpriseRequests({ limit: 50 }, session);

  const { mutate: cancelPayment, isPending: isCancelling } =
    useCancelPendingPayment();

  const { mutate: cancelRenewal, isPending: isCancelRenewalPending } =
    useCancelSubscriptionRenewal();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCancelPayment = (paymentId: string) => {
    if (!tenantId) return;
    cancelPayment(tenantId, {
      onSuccess: () =>
        gooeyToast.success("Payment cancelled successfully"),
      onError: () => gooeyToast.error("Failed to cancel payment"),
    });
  };

  const handleCancelRenewal = () => {
    if (!tenantId) return;
    cancelRenewal(tenantId, {
      onSuccess: () => {
        gooeyToast.success(
          "Auto-renewal cancelled. Your subscription remains active until the end of the billing period."
        );
        setCancelRenewalOpen(false);
      },
      onError: () => gooeyToast.error("Failed to cancel auto-renewal"),
    });
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const daysUntilExpiry = getDaysUntil(currentPlan?.tierValidUntil ?? null);
  const isExpiringSoon =
    daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  const currentTier = currentPlan?.tier ?? "FREE";

  // ── Guards ────────────────────────────────────────────────────────────────

  if (isAuthLoading && !isFetched) {
    return (
      <LayoutWrapper
        title="Tenant Settings"
        description="Manage your tenant, members and collaboration"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      </LayoutWrapper>
    );
  }

  if (!tenantId && !isAuthLoading && isFetched) {
    return (
      <LayoutWrapper
        title="Tenant Settings"
        description="Manage your tenant, members and collaboration"
      >
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-muted-foreground">
            We couldn&apos;t find an active workspace for your account.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </LayoutWrapper>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <LayoutWrapper
      title="Tenant Settings"
      description="Manage your tenant, members and collaboration"
    >
      <div className="max-w-6xl space-y-6">

        {/* ── Read-only banner ───────────────────────────────────────────── */}
        {currentPlan?.isReadonly && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Workspace in read-only mode</p>
              <p className="text-xs mt-0.5">
                Your subscription has expired. You can view data but cannot make changes.
                Please renew your plan to regain full access.
              </p>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-amber-600 hover:bg-amber-700"
              onClick={() => (window.location.href = "/pricing")}
            >
              Renew Plan
            </Button>
          </div>
        )}

        {/* ── Custom plan pending invoice banner ─────────────────────────── */}
        {customPending && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-800">
            <CreditCard className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Enterprise invoice awaiting payment</p>
              <p className="text-xs mt-0.5">
                {formatCurrency(customPending.grossAmount)} — please complete payment
                before {formatDate(customPending.updatedAt ?? null) ?? "the deadline"}.
              </p>
            </div>
            {customPending.snapRedirectUrl && (
              <Button
                size="sm"
                className="shrink-0"
                onClick={() =>
                  window.open(customPending.snapRedirectUrl, "_blank")
                }
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Pay Now
              </Button>
            )}
          </div>
        )}

        {/* ── Expiring soon warning ─────────────────────────────────────── */}
        {isExpiringSoon && !currentPlan?.isReadonly && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50 text-orange-800">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              Your{" "}
              <span className="font-semibold">
                {TIER_LABELS[currentTier]}
              </span>{" "}
              subscription expires in{" "}
              <span className="font-semibold">{daysUntilExpiry} day(s)</span>{" "}
              ({formatDate(currentPlan?.tierValidUntil ?? null)}).
              Auto-renewal is{" "}
              <span className="font-semibold">
                {currentPlan?.isAutoRenew === false ? "disabled" : "enabled"}
              </span>
              .
            </p>
          </div>
        )}

        {/* ── Outer tabs ─────────────────────────────────────────────────── */}
        <DynamicTabs
          value={outerTab}
          onChange={(v) => {
            setOuterTab(v as "billing" | "history" | "enterprise");
            if (v === "history") setHistorySubTab("regular");
          }}
          tabs={[
            { label: "Billings", value: "billing" },
            { label: "Payment History", value: "history" },
            { label: "Enterprise Requests", value: "enterprise" },
          ]}
        />

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* BILLING TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {outerTab === "billing" && (
          <div className="flex gap-6">
            {/* Left column — current plan overview */}
            <div className="flex-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Current plan */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Current plan
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold">
                          {currentPlan?.plan?.name ??
                            TIER_LABELS[currentTier]}
                        </h3>
                        <Badge
                          className={
                            TIER_BADGE_CLASSES[currentTier] ??
                            "bg-slate-100 text-slate-700"
                          }
                        >
                          {TIER_LABELS[currentTier]}
                        </Badge>
                      </div>

                      {/* Validity */}
                      {currentPlan?.tierValidUntil ? (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Valid until{" "}
                            <span className="text-foreground font-medium">
                              {formatDate(currentPlan.tierValidUntil)}
                            </span>
                          </p>
                          {isExpiringSoon && (
                            <p className="text-xs text-orange-600 mt-0.5">
                              Expires in {daysUntilExpiry} day(s)
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No expiration
                        </p>
                      )}

                      <p className="text-sm text-muted-foreground mt-2">
                        Billing period
                      </p>
                      <p className="text-sm font-medium">
                        {currentPlan?.plan?.durationDays
                          ? `${currentPlan.plan.durationDays} days`
                          : "—"}
                      </p>
                    </div>

                    {/* Amount & usage */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Amount
                      </p>
                      <h3 className="text-2xl font-semibold">
                        {currentPlan?.plan?.basePrice
                          ? formatCurrency(currentPlan.plan.basePrice)
                          : "Rp 0"}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          /{" "}
                          {currentPlan?.plan?.durationDays === 365
                            ? "year"
                            : "month"}
                        </span>
                      </h3>

                      <p className="text-sm text-muted-foreground mt-4">
                        Storage
                      </p>
                      <p className="text-sm font-medium">
                        {bytesToGb(currentPlan?.usedStorage ?? 0)} /{" "}
                        {currentPlan?.maxStorage
                          ? currentPlan.maxStorage === 0
                            ? "∞"
                            : bytesToGb(currentPlan.maxStorage)
                          : "—"}
                      </p>
                    </div>

                    {/* Status & actions */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Status
                      </p>
                      <Badge
                        className={
                          currentPlan?.subscriptionStatus === "CANCELED"
                            ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                            : currentPlan?.isExpired
                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                            : currentPlan?.isReadonly
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            : "bg-green-100 text-green-700 hover:bg-green-100"
                        }
                      >
                        {currentPlan?.subscriptionStatus === "CANCELED"
                          ? "Canceled"
                          : currentPlan?.isExpired
                          ? "Expired"
                          : currentPlan?.isReadonly
                          ? "Read-only"
                          : "Active"}
                      </Badge>

                      {/* Subscription status sub-label */}
                      {currentPlan?.subscriptionStatus && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {currentPlan.subscriptionStatus === "CANCELED"
                            ? "Auto-renewal canceled"
                            : currentPlan.subscriptionStatus === "EXPIRED"
                            ? "Subscription expired"
                            : currentPlan.subscriptionStatus === "ACTIVE"
                            ? "Subscription active"
                            : null}
                        </p>
                      )}

                      {/* Auto-renewal badge for BASIC/PRO */}
                      {currentTier !== "FREE" && currentTier !== "CUSTOM" && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={
                              currentPlan?.isAutoRenew === false
                                ? "text-gray-500 border-gray-300"
                                : "text-green-600 border-green-300 bg-green-50"
                            }
                          >
                            <RefreshCcw className="w-3 h-3 mr-1" />
                            {currentPlan?.isAutoRenew === false
                              ? "Renewal off"
                              : "Auto-renew on"}
                          </Badge>
                        </div>
                      )}

                      <div className="space-y-2 mt-4">
                        <Button
                          className="w-full"
                          onClick={() =>
                            (window.location.href = "/pricing")
                          }
                        >
                          {currentPlan?.isExpired || currentPlan?.isReadonly
                            ? "Renew Plan"
                            : "Update Plan"}
                        </Button>

                        {/* Cancel auto-renewal — shown for BASIC/PRO with auto-renew ON */}
                        {currentTier !== "FREE" &&
                          currentTier !== "CUSTOM" &&
                          currentPlan?.isAutoRenew !== false && (
                            <Button
                              variant="outline"
                              className="w-full text-muted-foreground"
                              onClick={() => setCancelRenewalOpen(true)}
                            >
                              Cancel Renewal
                            </Button>
                          )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage usage bar */}
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-3">Storage</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {bytesToGb(currentPlan?.usedStorage ?? 0)}
                      </span>
                      <span className="text-muted-foreground">
                        {currentPlan?.maxStorage
                          ? currentPlan.maxStorage === 0
                            ? "∞"
                            : bytesToGb(currentPlan.maxStorage)
                          : "—"}
                      </span>
                    </div>
                    {currentPlan?.maxStorage ? (
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              ((currentPlan.usedStorage ?? 0) /
                                currentPlan.maxStorage) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — plan details */}
            <div className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    Current plan details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-semibold">
                        {currentPlan?.plan?.name ??
                          TIER_LABELS[currentTier]}
                      </h3>
                      <Badge
                        className={
                          TIER_BADGE_CLASSES[currentTier] ??
                          "bg-slate-100 text-slate-700"
                        }
                      >
                        {TIER_LABELS[currentTier]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan?.plan?.description ?? ""}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <h3 className="text-xl font-semibold">
                      {currentPlan?.plan?.basePrice
                        ? formatCurrency(currentPlan.plan.basePrice)
                        : "Rp 0"}
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        /{" "}
                        {currentPlan?.plan?.durationDays === 365
                          ? "year"
                          : "month"}
                      </span>
                    </h3>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {[
                      currentPlan?.plan?.maxUsers !== undefined
                        ? `${
                            currentPlan.plan.maxUsers === 0
                              ? "Unlimited"
                              : `${currentPlan.plan.maxUsers}`
                          } users`
                        : null,
                      currentPlan?.plan?.baseStorage
                        ? `${bytesToGb(currentPlan.plan.baseStorage)} storage`
                        : null,
                      currentPlan?.plan?.durationDays
                        ? `${currentPlan.plan.durationDays}-day plan`
                        : null,
                    ]
                      .filter(Boolean)
                      .map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm">{feat}</span>
                        </div>
                      ))}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = "/pricing")}
                  >
                    Compare Plan
                  </Button>

                  {/* Security */}
                  <div className="flex items-start gap-2 pt-2">
                    <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Your payment method information is secure and encrypted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PAYMENT HISTORY TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {outerTab === "history" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Payment History</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your payment transactions
            </p>

            {/* Sub-tabs: Regular vs Custom */}
            <div className="flex gap-1 mb-4 border-b">
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  historySubTab === "regular"
                    ? "border-b-2 border-brand-blue text-brand-blue"
                    : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setHistorySubTab("regular")}
              >
                Regular (Basic / Pro)
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  historySubTab === "custom"
                    ? "border-b-2 border-brand-blue text-brand-blue"
                    : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setHistorySubTab("custom")}
              >
                Enterprise
              </button>
            </div>

            {/* ── Regular (BASIC / PRO) — paginated ─────────────────────── */}
            {historySubTab === "regular" && (
              <Card>
                <CardContent className="p-0">
                  {isRegularHistoryLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                    </div>
                  ) : regularHistory?.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No regular plan transactions yet.
                      </p>
                    </div>
                  ) : (
                    <DataTable<PaymentTransaction>
                      data={regularHistory?.items ?? []}
                      columns={[
                        ...paymentColumns,
                        {
                          id: "actions",
                          header: "Action",
                          cell: ({ row }) => {
                            const canCancel =
                              row.original.status === "PENDING";
                            return (
                              <DropdownMenu>
                                <DropdownMenuTrigger>
                                  <MoreHorizontal className="w-4 h-4 cursor-pointer" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    disabled={!canCancel || isCancelling}
                                    onClick={() =>
                                      handleCancelPayment(row.original.id)
                                    }
                                  >
                                    {isCancelling ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Cancel Payment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            );
                          },
                        },
                      ]}
                      manualPagination
                      pageCount={regularHistory?.meta?.totalPages ?? 1}
                      pageIndex={pageIndex}
                      onPageChange={setPageIndex}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Enterprise — full list, no pagination ─────────────────── */}
            {historySubTab === "custom" && (
              <Card>
                <CardContent className="p-0">
                  {isCustomHistoryLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                    </div>
                  ) : customHistory?.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No Enterprise transactions yet.
                      </p>
                    </div>
                  ) : (
                    <DataTable<PaymentTransaction>
                      data={customHistory?.items ?? []}
                      columns={paymentColumns}
                      manualPagination={false}
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ENTERPRISE REQUESTS TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {outerTab === "enterprise" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Enterprise Requests</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage your Enterprise onboarding requests.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => (window.location.href = "/enterprise")}
              >
                <FileText className="w-4 h-4 mr-1" />
                Submit New Request
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {isEnterpriseLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                  </div>
                ) : !enterpriseRequests?.items.length ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No enterprise requests yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = "/enterprise")}
                    >
                      Submit Enterprise Request
                    </Button>
                  </div>
                ) : (
                  <EnterpriseRequestsList requests={enterpriseRequests.items} />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* ── Cancel Renewal Confirmation Dialog ───────────────────────────── */}
      <ConfirmDialog
        open={cancelRenewalOpen}
        onOpenChange={setCancelRenewalOpen}
        onConfirm={handleCancelRenewal}
        title="Cancel Auto-Renewal?"
        description={
          "Your subscription will remain active until the end of the current billing period. " +
          "You can reactivate auto-renewal anytime before it expires."
        }
        confirmLabel={
          isCancelRenewalPending ? "Cancelling…" : "Yes, Cancel Renewal"
        }
        variant="destructive"
      />
    </LayoutWrapper>
  );
};

export default Settings;
