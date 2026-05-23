"use client";

import Link from "next/link";
import { useReveal } from "./hooks";

/* ── Free plan features ─────────────────────────────────── */
const FREE_FEATURES = [
  "Unlimited members",
  "Unlimited spaces",
  "All features included",
  "Priority support",
  "Regular updates",
];

/* ── Pro plan features (coming soon) ───────────────────── */
const PRO_FEATURES = [
  "Advanced team management",
  "Advanced permissions & roles",
  "Activity logs & audit trail",
  "Custom integrations",
  "Advanced security",
  "Priority support",
];

/* ── Enterprise plan features (coming soon) ────────────── */
const ENT_FEATURES = [
  "Everything in Pro",
  "Custom security & compliance",
  "SSO & SAML",
  "Dedicated account manager",
  "Custom integrations",
  "SLA & enterprise support",
];

/* ── Icon helpers ───────────────────────────────────────── */
function GreenCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
      <circle cx="9" cy="9" r="9" fill="#22c55e" />
      <path d="M5 9l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DimCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-40">
      <path d="M3 8l3 3 7-7" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DimCheckDark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-50">
      <path d="M3 8l3 3 7-7" stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
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

interface PricingProps {
  standalone?: boolean;
}

export function Pricing({ standalone = false }: PricingProps) {
  const r = useReveal();

  return (
    <section
      id="pricing"
      className={`bg-[#f5f6fa] flex items-center px-6 ${standalone ? "py-12 pt-28 min-h-screen" : "py-24 min-h-screen"}`}
    >
      <div ref={r.ref} className="max-w-5xl mx-auto w-full">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className={`text-center ${standalone ? "mb-8" : "mb-12"} reveal-up ${r.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pricing</p>
          <h2
            className={`font-serif font-bold text-gray-900 ${standalone ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}
          >
            Simple, transparent pricing.
          </h2>
          <p className="text-gray-500 max-w-md mx-auto mt-3 text-[15px]">
            No hidden fees. Start free, upgrade when your team grows.
          </p>

          {/* Beta banner */}
          <div className="inline-flex items-center gap-3 mt-6 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm shadow-sm">
            <span className="text-base">🚀</span>
            <span className="font-semibold text-blue-600">Beta Testing Phase</span>
            <span className="text-gray-400 hidden sm:inline">|</span>
            <span className="text-gray-500 hidden sm:inline">
              All features are open for real users. Try everything for free during beta!
            </span>
          </div>
        </div>

        {/* ── Cards grid ─────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5 items-center">
          {/* ── Card 1: Free ─────────────────────────────────── */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm p-6 reveal-up stagger-1 ${r.visible ? "revealed" : ""}`}
          >
            {/* Label */}
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4 w-fit">
              Beta Testing
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">Free</h3>
            <p className="text-sm text-gray-500 mb-5">For real users during beta phase.</p>

            {/* All-open banner */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <circle cx="8" cy="8" r="7.5" stroke="#3b82f6" />
                <path d="M8 5v4M8 11v.5" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-semibold text-blue-600">All features are open. No limits.</span>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 flex-1 mb-5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <GreenCheck />
                  {f}
                </li>
              ))}
            </ul>

            {/* Info box */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7.5" stroke="#3b82f6" />
                <path d="M8 7v5M8 5v.5" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">This is a beta testing phase.</p>
                <p className="text-xs text-blue-500">Help us build the best product for you.</p>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/login"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Get Started for Free
            </Link>

            {/* Footer note */}
            <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-4">
              Free during beta period <ArrowUpRight />
            </p>
          </div>

          {/* ── Card 2: Pro (dark, recommended, elevated) ────── */}
          <div
            className={`rounded-2xl flex flex-col bg-[#111827] shadow-2xl overflow-hidden -my-5 z-10 reveal-up stagger-2 ${r.visible ? "revealed" : ""}`}
          >
            {/* Recommended banner — inside the dark card at the very top */}
            <div className="flex items-center justify-center gap-1.5 pt-4 pb-3 px-6">
              <span className="text-sm">⭐</span>
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.12)", color: "#e5e7eb" }}
              >
                Recommended for growing teams
              </span>
            </div>

            <div className="flex flex-col flex-1 px-6 pb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pro</span>
              <div className="flex items-end gap-1.5 mb-1">
                <span className="text-3xl font-bold text-white leading-none">Coming Soon</span>
                {/* <span className="text-sm text-gray-400 mb-0.5">/month</span> */}
              </div>
              <p className="text-sm text-gray-400 mb-5">Everything in Free, plus more.</p>

              {/* Testing box */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-5">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 opacity-60">
                  <path
                    d="M7 3h6M8 3v4l-3 5a2 2 0 002 3h6a2 2 0 002-3l-3-5V3"
                    stroke="#9ca3af"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-gray-300 mb-0.5">Features are being tested</p>
                  <p className="text-xs text-gray-500">We&apos;re preparing the best experience for you.</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 flex-1 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm text-gray-500">
                      <DimCheckDark />
                      {f}
                    </span>
                    <span className="text-[10px] font-semibold text-amber-400 border border-amber-400/50 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                      Coming soon
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/login"
                className="w-full text-center py-3.5 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Start Pro Trial
              </Link>
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-3">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="1.5" y="5" width="9" height="6.5" rx="1.5" stroke="#6b7280" strokeWidth="1.2" />
                  <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Cancel anytime
              </p>

              {/* Footer note */}
              <p className="flex items-center justify-center gap-1 text-[11px] text-gray-600 mt-4">
                Full access coming soon <ArrowUpRight />
              </p>
            </div>
          </div>

          {/* ── Card 3: Enterprise ────────────────────────────── */}
          <div
            className={`bg-white rounded-2xl border border-gray-200 flex flex-col shadow-sm p-6 reveal-up stagger-3 ${r.visible ? "revealed" : ""}`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Enterprise</span>
            <h3 className="text-4xl font-bold text-gray-900 mb-1">Custom</h3>
            <p className="text-sm text-gray-500 mb-5">For organizations with advanced needs.</p>

            {/* Testing box */}
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 opacity-50">
                <path
                  d="M4 4h12v2l-4 5v5l-4-2v-3L4 6V4z"
                  stroke="#9ca3af"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Features are being tested</p>
                <p className="text-xs text-gray-400">We&apos;re preparing the best experience for you.</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 flex-1 mb-6">
              {ENT_FEATURES.map((f) => (
                <li key={f} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <DimCheck />
                    {f}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-500 border border-amber-400/50 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                    Coming soon
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/login"
              className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-700 transition-colors"
            >
              Contact Sales
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">We&apos;ll get back to you soon</p>

            {/* Footer note */}
            <p className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-4">
              Enterprise features coming soon <ArrowUpRight />
            </p>
          </div>
        </div>

        {/* ── Bottom notice ───────────────────────────────────── */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-3 reveal-up stagger-4 ${r.visible ? "revealed" : ""}`}
        >
          <p className="flex items-center gap-2 text-xs text-gray-400">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <circle cx="7" cy="7" r="6.5" stroke="#9ca3af" />
              <path d="M7 6v4M7 4.5v.5" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Pricing will be updated after the beta testing phase ends. Thank you for being part of our journey!
          </p>
          <p className="text-xs text-gray-400 whitespace-nowrap">
            Questions? Contact us at{" "}
            <a href="mailto:support@papanclip.com" className="text-blue-500 hover:underline">
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
