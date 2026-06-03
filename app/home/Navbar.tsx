"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { anim } from "./hooks";
import { localizedPath } from "./i18n";
import type { Locale } from "./i18n";

const LANGUAGES: { code: Locale; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "id", label: "Bahasa Indonesia", short: "ID" }
];

const NAV_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    product: "Product",
    solutions: "Solutions",
    resources: "Resources",
    testimonials: "Testimonials",
    pricing: "Pricing",
    faq: "FAQ",
    login: "Login",
    cta: "Start Free"
  },
  id: {
    product: "Produk",
    solutions: "Solusi",
    resources: "Fitur",
    testimonials: "Testimoni",
    pricing: "Harga",
    faq: "FAQ",
    login: "Masuk",
    cta: "Coba Gratis"
  }
};

interface NavbarProps {
  locale?: Locale;
}

export function Navbar({ locale = "en" }: NavbarProps) {
  // Initialise from current scrollY so hash-links load with the correct style
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = NAV_LABELS[locale];
  const home = localizedPath(locale, "/");
  const navItems = [
    { label: t.product, href: `${home}#product` },
    { label: t.solutions, href: `${home}#solutions` },
    { label: t.resources, href: `${home}#resources` },
    { label: t.testimonials, href: `${home}#testimonials` },
    { label: t.pricing, href: localizedPath(locale, "/pricing") },
    { label: t.faq, href: localizedPath(locale, "/faq") }
  ];
  // Resolve the current page in each locale (strip any leading "/id").
  const basePath = (pathname || home).replace(/^\/id(?=\/|$)/, "") || "/";
  const localeHref = (l: Locale) => localizedPath(l, basePath);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 20);
    check(); // run immediately on mount
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [langOpen]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300"
      style={{
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.08)"
          : "1px solid rgba(255,255,255,0.3)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <nav
        className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto"
        style={anim("0ms")}
      >
        <Link href={home} className="flex items-center">
          <Image
            src="/assets/papanclip_logo.png"
            alt="Papanclip"
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div
          className="hidden md:flex items-center gap-7 text-sm font-medium transition-colors"
          style={{ color: "#374151" }}
        >
          {navItems.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="nav-link hover:text-gray-900 transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div ref={langRef} className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-label={locale === "en" ? "Change language" : "Ganti bahasa"}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 rounded-lg px-2.5 py-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {locale === "en" ? "EN" : "ID"}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {langOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden py-1 z-50"
              >
                {LANGUAGES.map((l) => (
                  <Link
                    key={l.code}
                    href={localeHref(l.code)}
                    role="menuitem"
                    onClick={() => setLangOpen(false)}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      l.code === locale
                        ? "font-semibold text-gray-900 bg-gray-50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-gray-400 w-5">{l.short}</span>
                      {l.label}
                    </span>
                    {l.code === locale && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53A3FF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t.login}
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t.cta}
          </Link>
        </div>
      </nav>
    </div>
  );
}
