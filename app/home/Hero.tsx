"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { anim } from "./hooks";
import type { Column, Task } from "./types";

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

function ProgressBar({ progress, from, delay }: { progress: number; from: number; delay: number }) {
  const [displayWidth, setDisplayWidth] = useState(from);
  const raf = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    setDisplayWidth(from);
    const tid = setTimeout(() => {
      raf.current = requestAnimationFrame(() => setDisplayWidth(progress));
    }, delay);
    return () => {
      clearTimeout(tid);
      cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, from]);

  const increasing = progress >= from;
  const done = progress === 100;
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${displayWidth}%`,
          transition: `width ${increasing ? "0.8s cubic-bezier(0.34,1.56,0.64,1)" : "0.6s cubic-bezier(0.4,0,0.2,1)"}`,
          background: done ? "linear-gradient(90deg, #818cf8, #6366f1, #a78bfa, #6366f1, #818cf8)" : "#818cf8",
          backgroundSize: done ? "200% auto" : undefined,
          animation: done ? "shimmer 2s linear infinite" : undefined,
        }}
      />
    </div>
  );
}

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [mounted, setMounted] = useState(false);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColId: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const prevProgressMap = useRef<Record<string, number>>(
    Object.fromEntries(INITIAL_COLUMNS.flatMap((c) => c.tasks.map((t) => [t.id, t.progress]))),
  );

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

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

    const progressForCol = (colId: string) => {
      if (colId === "done") return 100;
      if (colId === "inprogress") return Math.floor(Math.random() * 45) + 40;
      return Math.floor(Math.random() * 25) + 5;
    };

    const newProgress = progressForCol(targetColId);
    prevProgressMap.current[task.id] = task.progress;

    setColumns((prev) => {
      const newCols = prev.map((col) => {
        if (col.id === sourceColId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColId) {
          return { ...col, tasks: [...col.tasks, { ...task, progress: newProgress }] };
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
      <div className="float bg-white rounded-2xl shadow-2xl border border-white/60 w-[540px] h-[60vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="ml-3 text-sm text-gray-400 font-medium">ChronoTask — Engineering Sprint</span>
        </div>
        <div className="flex gap-4 p-5 flex-1 overflow-auto">
          {columns.map(({ id, title, color, tasks }) => (
            <div
              key={id}
              className={`flex-1 rounded-xl p-3.5 ${color} transition-all duration-200 ${dragOverCol === id ? "ring-2 ring-indigo-400 ring-offset-2 scale-[1.02] shadow-md" : ""}`}
              onDragOver={(e) => handleDragOver(e, id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, id)}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
              {tasks.map((task, taskIdx) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, id)}
                  onDragEnd={() => setDraggedTask(null)}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                  className="bg-white rounded-lg px-3 py-2.5 mb-2 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none"
                  style={{
                    opacity: draggedTask?.task.id === task.id ? 0.4 : mounted ? 1 : 0,
                    transform:
                      draggedTask?.task.id === task.id ? "scale(0.96)" : mounted ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.5s ease, transform 0.5s ease`,
                    transitionDelay: draggedTask ? "0ms" : mounted ? `${taskIdx * 80}ms` : "0ms",
                  }}
                >
                  <p className="text-sm text-gray-700 font-medium">{task.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                      A
                    </div>
                    <div className="relative flex-1">
                      <ProgressBar
                        key={task.id}
                        progress={task.progress}
                        from={mounted ? (prevProgressMap.current[task.id] ?? 0) : 0}
                        delay={mounted ? taskIdx * 60 : taskIdx * 60}
                      />
                      <span
                        className="absolute -top-4 right-0 text-[9px] font-semibold text-indigo-500 pointer-events-none"
                        style={{
                          opacity: hoveredTask === task.id ? 1 : 0,
                          transform: hoveredTask === task.id ? "translateY(0)" : "translateY(3px)",
                          transition: "opacity 0.2s ease, transform 0.2s ease",
                        }}
                      >
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

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

export function Hero() {
  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden pt-[72px]"
      style={{
        background: "linear-gradient(160deg,#f9d4b0 0%,#f5c5a0 15%,#f0d4c0 35%,#e8d0d8 55%,#d4c8e8 75%,#c8b8e0 100%)",
      }}
    >
      <div className="flex-1 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-8 py-16 flex flex-col lg:flex-row items-center gap-12">
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
                Sign up, it&apos;s Free!
              </Link>
              <Link
                href="/login"
                className="bg-white/60 backdrop-blur-sm border border-white/80 text-gray-800 px-7 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/80 transition-colors"
              >
                Book a Demo
              </Link>
            </div>
          </div>

          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}
