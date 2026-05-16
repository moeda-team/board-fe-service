"use client";

import Link from "next/link";
import { useReveal } from "./hooks";

export function FinalCTA() {
  const ctaReveal = useReveal();

  return (
    <section className="bg-gray-950 py-32 px-8 text-center">
      <div ref={ctaReveal.ref} className="max-w-2xl mx-auto">
        <h2 className={`text-4xl md:text-5xl font-serif font-bold text-white leading-tight reveal-up ${ctaReveal.visible ? "revealed" : ""}`}>
          Ready to bring
          <br />
          structure to your team?
        </h2>
        <p className={`mt-5 text-gray-400 reveal-up stagger-2 ${ctaReveal.visible ? "revealed" : ""}`}>
          Start free. No credit card required. Set up your first workspace in under 5 minutes.
        </p>
        <div className={`mt-10 flex items-center justify-center gap-4 flex-wrap reveal-up stagger-3 ${ctaReveal.visible ? "revealed" : ""}`}>
          <Link
            href="/login"
            className="btn-shine bg-white text-gray-900 px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free Today
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-4"
          >
            Talk to a human instead
          </Link>
        </div>
      </div>
    </section>
  );
}
