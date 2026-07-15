"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ShieldAlert,
  ArrowLeft,
  FileText,
  Building2,
  Users,
  Wallet,
  Plus,
  Trash2,
  Send,
  CheckCircle2,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuthMe } from "@/hooks/api/useAuth";
import { useAdminEnterpriseRequest } from "@/hooks/api/useAdminEnterpriseRequests";
import { gooeyToast } from "goey-toast";

const LINE_ITEMS = [
  { id: "1", service: "Enterprise Platform License", quantity: 1, unitPrice: 25_000_000 },
  { id: "2", service: "Implementation & Onboarding", quantity: 1, unitPrice: 15_000_000 },
  { id: "3", service: "Premium Support (annual)", quantity: 1, unitPrice: 9_000_000 }
];

export default function AdminEnterpriseRequestProposal({
  id
}: {
  id: string;
}) {
  const { status } = useSession();
  const { data: authMe, isLoading: isAuthLoading } = useAuthMe();
  const isSuperAdmin = authMe?.user?.isSuperAdmin === true;
  const router = useRouter();

  const { data: request, isLoading: isRequestLoading } = useAdminEnterpriseRequest(
    id,
    isSuperAdmin
  );

  const [billingCycle, setBillingCycle] = useState("Annual");
  const [term, setTerm] = useState("12 months");
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState(LINE_ITEMS);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );
  const discountAmount = useMemo(
    () => Math.round((subtotal * discount) / 100),
    [subtotal, discount]
  );
  const total = subtotal - discountAmount;

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
        <p className="text-sm text-muted-foreground">Please sign in to access this page.</p>
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

  const updateItem = (index: number, field: keyof typeof LINE_ITEMS[0], value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: typeof value === "number" ? value : String(value)
      };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        service: "New line item",
        quantity: 1,
        unitPrice: 0
      }
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      gooeyToast.success("Proposal sent to customer");
      router.push(`/admin/enterprise-requests/${id}`);
    }, 800);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(n);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b bg-white px-6 py-6">
        <button
          onClick={() => router.push(`/admin/enterprise-requests/${id}`)}
          className="mb-3 flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to request
        </button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Generate Proposal</h1>
            <p className="mt-1 text-sm text-slate-500">
              {request ? request.companyName : "Loading company..."}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        <form
          onSubmit={handleSend}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]"
        >
          {/* Left column */}
          <div className="space-y-6">
            {/* Customer card */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="size-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Customer</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Company</p>
                  <p className="font-medium text-slate-900">{request?.companyName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Contact</p>
                  <p className="font-medium text-slate-900">{request?.contactName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Industry</p>
                  <p className="font-medium text-slate-900">{request?.industry}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Company Size</p>
                  <p className="font-medium text-slate-900">{request?.companySize}</p>
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Receipt className="size-4" />
                  </div>
                  <h2 className="text-base font-semibold text-slate-900">Line Items</h2>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="size-3.5" />
                  Add item
                </Button>
              </div>

              <div className="mt-4 space-y-3">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 items-start gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_80px_120px_40px]"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Service</Label>
                      <Input
                        value={item.service}
                        onChange={(e) => updateItem(index, "service", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Qty</Label>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-500">Unit Price</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, "unitPrice", parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </div>
                    <div className="flex h-full items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="size-4 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="size-4" />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Proposal Notes</h2>
              </div>
              <Textarea
                className="mt-4"
                placeholder="Add terms, assumptions, or a personalized message..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          {/* Right column — summary */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">Proposal Summary</h2>

              <div className="mt-4 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Billing Cycle</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(v) => v && setBillingCycle(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Annual">Annual</SelectItem>
                      <SelectItem value="Multi-year">Multi-year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Contract Term</Label>
                  <Select value={term} onValueChange={(v) => v && setTerm(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12 months">12 months</SelectItem>
                      <SelectItem value="24 months">24 months</SelectItem>
                      <SelectItem value="36 months">36 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Discount %</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discount}
                    onChange={(e) =>
                      setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))
                    }
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Discount</span>
                    <span className="font-medium text-slate-900">
                      -{formatCurrency(discountAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base font-semibold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Prices exclude applicable taxes. Valid for 30 days.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Send Proposal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/admin/enterprise-requests/${id}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
