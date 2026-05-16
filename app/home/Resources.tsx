"use client";

import Link from "next/link";
import { useReveal } from "./hooks";

export function Resources() {
  const resourcesReveal = useReveal();

  return (
    <section
      id="resources"
      className="min-h-screen flex items-center px-8 py-24"
      style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}
    >
      <div ref={resourcesReveal.ref} className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
        <div className={`flex-1 reveal-left ${resourcesReveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
            Your strongest differentiator
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
            Granular access
            <br />
            control, without
            <br />
            <span className="text-blue-400">the enterprise tax.</span>
          </h2>
          <p className="mt-6 text-gray-300 leading-relaxed max-w-md">
            Define roles at workspace and space level. Invite clients into only what they need to see. Built-in RBAC
            that scales from a 3-person team to multi-tenant agency operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Workspace Roles", "Space Permissions", "Client Isolation", "Audit Logs"].map((tag) => (
              <span key={tag} className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 text-gray-300">
                {tag}
              </span>
            ))}
          </div>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
          >
            See how it works
          </Link>
        </div>

        <div className={`flex-1 w-full max-w-md reveal-right ${resourcesReveal.visible ? "revealed" : ""}`}>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">Space Permissions — Engineering</span>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Role</th>
                  {["View", "Edit", "Delete", "Admin"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-gray-500 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { role: "Eng Lead", access: [true, true, true, true], color: "text-emerald-400" },
                  { role: "Developer", access: [true, true, false, false], color: "text-blue-400" },
                  { role: "Designer", access: [true, false, false, false], color: "text-yellow-400" },
                  { role: "Client", access: [true, false, false, false], color: "text-red-400" },
                ].map((row) => (
                  <tr key={row.role} className="border-b border-white/5 last:border-0">
                    <td className={`px-5 py-3 font-medium ${row.color}`}>{row.role}</td>
                    {row.access.map((a, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        {a ? <span className="text-emerald-400">✓</span> : <span className="text-white/20">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Recent Activity</p>
            {[
              { action: "Role updated", user: "admin", time: "2m ago" },
              { action: "Client invited", user: "sarah", time: "1h ago" },
              { action: "Space created", user: "john", time: "3h ago" },
            ].map((e) => (
              <div key={e.action} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span className="text-xs text-gray-300">{e.action}</span>
                  <span className="text-[10px] text-gray-500">by {e.user}</span>
                </div>
                <span className="text-[10px] text-gray-500">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
