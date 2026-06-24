"use client";

import Link from "next/link";
import { useReveal } from "./hooks";
import type { Locale } from "./i18n";
import { usePlans } from "@/hooks/api/usePayments";
import type { Plan } from "@/types/payments";

const CONTENT: Record<
  Locale,
  {
    label: string;
    title: string;
    subtitle: string;
    betaPhase: string;
    betaNote: string;
    freeBadge: string;
    freeName: string;
    freeDesc: string;
    freeOpen: string;
    freeFeatures: string[];
    betaInfoTitle: string;
    betaInfoSubtitle: string;
    freeCta: string;
    freeFooter: string;
    recommended: string;
    // Basic tier
    basicName: string;
    basicDesc: string;
    basicDefaultPrice: string;
    basicFeatures: string[];
    basicCta: string;
    basicFooter: string;
    // Pro tier
    proName: string;
    proDefaultPrice: string;
    proDesc: string;
    proFeatures: string[];
    proCta: string;
    cancelAnytime: string;
    proFooter: string;
    // Custom tier
    customName: string;
    customPrice: string;
    customDesc: string;
    customFeatures: string[];
    customCta: string;
    customReply: string;
    customFooter: string;
    // Promo / anchoring
    promoBadge: string;
    comingSoon: string;
    perMonth: string;
    forever: string;
    // Shared
    bottomNotice: string;
    questions: string;
  }
> = {
  en: {
    label: "Pricing",
    title: "Simple, transparent pricing.",
    subtitle: "No hidden fees. Start free, upgrade when your team grows.",
    betaPhase: "Beta Testing Phase",
    betaNote:
      "All features are open for real users. Try everything for free during beta!",
    freeBadge: "Beta Testing",
    freeName: "Free",
    freeDesc: "For real users during beta phase.",
    freeOpen: "All features are open. No limits.",
    freeFeatures: [
      "Unlimited members",
      "Unlimited spaces",
      "All features included",
      "Priority support",
      "Regular updates"
    ],
    betaInfoTitle: "This is a beta testing phase.",
    betaInfoSubtitle: "Help us build the best product for you.",
    freeCta: "Get Started for Free",
    freeFooter: "Free during beta period",
    recommended: "Recommended for growing teams",
    basicName: "Basic",
    basicDesc: "For small teams getting started.",
    basicDefaultPrice: "Coming Soon",
    basicFeatures: [
      "Up to 10 members",
      "Up to 5 workspaces",
      "5 GB storage",
      "Email support"
    ],
    basicCta: "Start Basic Trial",
    basicFooter: "Affordable plan for growing teams",
    proName: "Pro",
    proDefaultPrice: "Coming Soon",
    proDesc: "Everything in Free, plus more.",
    proFeatures: [
      "Advanced team management",
      "Advanced permissions & roles",
      "Activity logs & audit trail",
      "Custom integrations",
      "Advanced security",
      "Priority support"
    ],
    proCta: "Start Pro Trial",
    cancelAnytime: "Cancel anytime",
    proFooter: "Full access coming soon",
    customName: "Custom",
    customPrice: "Custom",
    customDesc: "For organizations with advanced needs.",
    customFeatures: [
      "Everything in Pro",
      "Custom security & compliance",
      "SSO & SAML",
      "Dedicated account manager",
      "Custom integrations",
      "SLA & enterprise support"
    ],
    customCta: "Contact Sales",
    customReply: "We'll get back to you soon",
    customFooter: "Enterprise features coming soon",
    promoBadge: "Limited Offer",
    comingSoon: "Coming soon",
    perMonth: "/month",
    forever: "forever",
    bottomNotice:
      "Pricing will be updated after the beta testing phase ends. Thank you for being part of our journey!",
    questions: "Questions? Contact us at"
  },
  id: {
    label: "Harga",
    title: "Harga sederhana dan transparan.",
    subtitle:
      "Tanpa biaya tersembunyi. Mulai gratis, upgrade saat tim Anda berkembang.",
    betaPhase: "Fase Beta Testing",
    betaNote:
      "Semua fitur terbuka untuk pengguna nyata. Coba semuanya gratis selama beta!",
    freeBadge: "Beta Testing",
    freeName: "Gratis",
    freeDesc: "Untuk pengguna nyata selama fase beta.",
    freeOpen: "Semua fitur terbuka. Tanpa batas.",
    freeFeatures: [
      "Member tanpa batas",
      "Space tanpa batas",
      "Semua fitur termasuk",
      "Dukungan prioritas",
      "Update berkala"
    ],
    betaInfoTitle: "Ini adalah fase beta testing.",
    betaInfoSubtitle: "Bantu kami membangun produk terbaik untuk Anda.",
    freeCta: "Mulai Gratis",
    freeFooter: "Gratis selama periode beta",
    recommended: "Direkomendasikan untuk tim yang berkembang",
    basicName: "Basic",
    basicDesc: "Untuk tim kecil yang baru memulai.",
    basicDefaultPrice: "Segera Hadir",
    basicFeatures: [
      "Hingga 10 anggota",
      "Hingga 5 workspace",
      "5 GB penyimpanan",
      "Dukungan email"
    ],
    basicCta: "Mulai Uji Coba Basic",
    basicFooter: "Paket terjangkau untuk tim yang berkembang",
    proName: "Pro",
    proDefaultPrice: "Segera Hadir",
    proDesc: "Semua di Gratis, plus lebih banyak.",
    proFeatures: [
      "Manajemen tim lanjutan",
      "Permission & role lanjutan",
      "Log aktivitas & jejak audit",
      "Integrasi kustom",
      "Keamanan lanjutan",
      "Dukungan prioritas"
    ],
    proCta: "Mulai Uji Coba Pro",
    cancelAnytime: "Batalkan kapan saja",
    proFooter: "Akses penuh segera hadir",
    customName: "Kustom",
    customPrice: "Kustom",
    customDesc: "Untuk organisasi dengan kebutuhan lanjutan.",
    customFeatures: [
      "Semua di Pro",
      "Keamanan & kepatuhan kustom",
      "SSO & SAML",
      "Account manager khusus",
      "Integrasi kustom",
      "SLA & dukungan enterprise"
    ],
    customCta: "Hubungi Sales",
    customReply: "Kami akan segera menghubungi Anda",
    customFooter: "Fitur enterprise segera hadir",
    promoBadge: "Penawaran Terbatas",
    comingSoon: "Segera hadir",
    perMonth: "/bulan",
    forever: "selamanya",
    bottomNotice:
      "Harga akan diperbarui setelah fase beta testing berakhir. Terima kasih telah menjadi bagian dari perjalanan kami!",
    questions: "Ada pertanyaan? Hubungi kami di"
  }
};

/* ── Helpers ───────────────────────────────────────────── */

function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(n);
}

function isCampaignActive(endDate: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate).getTime() > Date.now();
}

function findPlan(plans: Plan[] | undefined, tier: string): Plan | undefined {
  return plans?.find((p) => p.tier === tier && p.isActive);
}

/* ── Icon helpers ──────────────────────────────────────── */

function GreenCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
    >
      <circle cx="9" cy="9" r="9" fill="#22c55e" />
      <path
        d="M5 9l3 3 5-5"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DimCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 opacity-40"
    >
      <path
        d="M3 8l3 3 7-7"
        stroke="#9ca3af"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DimCheckDark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 opacity-50"
    >
      <path
        d="M3 8l3 3 7-7"
        stroke="#6b7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="shrink-0"
    >
      <path
        d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Price display helper ──────────────────────────────── */

function PriceDisplay({
  plan,
  fallback,
  locale,
  dark = false
}: {
  plan?: Plan;
  fallback: string;
  locale: Locale;
  dark?: boolean;
}) {
  const c = CONTENT[locale];
  if (!plan) {
    return (
      <span
        className={`text-3xl font-bold leading-none ${dark ? "text-white" : "text-gray-900"}`}
      >
        {fallback}
      </span>
    );
  }

  const hasAnchoring =
    plan.originalPrice != null && plan.originalPrice > plan.basePrice;
  const hasPromo =
    plan.campaignName != null && isCampaignActive(plan.campaignEndDate);
  const durationLabel =
    plan.durationDays === 0 ? c.forever : `${plan.durationDays}d`;

  return (
    <div className="flex flex-col gap-0.5">
      {hasAnchoring && (
        <span
          className={`text-xs line-through ${dark ? "text-gray-500" : "text-gray-400"}`}
        >
          {formatIDR(plan.originalPrice!)}
        </span>
      )}
      <div className="flex items-end gap-1.5">
        <span
          className={`text-3xl font-bold leading-none ${dark ? "text-white" : "text-gray-900"}`}
        >
          {plan.basePrice === 0 ? "Free" : formatIDR(plan.basePrice)}
        </span>
        {plan.basePrice > 0 && (
          <span
            className={`text-sm mb-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}
          >
            /{durationLabel}
          </span>
        )}
      </div>
      {hasPromo && (
        <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 w-fit mt-1">
          {plan.campaignName}
        </span>
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */

interface PricingProps {
  standalone?: boolean;
  locale?: Locale;
}

export function Pricing({ standalone = false, locale = "en" }: PricingProps) {
  const r = useReveal();
  const c = CONTENT[locale];

  const { data: plans } = usePlans();
  const freePlan = findPlan(plans, "FREE");
  const basicPlan = findPlan(plans, "BASIC");
  const proPlan = findPlan(plans, "PRO");
  const customPlan = findPlan(plans, "CUSTOM");

  return (
    <section
      id="pricing"
      className={`bg-[#f5f6fa] flex items-center px-6 ${standalone ? "py-12 pt-28 min-h-screen" : "py-24 min-h-screen"}`}
    >
      <div ref={r.ref} className="max-w-6xl mx-auto w-full">
        {/* ── Header ─────────────────────────────────────────── */}
        <div
          className={`text-center ${standalone ? "mb-8" : "mb-12"} reveal-up ${r.visible ? "revealed" : ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {c.label}
          </p>
          <h2
            className={`font-serif font-bold text-gray-900 ${standalone ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}
          >
            {c.title}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mt-3 text-[15px]">
            {c.subtitle}
          </p>
          <div className="inline-flex items-center gap-3 mt-6 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm shadow-sm">
            <span className="text-base">🚀</span>
            <span className="font-semibold text-blue-600">{c.betaPhase}</span>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-gray-500 hidden sm:inline">{c.betaNote}</span>
          </div>
        </div>

        {/* ── Cards grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-center">
          {/* ── Card 1: Free ─────────────────────────────────── */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm p-6 reveal-up stagger-1 ${r.visible ? "revealed" : ""}`}
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4 w-fit">
              {c.freeBadge}
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">
              {c.freeName}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{c.freeDesc}</p>
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <circle cx="8" cy="8" r="7.5" stroke="#3b82f6" />
                <path
                  d="M8 5v4M8 11v.5"
                  stroke="#3b82f6"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-sm font-semibold text-blue-600">
                {c.freeOpen}
              </span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-5">
              {c.freeFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <GreenCheck />
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 mt-0.5"
              >
                <circle cx="8" cy="8" r="7.5" stroke="#3b82f6" />
                <path
                  d="M8 7v5M8 5v.5"
                  stroke="#3b82f6"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">
                  {c.betaInfoTitle}
                </p>
                <p className="text-xs text-blue-500">{c.betaInfoSubtitle}</p>
              </div>
            </div>
            <Link
              href="/login"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              {c.freeCta}
            </Link>
            <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-4">
              {c.freeFooter} <ArrowUpRight />
            </p>
          </div>

          {/* ── Card 2: Basic ────────────────────────────────── */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm p-6 reveal-up stagger-2 ${r.visible ? "revealed" : ""}`}
          >
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-3 py-1 mb-4 w-fit">
              {c.basicName}
            </span>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {c.basicName}
            </h3>
            <PriceDisplay
              plan={basicPlan}
              fallback={c.basicDefaultPrice}
              locale={locale}
            />
            <p className="text-sm text-gray-500 mb-5 mt-1">{c.basicDesc}</p>
            <ul className="space-y-2.5 flex-1 mb-5">
              {c.basicFeatures.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2.5 text-sm text-gray-700"
                >
                  <GreenCheck />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/payment?plan=basic"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-teal-500 text-white hover:bg-teal-600 transition-colors"
            >
              {c.basicCta}
            </Link>
            <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-4">
              {c.basicFooter} <ArrowUpRight />
            </p>
          </div>

          {/* ── Card 3: Pro (dark, recommended, elevated) ────── */}
          <div
            className={`rounded-2xl flex flex-col bg-[#111827] shadow-2xl overflow-hidden -my-5 z-10 reveal-up stagger-3 ${r.visible ? "revealed" : ""}`}
          >
            <div className="flex items-center justify-center gap-1.5 pt-4 pb-3 px-6">
              <span className="text-sm">⭐</span>
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#e5e7eb"
                }}
              >
                {c.recommended}
              </span>
            </div>
            <div className="flex flex-col flex-1 px-6 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                {c.proName}
              </span>
              <PriceDisplay
                plan={proPlan}
                fallback={c.proDefaultPrice}
                locale={locale}
                dark
              />
              <p className="text-sm text-gray-400 mb-5 mt-1">{c.proDesc}</p>
              <ul className="space-y-3 flex-1 mb-6">
                {c.proFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <DimCheckDark />
                      {f}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 border border-amber-400/50 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      {c.comingSoon}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/payment?plan=pro"
                className="w-full text-center py-3.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {c.proCta}
              </Link>
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect
                    x="1.5"
                    y="5"
                    width="9"
                    height="6.5"
                    rx="1.5"
                    stroke="#6b7280"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M4 5V3.5a2 2 0 014 0V5"
                    stroke="#6b7280"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {c.cancelAnytime}
              </p>
              <p className="flex items-center justify-center gap-1 text-[11px] text-gray-600 mt-4">
                {c.proFooter} <ArrowUpRight />
              </p>
            </div>
          </div>

          {/* ── Card 4: Custom ────────────────────────────────── */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm p-6 reveal-up stagger-4 ${r.visible ? "revealed" : ""}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              {c.customName}
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">
              {c.customPrice}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{c.customDesc}</p>
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0 mt-0.5 opacity-50"
              >
                <path
                  d="M4 4h12v2l-4 5v5l-4-2v-3L4 6V4z"
                  stroke="#9ca3af"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">
                  Tailored for you
                </p>
                <p className="text-xs text-gray-400">
                  Contact our sales team for a custom quote.
                </p>
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {c.customFeatures.map((f) => (
                <li key={f} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <DimCheck />
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/enterprise"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              {c.customCta}
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">
              {c.customReply}
            </p>
            <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-4">
              {c.customFooter} <ArrowUpRight />
            </p>
          </div>
        </div>

        {/* ── Bottom notice ───────────────────────────────────── */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-3 reveal-up stagger-4 ${r.visible ? "revealed" : ""}`}
        >
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="shrink-0"
            >
              <circle cx="7" cy="7" r="6.5" stroke="#9ca3af" />
              <path
                d="M7 6v4M7 4.5v.5"
                stroke="#9ca3af"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {c.bottomNotice}
          </p>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            {c.questions}{" "}
            <a
              href="mailto:support@papanclip.com"
              className="text-blue-500 hover:underline"
            >
              support@papanclip.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Keep named export for backward compat ──────────────── */
export const PLANS = [] as never[];
export function Check() {
  return null;
}
