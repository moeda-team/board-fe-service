"use client";

import Image from "next/image";
import type { Locale } from "./i18n";

const CONTENT: Record<Locale, { description: string; tagline: string }> = {
  en: {
    description:
      "PapanClip is project management and task management software for agile teams. Manage projects, tasks, sprints, and software development workflows in one platform — helping teams plan, track, and deliver projects faster. A Jira, ClickUp, and Trello alternative for software teams.",
    tagline: "Built for high-performance teams"
  },
  id: {
    description:
      "PapanClip adalah software manajemen proyek dan aplikasi manajemen tugas untuk tim agile. Kelola proyek, tugas, sprint, dan workflow pengembangan software dalam satu platform — bantu tim merencanakan, melacak, dan menyelesaikan proyek lebih cepat. Alternatif Jira, ClickUp, dan Trello untuk tim developer di Indonesia.",
    tagline: "Dibuat untuk tim berperforma tinggi"
  }
};

const FOOTER_LINKS: Record<Locale, { label: string; href: string }[]> = {
  en: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms-of-service" }
  ],
  id: [
    { label: "Tentang", href: "/about" },
    { label: "Kontak", href: "/contact" },
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Ketentuan Layanan", href: "/terms-of-service" }
  ]
};

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const c = CONTENT[locale];
  const links = FOOTER_LINKS[locale];
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-8 px-8 text-center text-xs text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/assets/papanclip_logo.png"
          alt="PapanClip — software manajemen proyek dan tugas"
          width={120}
          height={36}
          className="opacity-60 brightness-0 invert"
        />
        <p className="max-w-2xl text-balance leading-relaxed text-gray-500">
          {c.description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-400 transition-colors hover:text-gray-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        <span>
          © {new Date().getFullYear()} PapanClip · {c.tagline}
        </span>
      </div>
    </footer>
  );
}
