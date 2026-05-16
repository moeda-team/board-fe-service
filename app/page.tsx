"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Task {
  id: string;
  title: string;
  progress: number;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const INITIAL_COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-gray-100",
    tasks: [
      { id: "t1", title: "Implement OAuth2 login", progress: 15 },
      { id: "t2", title: "Setup Stripe billing", progress: 5 },
      { id: "t3", title: "Design email templates", progress: 25 },
      { id: "t4", title: "Write API documentation", progress: 10 },
    ],
  },
  {
    id: "inprogress",
    title: "In Progress",
    color: "bg-blue-50",
    tasks: [
      { id: "t5", title: "Dashboard analytics", progress: 65 },
      { id: "t6", title: "RBAC permissions", progress: 80 },
      { id: "t7", title: "Mobile responsive", progress: 45 },
    ],
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-50",
    tasks: [
      { id: "t8", title: "Real-time notifications", progress: 100 },
      { id: "t9", title: "PostgreSQL schema", progress: 100 },
      { id: "t10", title: "CI/CD pipeline", progress: 100 },
      { id: "t11", title: "Docker compose setup", progress: 100 },
      { id: "t12", title: "Health check endpoint", progress: 100 },
    ],
  },
];

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColId: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const handleDragStart = (task: Task, sourceColId: string) => {
    setDraggedTask({ task, sourceColId });
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, sourceColId } = draggedTask;
    if (sourceColId === targetColId) {
      setDragOverCol(null);
      setDraggedTask(null);
      return;
    }

    setColumns((prev) => {
      const newCols = prev.map((col) => {
        if (col.id === sourceColId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      });
      return newCols;
    });

    setDragOverCol(null);
    setDraggedTask(null);
  };

  return (
    <div
      className="flex-1 relative hidden lg:flex items-center justify-center"
      style={{ animation: "scaleIn 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both" }}
    >
      {/* Main board card */}
      <div className="float bg-white rounded-2xl shadow-2xl border border-white/60 w-[540px] h-[60vh] overflow-hidden flex flex-col">
        {/* Topbar */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-sm text-gray-400 font-medium">ChronoTask — Engineering Sprint</span>
        </div>
        {/* Kanban columns */}
        <div className="flex gap-4 p-5 flex-1 overflow-auto">
          {columns.map(({ id, title, color, tasks }) => (
            <div
              key={id}
              className={`flex-1 rounded-xl p-3.5 ${color} transition-all ${dragOverCol === id ? "ring-2 ring-indigo-400 ring-offset-2" : ""}`}
              onDragOver={(e) => handleDragOver(e, id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, id)}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, id)}
                  className="bg-white rounded-lg px-3 py-2.5 mb-2 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-gray-700 font-medium">{task.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                      A
                    </div>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-400" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating KPI badge */}
      <div className="float-slow absolute -top-4 -right-6 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 w-44">
        <p className="text-xs text-gray-400 font-medium mb-1.5">Top Developer</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">John D.</p>
            <p className="text-xs text-emerald-500 font-medium">KPI 94 🏆</p>
          </div>
        </div>
      </div>

      {/* Floating permission badge */}
      <div className="float absolute -bottom-2 -left-8 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 w-52">
        <p className="text-xs text-gray-400 font-medium mb-2">Access Control</p>
        {[
          ["Dev", "Can Edit", "bg-blue-400"],
          ["Client", "View Only", "bg-yellow-400"],
        ].map(([r, a, c]) => (
          <div key={r} className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700">{r}</span>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${c}`} />
              <span className="text-xs text-gray-400">{a}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function anim(delay: string) {
  return { animation: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both", animationDelay: delay } as React.CSSProperties;
}

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "#pricing" },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "For small teams exploring the platform.",
    features: ["Up to 5 members", "3 Spaces", "Basic task management", "Community support"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    per: "/seat/mo",
    desc: "Full control for growing teams.",
    features: [
      "Unlimited members",
      "Unlimited Spaces",
      "RBAC & permissions",
      "Developer KPI tracking",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Multi-tenant, white-label, enterprise security.",
    features: ["Everything in Pro", "Multi-tenant workspaces", "SSO & SAML", "Audit logs", "Dedicated support"],
    cta: "Contact Sales",
    highlight: false,
  },
];

function Check({ bright }: { bright?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path
        d="M2.5 7l3 3 6-6"
        stroke={bright ? "#86efac" : "#22c55e"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const productReveal = useReveal();
  const solutionsReveal = useReveal();
  const resourcesReveal = useReveal();
  const pricingReveal = useReveal();
  const ctaReveal = useReveal();
  const statsCount = useCountUp(100, 1200, productReveal.visible);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        html { scroll-behavior: smooth; }
        .hc { transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s ease; }
        .hc:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.11); }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:#111; transition:width .2s; }
        .nav-link:hover::after { width:100%; }
        .float { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .reveal-left { opacity:0; transform:translateX(-40px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal-right { opacity:0; transform:translateX(40px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal-up { opacity:0; transform:translateY(32px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .reveal-scale { opacity:0; transform:scale(0.93); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .revealed { opacity:1 !important; transform:none !important; }
        .stagger-1 { transition-delay: 0ms !important; }
        .stagger-2 { transition-delay: 80ms !important; }
        .stagger-3 { transition-delay: 160ms !important; }
        .stagger-4 { transition-delay: 240ms !important; }
        .btn-shine { position:relative; overflow:hidden; }
        .btn-shine::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left 0.5s ease; }
        .btn-shine:hover::after { left:140%; }
      `}</style>

      {/* ══ NAVBAR (fixed, scroll-aware) ══ */}
      <div
        className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300"
        style={{
          backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.2)",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.3)",
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
        }}
      >
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto" style={anim("0ms")}>
          <div className="flex items-center gap-2 font-semibold text-lg text-gray-900">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="5" cy="5" r="4" fill="#53A3FF" />
              <circle cx="15" cy="5" r="4" fill="#14100A" />
              <circle cx="5" cy="15" r="4" fill="#14100A" />
              <circle cx="15" cy="15" r="4" fill="#14100A" />
            </svg>
            ChronoTask
          </div>
          <div
            className="hidden md:flex items-center gap-7 text-sm font-medium transition-colors"
            style={{ color: scrolled ? "#374151" : "#4b5563" }}
          >
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="nav-link hover:text-gray-900 transition-colors">
                {n.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-gray-900"
              style={{ color: scrolled ? "#374151" : "#4b5563" }}
            >
              Login
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </nav>
      </div>

      {/* ══ HERO ══ */}
      <div
        className="relative min-h-screen flex flex-col overflow-hidden pt-[72px]"
        style={{
          background: "linear-gradient(160deg,#f9d4b0 0%,#f5c5a0 15%,#f0d4c0 35%,#e8d0d8 55%,#d4c8e8 75%,#c8b8e0 100%)",
        }}
      >
        {/* Hero content */}
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-8 py-16 flex flex-col lg:flex-row items-center gap-12">
            {/* Left: copy */}
            <div className="flex-1 text-left">
              <div
                className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/70 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 mb-6"
                style={anim("50ms")}
              >
                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Built for startups, agencies &amp; engineering teams
              </div>
              <h1
                className="text-5xl md:text-[3.8rem] font-serif font-bold text-gray-900 leading-[1.1] tracking-tight"
                style={anim("150ms")}
              >
                Manage projects,
                <br />
                docs, and team
                <br />
                <span style={{ color: "#53A3FF" }}>collaboration.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-lg leading-relaxed" style={anim("300ms")}>
                Plan tasks, organize knowledge, and control access — one unified workspace for teams that need real
                structure, not another to-do list.
              </p>
              <div className="mt-9 flex items-center gap-4 flex-wrap" style={anim("450ms")}>
                <Link
                  href="/login"
                  className="btn-shine bg-gray-900 text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors shadow-lg"
                >
                  Sign up, it's Free!
                </Link>
                <Link
                  href="/login"
                  className="bg-white/60 backdrop-blur-sm border border-white/80 text-gray-800 px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/80 transition-colors"
                >
                  Book a Demo
                </Link>
              </div>
            </div>

            {/* Right: mock UI */}
            <KanbanBoard />
          </div>
        </div>
      </div>

      {/* ══ PRODUCT — social proof + workspace overview ══ */}
      <section id="product" className="min-h-screen bg-white flex items-center px-8 py-24">
        <div ref={productReveal.ref} className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16">
          {/* Mock workspace sidebar + content */}
          <div className={`flex-1 relative reveal-left ${productReveal.visible ? "revealed" : ""}`}>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden w-full max-w-lg">
              <div className="flex h-[380px]">
                {/* Sidebar */}
                <div className="w-44 bg-white border-r border-gray-100 p-3 flex flex-col gap-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold px-2 mb-2">Spaces</p>
                  {[
                    { name: "Engineering", color: "bg-indigo-500", active: true },
                    { name: "Design", color: "bg-pink-400" },
                    { name: "Marketing", color: "bg-orange-400" },
                    { name: "Client — Acme", color: "bg-teal-400" },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium ${s.active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"}`}
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
                {/* Content */}
                <div className="flex-1 p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-800">Engineering</p>
                    <div className="flex -space-x-1">
                      {["bg-indigo-400", "bg-pink-400", "bg-teal-400"].map((c, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-white`} />
                      ))}
                    </div>
                  </div>
                  {[
                    { name: "Sprint 12 Board", type: "Board", prog: 72 },
                    { name: "API Documentation", type: "Doc", prog: 100 },
                    { name: "Bug Tracker", type: "Board", prog: 45 },
                    { name: "Architecture Notes", type: "Doc", prog: 88 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.type === "Board" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}
                      >
                        {item.type}
                      </div>
                      <span className="text-xs text-gray-700 flex-1">{item.name}</span>
                      <div className="w-16 h-1 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${item.prog}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy + stats */}
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
              Spaces, Folders, Boards, and Docs — all structured in one place. No more juggling between apps to track
              what your team is working on.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6">
              {[
                { v: `${statsCount}+`, l: "Teams onboarded" },
                { v: "3×", l: "Faster project handoffs" },
                { v: "RBAC", l: "Enterprise access control" },
                { v: "∞", l: "Spaces per workspace" },
              ].map(({ v, l }, i) => (
                <div
                  key={l}
                  className={`bg-gray-50 rounded-xl p-4 border border-gray-100 reveal-scale stagger-${i + 1} ${productReveal.visible ? "revealed" : ""}`}
                >
                  <div className="text-2xl font-bold text-gray-900">{v}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SOLUTIONS — features ══ */}
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

      {/* ══ RESOURCES — RBAC deep dive ══ */}
      <section
        id="resources"
        className="min-h-screen flex items-center px-8 py-24"
        style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}
      >
        <div
          ref={resourcesReveal.ref}
          className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-16"
        >
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
                <span
                  key={tag}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 text-gray-300"
                >
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

          {/* Right: permission matrix illustration */}
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

            {/* Floating audit log snippet */}
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

      {/* ══ PRICING ══ */}
      <section id="pricing" className="min-h-screen bg-white flex items-center px-8 py-24">
        <div ref={pricingReveal.ref} className="max-w-5xl mx-auto w-full">
          <div className={`text-center mb-14 reveal-up ${pricingReveal.visible ? "revealed" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">Simple, transparent pricing.</h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">
              No hidden fees. Start free, upgrade when your team grows.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`hc rounded-2xl p-7 border flex flex-col reveal-up stagger-${i + 1} ${pricingReveal.visible ? "revealed" : ""} ${plan.highlight ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-100"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.per && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.per}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check bright={plan.highlight} />
                      <span className={plan.highlight ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${plan.highlight ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-700"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="bg-gray-950 py-32 px-8 text-center">
        <div ref={ctaReveal.ref} className="max-w-2xl mx-auto">
          <h2
            className={`text-4xl md:text-5xl font-serif font-bold text-white leading-tight reveal-up ${ctaReveal.visible ? "revealed" : ""}`}
          >
            Ready to bring
            <br />
            structure to your team?
          </h2>
          <p className={`mt-5 text-gray-400 reveal-up stagger-2 ${ctaReveal.visible ? "revealed" : ""}`}>
            Start free. No credit card required. Set up your first workspace in under 5 minutes.
          </p>
          <div
            className={`mt-10 flex items-center justify-center gap-4 flex-wrap reveal-up stagger-3 ${ctaReveal.visible ? "revealed" : ""}`}
          >
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

      {/* ══ FOOTER ══ */}
      <footer className="bg-gray-950 border-t border-white/5 py-8 px-8 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} ChronoTask · Built for high-performance teams
      </footer>
    </>
  );
}
