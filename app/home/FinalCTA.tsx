"use client";

import Link from "next/link";
import { useReveal } from "./hooks";
import type { Locale } from "./i18n";

const CONTENT: Record<Locale, {
  titleLines: string[];
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}> = {
  en: {
    titleLines: ["Ready to bring", "structure to your team?"],
    subtitle:
      "Start free. No credit card required. Set up your first workspace in under 5 minutes.",
    ctaPrimary: "Start Free Today",
    ctaSecondary: "Talk to a human instead"
  },
  id: {
    titleLines: ["Siap membawa", "struktur ke tim Anda?"],
    subtitle:
      "Mulai gratis. Tanpa kartu kredit. Siapkan workspace pertama Anda dalam waktu kurang dari 5 menit.",
    ctaPrimary: "Mulai Gratis Sekarang",
    ctaSecondary: "Bicara dengan tim kami"
  }
};

export function FinalCTA({ locale = "en" }: { locale?: Locale }) {
  const ctaReveal = useReveal();
  const c = CONTENT[locale];

  return (
    <section className="bg-gray-950 py-32 px-8 text-center">
      <div ref={ctaReveal.ref} className="max-w-2xl mx-auto">
        <h2 className={`text-4xl md:text-5xl font-serif font-bold text-white leading-tight reveal-up ${ctaReveal.visible ? "revealed" : ""}`}>
          {c.titleLines[0]}
          <br />
          {c.titleLines[1]}
        </h2>
        <p className={`mt-5 text-gray-400 reveal-up stagger-2 ${ctaReveal.visible ? "revealed" : ""}`}>
          {c.subtitle}
        </p>
        <div className={`mt-10 flex items-center justify-center gap-4 flex-wrap reveal-up stagger-3 ${ctaReveal.visible ? "revealed" : ""}`}>
          <Link
            href="/login"
            className="btn-shine bg-white text-gray-900 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            {c.ctaPrimary}
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          >
            {c.ctaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}
