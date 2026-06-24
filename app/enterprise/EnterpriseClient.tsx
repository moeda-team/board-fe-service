"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Headphones,
  HelpCircle,
  LayoutGrid,
  Loader2,
  Pencil,
  Send,
  ShieldCheck,
  Users,
  Wallet,
  Zap
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthMe } from "@/hooks/api/useAuth";
import { getActiveTenantId } from "@/lib/tenant";
import { useCreateCustomInvoice } from "@/hooks/api/usePayments";
import type { CustomInvoiceRequest } from "@/types/payments";

/* ── Helpers ───────────────────────────────────────────── */

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(n);
}

function formatNumberID(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}

/* ── Slider field configuration ────────────────────────── */

type SliderKey = "users" | "spaces" | "storage" | "api";

interface SliderConfig {
  key: SliderKey;
  title: string;
  desc: string;
  unit: string;
  min: number;
  max: number; // reaching max means "Unlimited"
  step: number;
  iconBg: string;
  icon: React.ReactNode;
  // value sent to the backend when "Unlimited" is selected
  unlimitedSend: number;
}

const SLIDERS: SliderConfig[] = [
  {
    key: "users",
    title: "Kebutuhan User (Anggota)",
    desc: "Jumlah anggota yang akan menggunakan Papanclip.",
    unit: "anggota",
    min: 50,
    max: 2000,
    step: 10,
    iconBg: "bg-blue-50",
    icon: <Users className="w-4 h-4 text-blue-600" />,
    unlimitedSend: 0
  },
  {
    key: "spaces",
    title: "Kebutuhan Spaces",
    desc: "Jumlah workspace atau ruang yang dibutuhkan.",
    unit: "unit",
    min: 50,
    max: 1000,
    step: 10,
    iconBg: "bg-purple-50",
    icon: <LayoutGrid className="w-4 h-4 text-purple-600" />,
    unlimitedSend: 0
  },
  {
    key: "storage",
    title: "Kebutuhan Storage",
    desc: "Total penyimpanan data yang dibutuhkan.",
    unit: "GB",
    min: 50,
    max: 5000,
    step: 50,
    iconBg: "bg-green-50",
    icon: <Database className="w-4 h-4 text-green-600" />,
    unlimitedSend: 0
  },
  {
    key: "api",
    title: "Kebutuhan Limit Hit API Bulanan",
    desc: "Perkiraan jumlah hit API yang dibutuhkan per bulan.",
    unit: "Hit",
    min: 50,
    max: 100000,
    step: 100,
    iconBg: "bg-amber-50",
    icon: <Zap className="w-4 h-4 text-amber-500" />,
    unlimitedSend: -1
  }
];

const SLIDER_MAP = SLIDERS.reduce(
  (acc, s) => {
    acc[s.key] = s;
    return acc;
  },
  {} as Record<SliderKey, SliderConfig>
);

interface BillingOption {
  id: string;
  name: string;
  desc: string;
  days: number;
  icon: React.ReactNode;
}

const BILLING_OPTIONS: BillingOption[] = [
  {
    id: "monthly",
    name: "Monthly Billing",
    desc: "Flexible month-to-month billing.",
    days: 30,
    icon: <Calendar className="w-4 h-4 text-blue-600" />
  },
  {
    id: "annual",
    name: "Annual Billing",
    desc: "Pay annually and save with upfront pricing.",
    days: 365,
    icon: <CalendarCheck className="w-4 h-4 text-blue-600" />
  },
  {
    id: "multi",
    name: "Multi-year Agreement",
    desc: "Long-term commitment with best value and terms.",
    days: 1095,
    icon: <FileText className="w-4 h-4 text-blue-600" />
  }
];

const DEFAULT_SLIDERS: Record<SliderKey, number> = {
  users: 250,
  spaces: 100,
  storage: 500,
  api: 10000
};

const INCLUDED_FEATURES = [
  "All Pro features",
  "Advanced security & compliance",
  "Custom integrations",
  "Dedicated onboarding",
  "Priority support & SLA"
];

/* ── Component ──────────────────────────────────────────── */

type Step = "review" | "submit" | "done";

export default function EnterpriseClient() {
  const router = useRouter();
  const { data: authMe } = useAuthMe();
  const tenantId = getActiveTenantId(authMe);
  const { mutateAsync: createCustomInvoice, isPending } =
    useCreateCustomInvoice();

  const [step, setStep] = useState<Step>("review");
  const [enterpriseRequestId] = useState<string>(() => genId());

  const [sliders, setSliders] = useState<Record<SliderKey, number>>({
    ...DEFAULT_SLIDERS
  });
  const [billing, setBilling] = useState<string>("monthly");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Redirect if there is no active tenant.
  useEffect(() => {
    if (!tenantId && authMe) {
      gooeyToast.error("Please select a tenant first");
      router.push("/spaces");
    }
  }, [tenantId, authMe, router]);

  const isUnlimited = (key: SliderKey) => sliders[key] >= SLIDER_MAP[key].max;

  const sliderSummary = (key: SliderKey): string => {
    if (isUnlimited(key)) return "Unlimited";
    return `${formatNumberID(sliders[key])} ${SLIDER_MAP[key].unit}`;
  };

  const sendValue = (key: SliderKey): number =>
    isUnlimited(key) ? SLIDER_MAP[key].unlimitedSend : sliders[key];

  const billingOption =
    BILLING_OPTIONS.find((b) => b.id === billing) ?? BILLING_OPTIONS[0];
  const budgetMinNumber = Number(budgetMin) || 0;
  const budgetMaxNumber = Number(budgetMax) || 0;
  const budgetText =
    budgetMinNumber > 0 && budgetMaxNumber > 0
      ? `${formatIDR(budgetMinNumber)} – ${formatIDR(budgetMaxNumber)} / bulan`
      : budgetMinNumber > 0
        ? `${formatIDR(budgetMinNumber)} / bulan`
        : "—";

  const payload: CustomInvoiceRequest = useMemo(() => {
    const usersLabel = isUnlimited("users") ? "unlimited" : `${sliders.users}`;
    const storageLabel = isUnlimited("storage")
      ? "unlimited storage"
      : `${sliders.storage}GB storage`;
    const description =
      notes.trim() ||
      `Enterprise plan request — ${usersLabel} users, ${storageLabel}, ${billingOption.name}.`;

    return {
      tenantId: tenantId || "",
      amount: budgetMaxNumber || budgetMinNumber,
      maxUsers: sendValue("users"),
      maxWorkspaces: sendValue("spaces"),
      maxStorageGb: sendValue("storage"),
      apiHitsLimit: sendValue("api"),
      durationDays: billingOption.days,
      description,
      enterpriseRequestId
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sliders,
    billing,
    budgetMin,
    budgetMax,
    notes,
    tenantId,
    enterpriseRequestId
  ]);

  const setSlider = (key: SliderKey, value: number) => {
    const cfg = SLIDER_MAP[key];
    const clamped = Math.min(Math.max(value, cfg.min), cfg.max);
    setSliders((prev) => ({ ...prev, [key]: clamped }));
  };

  const goToSubmit = () => {
    if (budgetMinNumber <= 0 || budgetMaxNumber <= 0) {
      gooeyToast.error("Please enter both minimum and maximum budget");
      return;
    }
    if (budgetMinNumber > budgetMaxNumber) {
      gooeyToast.error("Minimum budget cannot exceed maximum budget");
      return;
    }
    setStep("submit");
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      gooeyToast.error("Please login first");
      return;
    }
    try {
      await createCustomInvoice(payload);
      setStep("done");
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Error toast handled globally via mutation meta.
    }
  };

  /* ── Success state ─────────────────────────────────────── */

  if (step === "done") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-8 py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Request Submitted!
          </h2>
          <p className="text-gray-500 mb-6">
            Thank you. Our enterprise team will review your request and get back
            to you within one business day.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <p className="text-xs text-gray-500">Request ID</p>
            <p className="font-mono text-sm break-all">{enterpriseRequestId}</p>
          </div>
          <div className="space-y-2">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
              onClick={() => router.push("/spaces")}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => router.push("/pricing")}
            >
              Back to Pricing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const readOnly = step === "submit";

  const summaryRows: { icon: React.ReactNode; label: string; value: string }[] =
    readOnly
      ? [
          {
            icon: <Users className="w-4 h-4 text-blue-600" />,
            label: "Estimated Users",
            value: sliderSummary("users")
          },
          {
            icon: <LayoutGrid className="w-4 h-4 text-blue-600" />,
            label: "Spaces",
            value: sliderSummary("spaces")
          },
          {
            icon: <Database className="w-4 h-4 text-blue-600" />,
            label: "Storage",
            value: sliderSummary("storage")
          },
          {
            icon: <Zap className="w-4 h-4 text-blue-600" />,
            label: "API Hit (Bulanan)",
            value: sliderSummary("api")
          },
          {
            icon: <Wallet className="w-4 h-4 text-blue-600" />,
            label: "Ajukan Harga (Estimasi Budget)",
            value: budgetText
          },
          {
            icon: <Calendar className="w-4 h-4 text-blue-600" />,
            label: "Billing Preference",
            value: billingOption.name
          },
          {
            icon: <Clock className="w-4 h-4 text-blue-600" />,
            label: "Expected Go-Live",
            value: "Within 1 month"
          },
          {
            icon: <Headphones className="w-4 h-4 text-blue-600" />,
            label: "Support Level",
            value: "Dedicated Account Manager"
          }
        ]
      : [
          {
            icon: <Users className="w-4 h-4 text-blue-600" />,
            label: "Estimated Users",
            value: sliderSummary("users")
          },
          {
            icon: <Wallet className="w-4 h-4 text-blue-600" />,
            label: "Ajukan Harga (Estimasi Budget)",
            value: budgetText
          },
          {
            icon: <Calendar className="w-4 h-4 text-blue-600" />,
            label: "Billing Preference",
            value: billingOption.name
          },
          {
            icon: <Clock className="w-4 h-4 text-blue-600" />,
            label: "Expected Go-Live",
            value: "Within 1 month"
          }
        ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-gray-900">Papanclip</span>
            </div>
            <span className="h-5 w-px bg-gray-200" />
            <span className="text-sm text-gray-500 hidden sm:inline">
              Enterprise Subscription
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/contact"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <HelpCircle className="w-4 h-4" />
              Need help?
            </a>
            <a
              href="mailto:sales@papanclip.com"
              className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <StepBadge label="Company Details" state="done" />
          <StepLine active />
          <StepBadge
            index={2}
            label="Review"
            state={readOnly ? "done" : "active"}
          />
          <StepLine active={readOnly} />
          <StepBadge
            index={3}
            label="Submit"
            state={readOnly ? "active" : "todo"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* ── Left column ──────────────────────────────── */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {readOnly
                ? "Review Your Enterprise Request"
                : "Budget & Billing Preferences"}
            </h1>
            <p className="text-gray-500 mt-1 mb-6 text-[15px]">
              {readOnly
                ? "Confirm your requirements before submission."
                : "Help us prepare the best proposal for your organisation."}
            </p>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-7">
              {/* Billing preference — only on review */}
              {!readOnly && (
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Billing Preference
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Choose the billing cycle that works best for your
                    organisation.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {BILLING_OPTIONS.map((opt) => {
                      const selected = billing === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBilling(opt.id)}
                          className={`text-left rounded-xl border p-4 transition ${
                            selected
                              ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-200"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                              {opt.icon}
                            </div>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                selected ? "border-blue-600" : "border-gray-300"
                              }`}
                            >
                              {selected && (
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mt-3">
                            {opt.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section header on submit step with Edit */}
              {readOnly && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold">
                      Budget & Billing Preferences
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              )}

              {/* Sliders */}
              <div className="divide-y divide-gray-100">
                {SLIDERS.map((cfg) => (
                  <SliderRow
                    key={cfg.key}
                    cfg={cfg}
                    value={sliders[cfg.key]}
                    readOnly={readOnly}
                    onChange={(v) => setSlider(cfg.key, v)}
                  />
                ))}
              </div>

              {/* Budget range */}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Ajukan Harga (Estimasi Budget)
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  Masukkan rentang estimasi budget yang Anda siapkan.
                </p>
                <div className="flex items-center gap-2">
                  {/* Min */}
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden flex-1 min-w-0">
                    <span className="px-2.5 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={readOnly}
                      value={budgetMin ? formatNumberID(budgetMinNumber) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        setBudgetMin(raw);
                        const rawNum = Number(raw) || 0;
                        if (rawNum > 0 && rawNum > budgetMaxNumber) {
                          setBudgetMax(raw);
                        }
                      }}
                      placeholder="Minimum"
                      className="w-full min-w-0 px-2.5 py-2.5 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-700"
                    />
                  </div>
                  <span className="text-gray-400 text-sm shrink-0">–</span>
                  {/* Max */}
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden flex-1 min-w-0">
                    <span className="px-2.5 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={readOnly}
                      value={budgetMax ? formatNumberID(budgetMaxNumber) : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const rawNum = Number(raw) || 0;
                        if (
                          budgetMinNumber > 0 &&
                          rawNum > 0 &&
                          rawNum < budgetMinNumber
                        ) {
                          setBudgetMax(budgetMin);
                        } else {
                          setBudgetMax(raw);
                        }
                      }}
                      placeholder="Maximum"
                      className="w-full min-w-0 px-2.5 py-2.5 text-sm outline-none disabled:bg-gray-50 disabled:text-gray-700"
                    />
                  </div>
                  <span className="text-sm text-gray-400 shrink-0 hidden sm:inline">
                    / bulan
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 sm:hidden">
                  / bulan
                </p>
              </div>

              {/* Additional notes */}
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Additional Notes (Optional)
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  Share any additional information that will help us tailor the
                  perfect solution for you.
                </p>
                <div className="relative">
                  <Textarea
                    disabled={readOnly}
                    value={notes}
                    maxLength={1000}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us anything else we should know about your requirements, timeline, or objectives..."
                    className="min-h-28 pb-7"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-gray-400">
                    {notes.length} / 1000
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                className="h-11 px-5"
                onClick={() =>
                  readOnly ? setStep("review") : router.push("/pricing")
                }
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Button>
              {!readOnly && (
                <Button
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={goToSubmit}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>

          {/* ── Right column: summary ─────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:sticky lg:top-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {readOnly
                    ? "Enterprise Summary"
                    : "Estimated Enterprise Package"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on the information provided, here&apos;s a preview of
                  your enterprise plan.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 border-t border-gray-100 pt-4">
              {summaryRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    {row.icon}
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-gray-900 text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                What&apos;s included (based on your selections)
              </p>
              <ul className="space-y-2">
                {INCLUDED_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Final pricing and terms will be provided in your customised
                proposal.
              </p>
            </div>

            {readOnly && (
              <div className="mt-4">
                <Button
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-between px-5"
                  onClick={handleSubmit}
                  disabled={isPending}
                >
                  <span className="flex items-center gap-2">
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="flex flex-col items-start leading-tight">
                      <span className="font-semibold text-sm">
                        {isPending ? "Submitting…" : "Submit"}
                      </span>
                      <span className="text-[11px] font-normal text-blue-100">
                        Submit your request for pricing
                      </span>
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <p className="text-[11px] text-center text-gray-400 mt-3">
                  Your information is secure and will only be used to process
                  your enterprise request.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Slider row ─────────────────────────────────────────── */

function SliderRow({
  cfg,
  value,
  readOnly,
  onChange
}: {
  cfg: SliderConfig;
  value: number;
  readOnly: boolean;
  onChange: (value: number) => void;
}) {
  const unlimited = value >= cfg.max;
  const pct = Math.min(
    100,
    Math.max(0, ((value - cfg.min) / (cfg.max - cfg.min)) * 100)
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4">
      {/* Label */}
      <div className="flex items-start gap-3 sm:w-60 shrink-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}
        >
          {cfg.icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{cfg.title}</p>
          <p className="text-xs text-gray-400 leading-snug">{cfg.desc}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="flex-1 min-w-0">
        <div className="relative pt-6">
          {!readOnly && (
            <div
              className="absolute top-0"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 whitespace-nowrap">
                {unlimited ? "Unlimited" : formatNumberID(value)}
              </span>
            </div>
          )}
          <input
            type="range"
            min={cfg.min}
            max={cfg.max}
            step={cfg.step}
            value={value}
            disabled={readOnly}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer disabled:cursor-default"
          />
        </div>
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>{formatNumberID(cfg.min)}</span>
          <span>Unlimited</span>
        </div>
      </div>

      {/* Number box */}
      <div className="sm:w-32 shrink-0">
        <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
          <input
            type="text"
            inputMode="numeric"
            disabled={readOnly}
            value={unlimited ? "Unlimited" : formatNumberID(value)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              onChange(digits ? Number(digits) : cfg.min);
            }}
            className="w-full min-w-0 px-2.5 py-2 text-sm text-gray-800 outline-none disabled:bg-gray-50 disabled:text-gray-700"
          />
          <span className="px-2 py-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200">
            {cfg.unit}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Step indicator parts ───────────────────────────────── */

function StepLine({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`h-0.5 flex-1 max-w-[120px] rounded ${
        active ? "bg-blue-600" : "bg-gray-200"
      }`}
    />
  );
}

function StepBadge({
  index,
  label,
  state
}: {
  index?: number;
  label: string;
  state: "done" | "active" | "todo";
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          state === "todo"
            ? "bg-gray-200 text-gray-500"
            : "bg-blue-600 text-white"
        }`}
      >
        {state === "done" ? <Check className="w-4 h-4" /> : index}
      </div>
      <span
        className={`text-xs font-medium ${
          state === "active" ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
