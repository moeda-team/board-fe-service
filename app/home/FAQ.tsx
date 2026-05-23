"use client";

import { useState } from "react";
import { useReveal } from "./hooks";

const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "What is Papanclip?",
        a: "Papanclip is an all-in-one project management platform built for engineering teams. It combines task management, developer KPI tracking, role-based access control, and team collaboration into a single, fast workspace.",
      },
      {
        q: "Is Papanclip free to use?",
        a: "Yes — during the beta testing phase, all features are completely free with no limits. You get unlimited members, unlimited spaces, and access to every feature. Paid plans will be introduced after the beta period ends.",
      },
      {
        q: "Who is Papanclip built for?",
        a: "Papanclip is built for engineering teams, startups, agencies, and any team that needs a structured, scalable way to manage work. Whether you're a solo founder or a 100-person engineering org, Papanclip adapts to your workflow.",
      },
    ],
  },
  {
    category: "Features",
    items: [
      {
        q: "What features are available right now?",
        a: "All core features are live: task boards, spaces, member management, role-based access control (RBAC), activity logs, document collaboration, and developer KPI dashboards. Advanced features like SSO, audit trails, and custom integrations are currently in development.",
      },
      {
        q: "What are Spaces?",
        a: "Spaces are isolated workspaces within your organization — think of them as projects or teams. Each Space has its own board, members, permissions, and settings. You can create unlimited Spaces during the beta phase.",
      },
      {
        q: "How does RBAC (role-based access control) work?",
        a: "You can assign custom roles to members with granular permissions — controlling who can view, create, edit, or delete content across your entire workspace or within specific Spaces. This keeps client-facing and internal work cleanly separated.",
      },
      {
        q: "What is the developer KPI dashboard?",
        a: "The developer KPI dashboard tracks delivery metrics per developer — including task completion rate, workload distribution, velocity, and blockers — giving team leads visibility without micromanaging individuals.",
      },
    ],
  },
  {
    category: "Pricing & Beta",
    items: [
      {
        q: "When will the beta testing phase end?",
        a: "We haven't announced a specific end date yet. We'll give users advance notice before any pricing changes take effect. You can follow our updates or contact us at support@papanclip.com to stay informed.",
      },
      {
        q: "Will my data be safe when paid plans launch?",
        a: "Absolutely. Your data stays intact regardless of plan changes. If you're on a free plan when pricing launches, you'll keep access to your existing data and have time to upgrade or export.",
      },
      {
        q: "What will Pro and Enterprise plans include?",
        a: "Pro will include advanced team management, advanced permissions & roles, activity logs & audit trail, custom integrations, advanced security, and priority support. Enterprise adds SSO & SAML, dedicated account management, custom security & compliance, and SLA support. Both tiers are currently under development.",
      },
    ],
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "How do I invite team members?",
        a: "From your workspace settings, go to Members and click Invite. You can invite by email and assign a role immediately. Invited members receive an email to join your workspace.",
      },
      {
        q: "Can I use Papanclip with my existing tools?",
        a: "Custom integrations are coming soon as part of the Pro plan. In the meantime, Papanclip's core features cover the full project lifecycle — from planning to delivery — so many teams find they need fewer external tools.",
      },
      {
        q: "How do I contact support?",
        a: "Reach us any time at support@papanclip.com. During the beta phase, we aim to respond within 24 hours. Priority support is also available for Pro plan users once it launches.",
      },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FAQProps {
  standalone?: boolean;
}

export function FAQ({ standalone = false }: FAQProps) {
  const reveal = useReveal();
  const [open, setOpen] = useState<string | null>("0-0");

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <section
      id="faq"
      className={`bg-white px-6 ${standalone ? "py-12 pt-28 min-h-screen" : "py-24"}`}
    >
      <div ref={reveal.ref} className="max-w-3xl mx-auto w-full">

        {/* Header */}
        <div className={`text-center mb-14 reveal-up ${reveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Frequently asked questions.
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:support@papanclip.com" className="text-blue-500 hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Accordion by category */}
        <div className={`space-y-10 reveal-up stagger-2 ${reveal.visible ? "revealed" : ""}`}>
          {FAQS.map((group, gi) => (
            <div key={group.category}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
                {group.category}
              </p>
              <div className="space-y-2">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  const isOpen = open === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border transition-colors duration-200 ${
                        isOpen ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className={`text-sm font-semibold ${isOpen ? "text-gray-900" : "text-gray-700"}`}>
                          {item.q}
                        </span>
                        <ChevronIcon open={isOpen} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className={`mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900 rounded-2xl px-8 py-6 reveal-up stagger-3 ${reveal.visible ? "revealed" : ""}`}>
          <div>
            <p className="font-semibold text-white">Still have questions?</p>
            <p className="text-sm text-gray-400 mt-0.5">We&apos;re happy to help you get started.</p>
          </div>
          <a
            href="mailto:support@papanclip.com"
            className="shrink-0 text-sm font-semibold bg-white text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Contact support
          </a>
        </div>

      </div>
    </section>
  );
}
