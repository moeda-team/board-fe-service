"use client";

import { useReveal } from "./hooks";

export function Solutions() {
  const solutionsReveal = useReveal();

  return (
    <section id="solutions" className="min-h-screen bg-gray-50 flex items-center px-8 py-24">
      <div ref={solutionsReveal.ref} className="max-w-7xl mx-auto w-full">
        <div className={`text-center mb-16 reveal-up ${solutionsReveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Solutions</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">More than task management.</h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            ChronoTask combines the structure of Notion, the workflow of Jira, and enterprise-grade access control —
            without the complexity.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Structured Workspaces",
              desc: "Organize everything into Spaces, Folders, and Documents. Every team, project, and client gets its own structured home.",
              visual: (
                <div className="flex gap-2 mt-4">
                  {["Engineering", "Design", "Client"].map((s, i) => (
                    <div
                      key={s}
                      className={`flex-1 rounded-lg p-2 text-center text-xs font-medium ${["bg-indigo-100 text-indigo-700", "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700"][i]}`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Granular Access Control",
              desc: "Role-based permissions at workspace and space level. Invite clients into exactly what they need — nothing more.",
              visual: (
                <div className="mt-4 space-y-1.5">
                  {[
                    ["Admin", "Full Access", "bg-emerald-400"],
                    ["Dev", "Can Edit", "bg-blue-400"],
                    ["Client", "View Only", "bg-yellow-400"],
                  ].map(([r, a, c]) => (
                    <div key={r} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-gray-700 font-medium">{r}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${c}`} />
                        <span className="text-xs text-gray-400">{a}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Developer KPI Tracking",
              desc: "Turn task completion into measurable output. Track velocity, bug rates, and developer performance on a live leaderboard.",
              visual: (
                <div className="mt-4 flex items-end gap-2 h-16">
                  {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-indigo-200 relative" style={{ height: `${h}%` }}>
                      {i === 5 && <div className="absolute inset-0 rounded-t bg-indigo-500" />}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              title: "Docs & Tasks Together",
              desc: "Write specs, SOPs, and meeting notes alongside your tasks. No context-switching between Notion and Jira.",
              visual: (
                <div className="mt-4 bg-gray-50 rounded-lg p-3 space-y-1.5">
                  {["# Sprint 12 Plan", "## Goals", "- [ ] Auth refactor", "- [x] API docs"].map((l) => (
                    <p key={l} className="text-xs font-mono text-gray-500">
                      {l}
                    </p>
                  ))}
                </div>
              ),
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`hc bg-white rounded-2xl p-7 border border-gray-100 shadow-sm reveal-scale stagger-${i + 1} ${solutionsReveal.visible ? "revealed" : ""}`}
            >
              <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{f.desc}</p>
              {f.visual}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
