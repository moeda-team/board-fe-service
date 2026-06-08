"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import {
  usePaymentHistory,
  useCancelPendingPayment
} from "@/hooks/api/usePayments";
import { getActiveTenantId } from "@/lib/tenant";
import { PaymentTransaction } from "@/types/payments";
import {
  Check,
  CreditCard,
  Lock,
  MoreHorizontal,
  Shield,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import LayoutWrapper from "../components/Layout/LayoutWrapper";
import DynamicTabs from "../components/Layout/DynamicTabs";
import { DataTable } from "../components/table/DataTable";
import { toast } from "sonner";

// Current plan features
const planFeatures = [
  "Up to 10 Members",
  "Up to 10 Workspace",
  "Custom Roles",
  "Advance Permissions"
];

// Status badge helper
const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: "text-yellow-600 border-yellow-600 bg-yellow-50",
    SUCCESS: "text-green-600 border-green-600 bg-green-50",
    FAILED: "text-red-600 border-red-600 bg-red-50",
    CANCELLED: "text-gray-600 border-gray-600 bg-gray-50",
    EXPIRED: "text-orange-600 border-orange-600 bg-orange-50"
  };
  return styles[status] || "text-gray-600 border-gray-600";
};

const Settings = () => {
  const { data: authMe, isLoading: isAuthLoading, isFetched } = useAuthMe();
  const tenantId = getActiveTenantId(authMe);
  const [activeTab, setActiveTab] = useState("billing");
  const [pageIndex, setPageIndex] = useState(0);

  // Payment history data
  const { data: paymentHistory, isLoading: isPaymentHistoryLoading } =
    usePaymentHistory({
      tenantId: tenantId || "",
      page: pageIndex + 1,
      limit: 10
    });

  const { mutate: cancelPayment, isPending: isCancelling } =
    useCancelPendingPayment();

  const handleCancelPayment = (paymentId: string) => {
    if (!tenantId) return;
    cancelPayment(tenantId, {
      onSuccess: () => {
        toast.success("Payment cancelled successfully");
      },
      onError: () => {
        toast.error("Failed to cancel payment");
      }
    });
  };

  const paymentColumns: ColumnDef<PaymentTransaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      )
    },
    {
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.orderId.slice(-12)}
        </span>
      )
    },
    {
      accessorKey: "tierToUpgrade",
      header: "Plan"
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }
    },
    {
      accessorKey: "grossAmount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
          }).format(row.original.grossAmount)}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`capitalize ${getStatusBadge(row.original.status)}`}
        >
          {row.original.status.toLowerCase()}
        </Badge>
      )
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const canCancel = row.original.status === "PENDING";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal className="w-4 h-4 cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="text-red-600"
                disabled={!canCancel || isCancelling}
                onClick={() => handleCancelPayment(row.original.id)}
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Cancel Payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

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
          <p className="text-slate-500">
            We couldn&apos;t find an active workspace for your account.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper
      title="Tenant Settings"
      description="Manage your tenant, members and collaboration"
    >
      <div className="max-w-6xl">
        {/* Tabs */}
        <DynamicTabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { label: "Billings", value: "billing" },
            { label: "Payment History", value: "history" }
          ]}
          className="mb-6"
        />

        {/* Billing Content */}
        {activeTab === "billing" && (
          <div className="flex gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              {/* Billing Overview */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Billing overview</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage people who has access to this tenant
                </p>

                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Current Plan */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Current plan
                        </p>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">Basic Plan</h3>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100"
                          >
                            Free
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          22 Juni 2025
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Billing period
                        </p>
                        <p className="text-sm text-muted-foreground">-</p>
                      </div>

                      {/* Amount & Seats */}
                      {/* <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Amount
                        </p>
                        <h3 className="text-2xl font-semibold">
                          $ 0{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                            USD / Month
                          </span>
                        </h3>
                        <p className="text-xs text-green-600 mt-1 bg-green-50 inline-block px-2 py-1 rounded">
                          You save $40 with yearly billings
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                          Seats
                        </p>
                        <p className="text-sm font-medium">1/10 users</p>
                      </div> */}

                      {/* Status & Actions */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Status
                        </p>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 mb-4">
                          Active
                        </Badge>
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => (window.location.href = "/pricing")}
                          >
                            Update Plan
                          </Button>
                          {/* <Button variant="outline" className="w-full">
                            Manage members
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Current Plan Details */}
            <div className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">
                    Current plan details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xl font-semibold">Basic Plan</h3>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100"
                      >
                        Free
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Best for trial
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <h3 className="text-xl font-semibold">
                      $ 0{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        USD / Month
                      </span>
                    </h3>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {planFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Compare Plan Button */}
                  <Button variant="outline" className="w-full">
                    Compare Plan
                  </Button>

                  {/* Payment Method */}
                  {/* <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Payment Method</h4>
                    <div className="flex items-center gap-3 p-3 border rounded-lg mb-3">
                      <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">VISA</p>
                        <p className="text-sm text-muted-foreground">
                          12934******723
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Add payment method
                    </Button>
                  </div> */}

                  {/* Security Note */}
                  <div className="flex items-start gap-2 pt-2">
                    <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Your payment method information is secure and encrypted
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Payment History Content */}
        {activeTab === "history" && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Payment History</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your payment transactions
            </p>

            <Card>
              <CardContent className="p-0">
                {isPaymentHistoryLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                  </div>
                ) : (
                  <DataTable<PaymentTransaction>
                    data={paymentHistory?.items || []}
                    columns={paymentColumns}
                    manualPagination
                    pageCount={paymentHistory?.meta?.totalPages ?? 1}
                    pageIndex={pageIndex}
                    onPageChange={setPageIndex}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default Settings;
