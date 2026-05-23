"use client";

import { useState } from "react";
import { useReveal } from "./hooks";

/* ── Social-proof tweets ──────────────────────────────────── */
const TWEETS = [
  {
    quote:
      "Incredible experience with Papanclip — it gives the same feeling as when we first saw the power of Notion, DeepSeek, and Claude Code. You need to try this.",
    handle: "@ryar",
    name: "Ryan A.",
    avatar: null,
    initials: "RA",
    avatarBg: "bg-indigo-500",
    stars: 5,
    tag: "Engineering",
  },
  {
    quote: "It's running my company.",
    handle: "@therno",
    name: "Thern O.",
    avatar: "https://i.pravatar.cc/56?img=12",
    initials: "TO",
    avatarBg: "bg-orange-400",
    stars: 5,
    tag: "Startup",
  },
  {
    quote:
      "After years of AI hype I thought nothing would faze me. Then I set up Papanclip and realized this is genuinely the next level of team coordination.",
    handle: "@lycfyi",
    name: "Lyc F.",
    avatar: null,
    initials: "LF",
    avatarBg: "bg-violet-500",
    stars: 5,
    tag: "Product",
  },
  {
    quote:
      "The RBAC is exactly what agencies need. We finally stopped accidentally leaking internal docs to clients. Game changer.",
    handle: "@chrisdietr",
    name: "Chris D.",
    avatar: null,
    initials: "CD",
    avatarBg: "bg-teal-500",
    stars: 5,
    tag: "Agency",
  },
  {
    quote:
      "Try Papanclip if you want more powerful workflows. It genuinely changed how I manage my team — and my clients love the clean view they get. 😄",
    handle: "@bangnokia",
    name: "Bang N.",
    avatar: "https://i.pravatar.cc/56?img=33",
    initials: "BN",
    avatarBg: "bg-rose-500",
    stars: 5,
    tag: "Operations",
  },
  {
    quote:
      "This is hands down the best project management tool I've used. Clean, fast, and actually works the way my brain does.",
    handle: "@alex_w",
    name: "Alex W.",
    avatar: "https://i.pravatar.cc/56?img=47",
    initials: "AW",
    avatarBg: "bg-purple-500",
    stars: 5,
    tag: "Design",
  },
];

/* ── Bilingual deep-dive testimonials ─────────────────────── */
const REVIEWS = {
  en: [
    {
      quote:
        "Papanclip finally made our sprint planning feel effortless. We cut meeting time in half and everyone actually knows what they're working on now.",
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
      quote:
        "We replaced three separate apps with Papanclip. Cleaner workflow, fewer mistakes, faster delivery.",
      name: "Kevin T.",
      role: "Founder",
      category: "Startup Founder",
    },
    {
      quote:
        "The client collaboration features are ridiculously good. No more lost feedback or confusing revisions.",
      name: "Amelia C.",
      role: "Creative Director",
      category: "Agency Team",
    },
    {
      quote:
        "It feels like Notion and Jira had a smarter, faster child. The UI is insanely smooth.",
      name: "Lyc F.",
      role: "Product Manager",
      category: "Product Team",
    },
  ],
  id: [
    {
      quote:
        "Sejak pakai Papanclip, koordinasi antar tim jadi jauh lebih rapi. Progress project sekarang bisa dipantau tanpa harus chat terus.",
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
        "Awalnya tim saya susah adaptasi tools baru, tapi Papanclip justru langsung dipakai semua orang dari hari pertama.",
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

export function Testimonials() {
  const tweetsReveal = useReveal();
  const reviewsReveal = useReveal();
  const [lang, setLang] = useState<"en" | "id">("en");

  const reviews = REVIEWS[lang];

  return (
    <>
      {/* ── Section 1: Social-proof tweet cards ───────────── */}
      <section id="testimonials" className="py-28 px-8 overflow-hidden bg-white">
        <div ref={tweetsReveal.ref} className="max-w-7xl mx-auto w-full">
          <div className={`flex items-end justify-between mb-14 reveal-up ${tweetsReveal.visible ? "revealed" : ""}`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Social proof
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                Loved by teams
                <br />
                <span style={{ color: "#53A3FF" }}>around the world.</span>
              </h2>
            </div>
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {TWEETS.map((t, i) => (
              <div
                key={t.handle}
                className={`break-inside-avoid hc bg-white border border-gray-100 rounded-2xl p-6 shadow-sm reveal-scale stagger-${Math.min(i + 1, 4)} ${tweetsReveal.visible ? "revealed" : ""}`}
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-full ${t.avatarBg} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                        {t.initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.handle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof footer */}
          <div className={`mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-6 reveal-up stagger-4 ${tweetsReveal.visible ? "revealed" : ""}`}>
            <div className="flex -space-x-2">
              {["https://i.pravatar.cc/32?img=12", "https://i.pravatar.cc/32?img=33", "https://i.pravatar.cc/32?img=47"].map((src, i) => (
                <img key={i} src={src} className="w-8 h-8 rounded-full ring-2 ring-white object-cover" alt="" />
              ))}
              <div className="w-8 h-8 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                +99
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center sm:text-left">
              <span className="font-semibold text-gray-900">2,400+ teams</span>{" "}
              already managing work smarter.
            </p>
            <a
              href="#"
              className="shrink-0 text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Join them free
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 2: Bilingual deep-dive reviews ────────── */}
      <section className="py-24 px-8 bg-gray-50">
        <div ref={reviewsReveal.ref} className="max-w-6xl mx-auto w-full">
          <div className={`text-center mb-14 reveal-up ${reviewsReveal.visible ? "revealed" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Testimonials
            </p>
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

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-up stagger-2 ${reviewsReveal.visible ? "revealed" : ""}`}>
            {reviews.map((t, i) => (
              <div
                key={`${lang}-${i}`}
                className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  {t.category}
                </p>
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
    </>
  );
}
