"use client";

import Link from "next/link";
import { useReveal } from "./hooks";
import type { Plan } from "./types";

export const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    desc: "For small teams exploring the platform.",
    features: ["Up to 5 members", "3 Spaces", "Basic task management", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    per: "/seat/mo",
    desc: "Full control for growing teams.",
    features: [
      "Unlimited members",
      "Unlimited Spaces",
      "RBAC & permissions",
      "Developer KPI tracking",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Multi-tenant, white-label, enterprise security.",
    features: ["Everything in Pro", "Multi-tenant workspaces", "SSO & SAML", "Audit logs", "Dedicated support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

export function Check({ bright }: { bright?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path
        d="M2.5 7l3 3 6-6"
        stroke={bright ? "#86efac" : "#22c55e"}
        strokeWidth="2"
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
  const pricingReveal = useReveal();

  return (
    <section
      id="pricing"
      className={`bg-white flex items-center px-8 ${standalone ? "py-12 pt-28 min-h-screen" : "py-24 min-h-screen"}`}
    >
      <div ref={pricingReveal.ref} className="max-w-5xl mx-auto w-full">
        <div
          className={`text-center ${standalone ? "mb-8" : "mb-14"} reveal-up ${pricingReveal.visible ? "revealed" : ""}`}
        >
          <p
            className={`text-xs font-semibold uppercase tracking-widest text-gray-400 ${standalone ? "mb-2" : "mb-3"}`}
          >
            Pricing
          </p>
          <h2
            className={`font-serif font-bold text-gray-900 ${standalone ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"}`}
          >
            Simple, transparent pricing.
          </h2>
          <p className={`text-gray-500 max-w-md mx-auto ${standalone ? "mt-2 text-sm" : "mt-4"}`}>
            No hidden fees. Start free, upgrade when your team grows.
          </p>
        </div>
        <div className={`grid md:grid-cols-3 ${standalone ? "gap-4" : "gap-6"}`}>
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`hc rounded-2xl border flex flex-col reveal-up stagger-${i + 1} ${pricingReveal.visible ? "revealed" : ""} ${plan.highlight ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"} ${standalone ? "p-5" : "p-7"}`}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                {plan.per && (
                  <span className={`text-sm mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.per}
                  </span>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
              <ul className={`space-y-2 flex-1 mb-4`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check bright={plan.highlight} />
                    <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${plan.highlight ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-700"}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
