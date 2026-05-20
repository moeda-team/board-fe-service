"use client";

import { useState } from "react";
import { useReveal } from "./hooks";

const TESTIMONIALS = {
  en: [
    {
      quote:
        "ChronoTask finally made our sprint planning feel effortless. We cut meeting time in half and everyone actually knows what they're working on now.",
      name: "Daniel R.",
      role: "Engineering Lead",
      category: "Engineering Team",
    },
    {
      quote:
        "The developer KPI dashboard changed how we evaluate performance. We can now track delivery speed, workload, and blockers without micromanaging.",
      name: "Michael T.",
      role: "CTO",
      category: "Developer KPI Tracking",
    },
    {
      quote:
        "I've tried dozens of productivity tools, but this is the first one my whole team adopted without complaints.",
      name: "Sarah M.",
      role: "Operations Manager",
      category: "Operations Team",
    },
    {
      quote: "We replaced three separate apps with ChronoTask. Cleaner workflow, fewer mistakes, faster delivery.",
      name: "Kevin T.",
      role: "Founder",
      category: "Startup Founder",
    },
    {
      quote: "The client collaboration features are ridiculously good. No more lost feedback or confusing revisions.",
      name: "Amelia C.",
      role: "Creative Director",
      category: "Agency Team",
    },
    {
      quote: "It feels like Notion and Jira had a smarter, faster child. The UI is insanely smooth.",
      name: "Lyc F.",
      role: "Product Manager",
      category: "Product Team",
    },
  ],
  id: [
    {
      quote:
        "Sejak pakai ChronoTask, koordinasi antar tim jadi jauh lebih rapi. Progress project sekarang bisa dipantau tanpa harus chat terus.",
      name: "Rizky A.",
      role: "Tech Lead",
      category: "Tim Engineering",
    },
    {
      quote:
        "Fitur KPI developer-nya membantu banget buat lihat performa tim secara real-time. Jadi lebih gampang evaluasi productivity tanpa bikin developer merasa diawasi berlebihan.",
      name: "Andra P.",
      role: "Engineering Manager",
      category: "KPI Developer",
    },
    {
      quote:
        "Awalnya tim saya susah adaptasi tools baru, tapi ChronoTask justru langsung dipakai semua orang dari hari pertama.",
      name: "Nadia P.",
      role: "Operations Supervisor",
      category: "Operasional",
    },
    {
      quote:
        "Fitur role access-nya ngebantu banget buat misahin data internal dan client. Aman dan tetap simpel dipakai.",
      name: "Fajar H.",
      role: "Founder Startup",
      category: "Startup",
    },
    {
      quote:
        "Task management-nya enak banget buat agency. Semua revisi client jadi lebih jelas dan gak ada yang kelewat.",
      name: "Dinda K.",
      role: "Project Coordinator",
      category: "Creative Agency",
    },
    {
      quote:
        "UI-nya clean, cepat, dan bikin kerjaan terasa lebih ringan. Client saya juga suka karena semuanya keliatan profesional.",
      name: "Bagus N.",
      role: "Consultant",
      category: "Freelancer / Consultant",
    },
  ],
};

export function FAQ() {
  const reveal = useReveal();
  const [lang, setLang] = useState<"en" | "id">("en");

  const testimonials = TESTIMONIALS[lang];

  return (
    <section id="testimonials" className="py-24 px-8 bg-gray-50">
      <div ref={reveal.ref} className="max-w-6xl mx-auto w-full">
        <div className={`text-center mb-14 reveal-up ${reveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Loved by <span style={{ color: "#53A3FF" }}>teams.</span>
          </h2>
          <div className="mt-6 inline-flex items-center bg-white border border-gray-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setLang("en")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                lang === "en" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("id")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                lang === "id" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Indonesia
            </button>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-up stagger-2 ${reveal.visible ? "revealed" : ""}`}
        >
          {testimonials.map((t, i) => (
            <div
              key={`${lang}-${i}`}
              className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{t.category}</p>
              <svg className="w-6 h-6 shrink-0" style={{ color: "#53A3FF" }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-700 leading-relaxed flex-1">{t.quote}</p>
              <div className="pt-2 border-t border-gray-100">
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
