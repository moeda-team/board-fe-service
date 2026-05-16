"use client";

import { useReveal } from "./hooks";

export function Product() {
  const productReveal = useReveal();

  return (
    <section id="product" className="min-h-screen bg-white flex items-center px-8 py-24">
      <div ref={productReveal.ref} className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        <div className={`flex-1 relative reveal-left ${productReveal.visible ? "revealed" : ""}`}>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full sm:max-w-lg">
            <div className="flex h-[280px] sm:h-[380px]">
              <div className="w-28 sm:w-44 bg-white border-r border-gray-100 p-3 flex flex-col gap-1">
                <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest font-semibold px-2 mb-2">
                  Spaces
                </p>
                {[
                  { name: "Engineering", color: "bg-indigo-500", active: true },
                  { name: "Design", color: "bg-pink-400" },
                  { name: "Marketing", color: "bg-orange-400" },
                  { name: "Client — Acme", color: "bg-teal-400" },
                ].map((s) => (
                  <div
                    key={s.name}
                    className={`flex items-center gap-2 px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium ${s.active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <div className={`w-2 h-2 rounded-sm ${s.color}`} />
                    {s.name}
                  </div>
                ))}
                <div className="mt-auto">
                  <div className="px-2 py-1.5 text-xs text-gray-400">Storage</div>
                  <div className="mx-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-3/5 rounded-full bg-indigo-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 px-2 mt-1">6.1 GB / 10 GB</p>
                </div>
              </div>
              <div className="flex-1 p-2 sm:p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">Engineering</p>
                  <div className="flex -space-x-1">
                    {["bg-indigo-400", "bg-pink-400", "bg-teal-400"].map((c, i) => (
                      <div key={i} className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${c} border-2 border-white`} />
                    ))}
                  </div>
                </div>
                {[
                  { name: "Sprint 12 Board", type: "Board", prog: 72 },
                  { name: "API Documentation", type: "Doc", prog: 100 },
                  { name: "Bug Tracker", type: "Board", prog: 45 },
                  { name: "Architecture Notes", type: "Doc", prog: 88 },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.type === "Board" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {item.type}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-700 flex-1 truncate">{item.name}</span>
                    <div className="w-10 sm:w-16 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${item.prog}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`flex-1 reveal-right ${productReveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Platform</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            One workspace.
            <br />
            Every team.
            <br />
            <span style={{ color: "#53A3FF" }}>Total clarity.</span>
          </h2>
          <p className="mt-5 text-gray-500 leading-relaxed max-w-md">
            Spaces, Folders, Boards, and Docs — all structured in one place. No more juggling between apps to track what
            your team is working on.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7C6FF7"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M15 9l1.5-1.5" />
                  </svg>
                ),
                iconBg: "#EDEAFD",
                title: "Custom Roles",
                desc: "Granular access control with flexible roles and permissions.",
              },
              {
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F472B6"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="10" width="5" height="10" rx="1" />
                    <rect x="16" y="10" width="5" height="10" rx="1" />
                    <path d="M8 20h8" />
                    <path d="M12 4c-3 0-5 2-5 4" strokeDasharray="2 2" />
                    <path d="M12 4c3 0 5 2 5 4" strokeDasharray="2 2" />
                  </svg>
                ),
                iconBg: "#FDE8F3",
                title: "Multi-Tenant Access",
                desc: "Invite other companies and collaborate across organizations.",
              },
              {
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z" />
                    <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z" />
                  </svg>
                ),
                iconBg: "#D1FAE5",
                title: "Unlimited Workspaces",
                desc: "Create unlimited workspaces to organize projects your way.",
              },
              {
                icon: (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#53A3FF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="6" r="2.5" />
                    <path d="M7 21v-1.5a5 5 0 0 1 10 0V21" />
                    <circle cx="5" cy="8" r="2" />
                    <path d="M2 21v-1a4 4 0 0 1 5.5-3.7" />
                    <circle cx="19" cy="8" r="2" />
                    <path d="M22 21v-1a4 4 0 0 0-5.5-3.7" />
                  </svg>
                ),
                iconBg: "#DBEAFE",
                title: "Unlimited Users",
                desc: "Add as many users as you need. No seat limits, ever.",
              },
            ].map(({ icon, iconBg, title, desc }, i) => (
              <div
                key={title}
                className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm reveal-scale stagger-${i + 1} ${productReveal.visible ? "revealed" : ""}`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: iconBg }}
                >
                  {icon}
                </div>
                <div className="text-base font-bold text-gray-900 mb-1">{title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
