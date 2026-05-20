"use client";

import { useState } from "react";
import { useReveal } from "./hooks";

const FAQS = [
  {
    q: "What is ChronoTask?",
    a: "ChronoTask is a modern project management platform designed for teams who want powerful workflows without the clutter. It combines task management, time tracking, and team collaboration in one clean interface.",
  },
  {
    q: "How does the pricing work?",
    a: "We offer a free tier for small teams getting started. Paid plans start at $12/user/month and scale based on features like advanced analytics, RBAC, and priority support. Annual billing saves you 20%.",
  },
  {
    q: "Can I migrate from other tools?",
    a: "Yes. We provide one-click importers for Trello, Asana, Monday, and Jira. Your boards, tasks, and history transfer automatically. Custom field mapping available on Pro plans.",
  },
  {
    q: "Is there a mobile app?",
    a: "ChronoTask is fully responsive and works great on mobile browsers. Native iOS and Android apps are on our roadmap — no firm timeline yet, but we are actively exploring.",
  },
  {
    q: "What about security?",
    a: "SOC 2 Type II certified. All data encrypted at rest and in transit. Enterprise plans include SSO, audit logs, and custom data retention policies.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. 30-day money-back guarantee on all paid plans. No questions asked. Contact support and we'll process within 2 business days.",
  },
];

export function FAQ() {
  const reveal = useReveal();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 px-8 bg-gray-50">
      <div ref={reveal.ref} className="max-w-3xl mx-auto w-full">
        <div className={`text-center mb-14 reveal-up ${reveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Questions? <span style={{ color: "#53A3FF" }}>Answers.</span>
          </h2>
        </div>

        <div className={`space-y-4 reveal-up stagger-2 ${reveal.visible ? "revealed" : ""}`}>
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"}`}>
                <p className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-12 text-center reveal-up stagger-4 ${reveal.visible ? "revealed" : ""}`}>
          <p className="text-gray-500 mb-4">Still have questions?</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Contact support
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
