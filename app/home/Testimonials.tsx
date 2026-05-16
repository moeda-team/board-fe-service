"use client";

import { useReveal } from "./hooks";

const TESTIMONIALS = [
  {
    quote:
      "Incredible experience with ChronoTask — it gives the same feeling as when we first saw the power of Notion, DeepSeek, and Claude Code. You need to try this.",
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
      "After years of AI hype I thought nothing would faze me. Then I set up ChronoTask and realized this is genuinely the next level of team coordination.",
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
      "Try ChronoTask if you want more powerful workflows. It genuinely changed how I manage my team — and my clients love the clean view they get. 😄",
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

export function Testimonials() {
  const testimonialsReveal = useReveal();

  return (
    <section id="testimonials" className="py-28 px-8 overflow-hidden bg-white">
      <div ref={testimonialsReveal.ref} className="max-w-7xl mx-auto w-full">
        <div className={`flex items-end justify-between mb-14 reveal-up ${testimonialsReveal.visible ? "revealed" : ""}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Social proof</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
              Loved by teams
              <br />
              <span style={{ color: "#53A3FF" }}>around the world.</span>
            </h2>
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.handle}
              className={`break-inside-avoid hc bg-white border border-gray-100 rounded-2xl p-6 shadow-sm reveal-scale stagger-${Math.min(i + 1, 4)} ${testimonialsReveal.visible ? "revealed" : ""}`}
            >
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-100" />
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

        <div className={`mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-6 reveal-up stagger-4 ${testimonialsReveal.visible ? "revealed" : ""}`}>
          <div className="flex -space-x-2">
            {["https://i.pravatar.cc/32?img=12", "https://i.pravatar.cc/32?img=33", "https://i.pravatar.cc/32?img=47"].map((src, i) => (
              <img key={i} src={src} className="w-8 h-8 rounded-full ring-2 ring-white object-cover" alt="" />
            ))}
            <div className="w-8 h-8 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
              +99
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center sm:text-left">
            <span className="font-semibold text-gray-900">2,400+ teams</span> already managing work smarter.
          </p>
          <a href="#" className="shrink-0 text-sm font-semibold bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-700 transition-colors">
            Join them free
          </a>
        </div>
      </div>
    </section>
  );
}
