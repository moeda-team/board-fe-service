"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Loader2,
  ShieldAlert,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { gooeyToast } from "goey-toast";
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/hooks/api/useAdminPlans";
import type { AdminPlan, CreatePlanDto, UpdatePlanDto } from "@/types/admin-plan";
import type { AdminPlanTier } from "@/types/admin-plan";

const TIER_LABELS: Record<AdminPlanTier, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PRO: "Pro",
  CUSTOM: "Enterprise",
};

const TIER_COLORS: Record<AdminPlanTier, string> = {
  FREE: "bg-slate-100 text-slate-700",
  BASIC: "bg-blue-100 text-blue-700",
  PRO: "bg-purple-100 text-purple-700",
  CUSTOM: "bg-amber-100 text-amber-700",
};

const TIERS: AdminPlanTier[] = ["FREE", "BASIC", "PRO", "CUSTOM"];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function bytesToGb(bytes: number) {
  if (!bytes) return "0 GB";
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(0)} GB`;
}

function PlanForm({
  plan,
  onClose,
  onSuccess,
}: {
  plan: AdminPlan | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();

  const isEdit = !!plan;
  const [tier, setTier] = useState<AdminPlanTier>(plan?.tier ?? "BASIC");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [basePrice, setBasePrice] = useState(String(plan?.basePrice ?? ""));
  const [maxUsers, setMaxUsers] = useState(String(plan?.maxUsers ?? ""));
  const [baseStorage, setBaseStorage] = useState(
    String(plan ? plan.baseStorage / (1024 * 1024 * 1024) : "")
  );
  const [maxWorkspaces, setMaxWorkspaces] = useState(String(plan?.maxWorkspaces ?? ""));
  const [durationDays, setDurationDays] = useState(String(plan?.durationDays ?? "30"));
  const [pricePerGb, setPricePerGb] = useState(String(plan?.pricePerGb ?? ""));
  const [isActive, setIsActive] = useState(plan?.isActive ?? true);
  const [originalPrice, setOriginalPrice] = useState(String(plan?.originalPrice ?? ""));
  const [campaignName, setCampaignName] = useState(plan?.campaignName ?? "");
  const [campaignEndDate, setCampaignEndDate] = useState(plan?.campaignEndDate ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const basePriceNum = parseFloat(basePrice) || 0;
    const maxUsersNum = parseInt(maxUsers) || 0;
    const baseStorageNum = Math.round(parseFloat(baseStorage) * 1024 * 1024 * 1024) || 0;
    const maxWorkspacesNum = parseInt(maxWorkspaces) || 0;
    const durationDaysNum = parseInt(durationDays) || 30;

    const dto: CreatePlanDto | UpdatePlanDto = {
      tier,
      name,
      description: description || undefined,
      basePrice: basePriceNum,
      maxUsers: maxUsersNum,
      baseStorage: baseStorageNum,
      maxWorkspaces: maxWorkspacesNum,
      durationDays: durationDaysNum,
      pricePerGb: pricePerGb ? parseFloat(pricePerGb) : undefined,
      isActive,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      campaignName: campaignName || undefined,
      campaignEndDate: campaignEndDate || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: plan.id, dto: dto as UpdatePlanDto },
        {
          onSuccess: () => {
            gooeyToast.success("Plan updated");
            onSuccess();
          },
          onError: () => gooeyToast.error("Failed to save plan"),
        }
      );
    } else {
      createMutation.mutate(dto as CreatePlanDto, {
        onSuccess: () => {
          gooeyToast.success("Plan created");
          onSuccess();
        },
        onError: () => gooeyToast.error("Failed to save plan"),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-base font-semibold">
            {isEdit ? "Edit Plan" : "Create Plan"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Tier</label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-white px-3 text-sm outline-none"
                value={tier}
                onChange={(e) => setTier(e.target.value as AdminPlanTier)}
                required
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>{TIER_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Base Price (IDR)</label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Max Users (0=unlimited)</label>
              <Input
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Workspaces (0=unlimited)</label>
              <Input
                type="number"
                value={maxWorkspaces}
                onChange={(e) => setMaxWorkspaces(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Storage (GB)</label>
              <Input
                type="number"
                value={baseStorage}
                onChange={(e) => setBaseStorage(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Duration (days)</label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Price per GB (IDR, optional)</label>
              <Input
                type="number"
                value={pricePerGb}
                onChange={(e) => setPricePerGb(e.target.value)}
                placeholder="For CUSTOM tier"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Original Price (for anchoring)</label>
              <Input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Strikethrough price"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Campaign Name</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Early Bird"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Campaign End Date</label>
              <Input
                type="date"
                value={campaignEndDate ? campaignEndDate.slice(0, 10) : ""}
                onChange={(e) =>
                  setCampaignEndDate(e.target.value ? `${e.target.value}T23:59:59.000Z` : "")
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium">{isActive ? "Active" : "Inactive"}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Create Plan"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlansClient() {
  const { status: sessionStatus } = useSession();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPlan | null>(null);

  const { data: plans = [], isLoading } = useAdminPlans(sessionStatus === "authenticated");
  const deleteMutation = useDeletePlan();
  const updateMutation = useUpdatePlan();

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        gooeyToast.success("Plan deleted");
        setDeleteTarget(null);
      },
      onError: () => gooeyToast.error("Failed to delete plan"),
    });
  };

  const handleToggleActive = (plan: AdminPlan) => {
    updateMutation.mutate(
      { id: plan.id, dto: { isActive: !plan.isActive } },
      {
        onSuccess: () => gooeyToast.success("Plan updated"),
        onError: () => gooeyToast.error("Failed to update plan"),
      }
    );
  };

  const openEdit = (plan: AdminPlan) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPlan(null);
  };

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
            <h1 className="text-xl font-bold text-slate-900">Subscription Plans</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage plan catalog and pricing
            </p>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 shrink-0"
            onClick={() => { setEditingPlan(null); setFormOpen(true); }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <CreditCard className="w-10 h-10 text-slate-300" />
              <h3 className="text-base font-semibold text-slate-700">No plans yet</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const tierColor = TIER_COLORS[plan.tier];
                const tierLabel = TIER_LABELS[plan.tier];
                const isPending = updateMutation.isPending && updateMutation.variables?.id === plan.id;
                return (
                  <Card key={plan.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className={tierColor}>{tierLabel}</Badge>
                          <CardTitle className="text-base mt-1">{plan.name}</CardTitle>
                          {plan.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(plan)}
                            disabled={isPending}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              plan.isActive ? "bg-green-100" : "bg-slate-100"
                            }`}
                          >
                            {plan.isActive ? (
                              <Check className="w-3 h-3 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-3 h-3 text-slate-400 mx-auto" />
                            )}
                          </button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-baseline gap-1">
                        {plan.originalPrice && plan.originalPrice > plan.basePrice && (
                          <span className="text-muted-foreground line-through text-xs">
                            {formatCurrency(plan.originalPrice)}
                          </span>
                        )}
                        <span className="text-xl font-bold">
                          {formatCurrency(plan.basePrice)}
                        </span>
                        <span className="text-muted-foreground">/{plan.durationDays}d</span>
                      </div>

                      {plan.campaignName && (
                        <div className="text-xs bg-green-50 text-green-700 rounded px-2 py-1 font-medium">
                          {plan.campaignName}
                        </div>
                      )}

                      <div className="pt-2 space-y-1 text-xs text-muted-foreground">
                        <p>{plan.maxUsers === 0 ? "∞" : plan.maxUsers} users</p>
                        <p>{bytesToGb(plan.baseStorage)} storage</p>
                        <p>{plan.maxWorkspaces === 0 ? "∞" : plan.maxWorkspaces} workspaces</p>
                      </div>

                      <div className="flex gap-1 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEdit(plan)}
                        >
                          <Pencil className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(plan)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Form */}
      {formOpen && (
        <PlanForm
          plan={editingPlan}
          onClose={closeForm}
          onSuccess={closeForm}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Plan"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel={deleteMutation.isPending ? "Deleting…" : "Delete"}
        variant="destructive"
      />
    </div>
  );
}
