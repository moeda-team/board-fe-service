"use client";

import { useReveal } from "./hooks";
import type { Locale } from "./i18n";

const CONTENT: Record<Locale, { label: string; title: string; paragraph: string }> = {
  en: {
    label: "Solutions",
    title: "More than task management.",
    paragraph:
      "Papanclip combines the structure of Notion, the workflow of Jira, and enterprise-grade access control — without the complexity."
  },
  id: {
    label: "Solusi",
    title: "Lebih dari sekadar manajemen tugas.",
    paragraph:
      "Papanclip memadukan struktur ala Notion, workflow ala Jira, dan kontrol akses kelas enterprise — tanpa kerumitan."
  }
};

export function Solutions({ locale = "en" }: { locale?: Locale }) {
  const solutionsReveal = useReveal(0);
  const c = CONTENT[locale];

  return (
    <section
      id="solutions"
      className="min-h-screen bg-gray-50 flex items-center px-8 py-24"
    >
      <div ref={solutionsReveal.ref} className="max-w-7xl mx-auto w-full">
        <div
          className={`text-center mb-16 reveal-up ${solutionsReveal.visible ? "revealed" : ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {c.label}
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
            {c.title}
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            {c.paragraph}
          </p>
        </div>
        <video
          src="/solutions.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-2xl shadow-sm"
        />
      </div>
    </section>
  );
}
