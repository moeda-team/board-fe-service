"use client";

import { useMemo, useState } from "react";
import { Navbar, Footer } from "../home";
import type { Locale } from "../home";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  Bell,
  Clock,
  Play,
  Users,
  Zap,
  Puzzle,
  MoreHorizontal,
  FolderKanban,
  BarChart3
} from "lucide-react";

interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  isLatest?: boolean;
  whatsNew?: string[];
  screenshots?: { count?: number };
  demoVideo?: { title: string; duration: string };
}

const CATEGORIES: {
  key: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}[] = [
  {
    key: "all",
    label: "All new features",
    count: 16,
    icon: <FolderKanban size={16} />
  },
  {
    key: "dashboard",
    label: "Dashboard & Reports",
    count: 5,
    icon: <BarChart3 size={16} />
  },
  {
    key: "collaboration",
    label: "Collaboration",
    count: 3,
    icon: <Users size={16} />
  },
  { key: "automation", label: "Automation", count: 2, icon: <Zap size={16} /> },
  {
    key: "integrations",
    label: "Integrations",
    count: 4,
    icon: <Puzzle size={16} />
  },
  { key: "other", label: "Other", count: 2, icon: <MoreHorizontal size={16} /> }
];

const ENTRIES: ChangelogEntry[] = [
  {
    id: "bulk-edit",
    date: "May 15, 2024",
    title: "Bulk edit for tasks",
    description:
      "You can now edit multiple tasks at once, saving time and reducing repetitive work.",
    category: "dashboard",
    isLatest: true,
    whatsNew: [
      "Select multiple tasks from any view",
      "Edit fields like status, assignee, due date, priority, and labels",
      "Changes are applied instantly",
      "Works across board, list, and calendar views"
    ],
    screenshots: { count: 4 },
    demoVideo: { title: "Bulk edit for tasks — PapanClip", duration: "1:25" }
  },
  {
    id: "new-dashboard",
    date: "May 8, 2024",
    title: "New dashboard layout",
    description:
      "A cleaner, more intuitive dashboard to help you find insights faster.",
    category: "dashboard"
  },
  {
    id: "recurring-tasks",
    date: "Apr 30, 2024",
    title: "Add recurring tasks",
    description:
      "Set tasks to repeat daily, weekly, or monthly with custom intervals.",
    category: "automation"
  },
  {
    id: "export-pdf",
    date: "Apr 22, 2024",
    title: "Export task to PDF",
    description: "Export any task or task list directly to a PDF file.",
    category: "dashboard"
  },
  {
    id: "keyboard-shortcuts",
    date: "Apr 10, 2024",
    title: "Add keyboard shortcuts",
    description: "Speed up your workflow with new keyboard shortcuts.",
    category: "other"
  }
];

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  dashboard: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200"
  },
  collaboration: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200"
  },
  automation: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200"
  },
  integrations: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-200"
  },
  other: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" }
};

function getCategoryLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      className="w-full h-auto max-w-[320px]"
    >
      <ellipse cx="220" cy="120" rx="90" ry="70" fill="#ebf1fd" opacity="0.6" />
      <ellipse cx="80" cy="170" rx="50" ry="35" fill="#f3e8ff" opacity="0.5" />
      {/* Megaphone */}
      <g transform="translate(180, 60)">
        <path d="M10 40 L50 20 L50 60 L10 40Z" fill="#8b5cf6" />
        <rect x="50" y="25" width="20" height="30" rx="4" fill="#a78bfa" />
        <circle cx="75" cy="40" r="8" fill="#c4b5fd" />
        <rect x="8" y="35" width="6" height="14" rx="3" fill="#7c3aed" />
        <path
          d="M5 50 Q0 60 5 70"
          stroke="#7c3aed"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      {/* Document / Checklist */}
      <g transform="translate(60, 40)">
        <rect
          x="0"
          y="0"
          width="70"
          height="90"
          rx="8"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <rect x="10" y="14" width="35" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="10" y="24" width="25" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="10" y="34" width="30" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="10" y="44" width="20" height="3" rx="1.5" fill="#d1d5db" />
        <circle cx="55" cy="16" r="5" fill="#227bfe" />
        <path
          d="M52 16 L54.5 18.5 L58 13"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="55" cy="36" r="5" fill="#227bfe" />
        <path
          d="M52 36 L54.5 38.5 L58 33"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* Decorative elements */}
      <circle cx="150" cy="30" r="4" fill="#c9dbff" />
      <circle cx="290" cy="50" r="3" fill="#d6bffe" />
      <circle cx="40" cy="80" r="5" fill="#c9dbff" opacity="0.6" />
      {/* Paper plane */}
      <g transform="translate(260, 20) rotate(15)">
        <path d="M0 20 L25 0 L20 20 L25 40 L0 20Z" fill="#a78bfa" />
        <path d="M0 20 L25 0 L15 18 L0 20Z" fill="#c4b5fd" />
      </g>
      {/* Dashed line */}
      <path
        d="M280 40 Q260 80 240 100"
        stroke="#c4b5fd"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
      />
    </svg>
  );
}

export default function ChangelogClient({
  locale = "en"
}: {
  locale?: Locale;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("bulk-edit");
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredEntries = useMemo(() => {
    let result = ENTRIES;
    if (activeCategory !== "all") {
      result = result.filter((e) => e.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .float { animation: float 4s ease-in-out infinite; }
        .changelog-entry { animation: fadeUp 0.5s ease both; }
        .changelog-entry:nth-child(1) { animation-delay: 0ms; }
        .changelog-entry:nth-child(2) { animation-delay: 80ms; }
        .changelog-entry:nth-child(3) { animation-delay: 160ms; }
        .changelog-entry:nth-child(4) { animation-delay: 240ms; }
        .changelog-entry:nth-child(5) { animation-delay: 320ms; }
      `}</style>

      <div className="min-h-screen bg-[#f7f7fb]">
        <Navbar locale={locale} />

        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-8">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold text-[#060718] mb-3">
                Changelog
              </h1>
              <p className="text-base text-gray-500 max-w-md">
                Stay up to date with the latest new features and improvements
                we&apos;ve shipped.
              </p>
            </div>
            <div className="shrink-0 hidden sm:block float">
              <HeroIllustration />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-16 flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="sticky top-28 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search new features..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#227bfe]/20 focus:border-[#227bfe] transition-all"
                />
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl border border-gray-100 p-2">
                <div className="flex flex-col gap-0.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                          isActive
                            ? "bg-[#ebf1fd] text-[#227bfe] font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span
                            className={
                              isActive ? "text-[#227bfe]" : "text-gray-400"
                            }
                          >
                            {cat.icon}
                          </span>
                          {cat.label}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-[#227bfe] text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subscribe card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <div className="w-10 h-10 rounded-full bg-[#ebf1fd] flex items-center justify-center mx-auto mb-3">
                  <Bell size={18} className="text-[#227bfe]" />
                </div>
                <h4 className="text-sm font-semibold text-[#060718] mb-1">
                  Never miss a new feature
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Get notified when we release something new.
                </p>
                <button className="w-full text-sm font-medium text-[#227bfe] bg-[#ebf1fd] border border-[#d6e4ff] rounded-lg px-4 py-2 hover:bg-[#dce7fc] transition-colors">
                  Subscribe to updates
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#ebf1fd] text-[#227bfe] text-xs font-bold">
                  Latest
                </span>
              </div>
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar size={16} />
                  All time
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Entries */}
            <div className="space-y-0">
              {filteredEntries.map((entry, idx) => {
                const isExpanded = expandedId === entry.id;
                const catStyle =
                  CATEGORY_COLORS[entry.category] ?? CATEGORY_COLORS.other;
                const isFirst = idx === 0;

                return (
                  <div
                    key={entry.id}
                    className="changelog-entry bg-white border border-gray-100 first:rounded-t-2xl last:rounded-b-2xl first:mb-4 last:mb-4 mb-4 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleExpanded(entry.id)}
                      className="w-full text-left p-6 flex items-start gap-5 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className="relative flex flex-col items-center pt-1 shrink-0">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${isFirst ? "bg-[#8b5cf6]" : "bg-[#227bfe]"} ring-4 ring-white`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs text-gray-400 font-medium">
                            {entry.date}
                          </span>
                          {entry.isLatest && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#ebf1fd] text-[#227bfe] text-[10px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#060718] mb-1">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {entry.description}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {getCategoryLabel(entry.category)}
                        </span>
                      </div>

                      {/* Thumbnail / Chevron */}
                      <div className="shrink-0 flex flex-col items-end gap-3">
                        {isFirst ? (
                          <div className="w-28 h-20 bg-gray-100 rounded-xl border border-gray-100 flex items-center justify-center">
                            <div className="w-16 h-12 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="w-28 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                            {entry.category === "dashboard" && (
                              <div className="flex flex-col gap-1.5">
                                <div className="w-12 h-1.5 bg-purple-200 rounded-full" />
                                <div className="w-8 h-1.5 bg-purple-200 rounded-full" />
                                <div className="w-10 h-1.5 bg-purple-200 rounded-full" />
                              </div>
                            )}
                            {entry.category === "automation" && (
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Clock size={16} className="text-emerald-500" />
                              </div>
                            )}
                            {entry.category === "other" && (
                              <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-500">
                                  ⌘
                                </div>
                                <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-500">
                                  K
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-gray-400">
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pl-13">
                        {/* What's new */}
                        {entry.whatsNew && entry.whatsNew.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-bold text-[#060718] mb-3 flex items-center gap-2">
                              <CheckCircle2
                                size={16}
                                className="text-emerald-500"
                              />
                              What&apos;s new?
                            </h4>
                            <ul className="space-y-2">
                              {entry.whatsNew.map((item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-600"
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="text-emerald-500 mt-0.5 shrink-0"
                                  />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Screenshots */}
                        {entry.screenshots && (
                          <div className="mb-6">
                            <h4 className="text-sm font-bold text-[#060718] mb-3">
                              Screenshots
                            </h4>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-40 h-28 bg-gray-100 rounded-xl border border-gray-100 shrink-0 flex items-center justify-center"
                                >
                                  <div className="w-32 h-20 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col gap-1.5 p-2">
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                                    <div className="w-3/4 h-1.5 bg-gray-100 rounded-full" />
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                                    <div className="w-1/2 h-1.5 bg-gray-100 rounded-full" />
                                  </div>
                                </div>
                              ))}
                              {entry.screenshots.count &&
                                entry.screenshots.count > 3 && (
                                  <div className="w-24 h-28 bg-[#ebf1fd] rounded-xl border border-[#d6e4ff] shrink-0 flex items-center justify-center">
                                    <span className="text-sm font-bold text-[#227bfe]">
                                      +{entry.screenshots.count - 3} more
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}

                        {/* Demo Video */}
                        {entry.demoVideo && (
                          <div>
                            <h4 className="text-sm font-bold text-[#060718] mb-3">
                              Demo Video
                            </h4>
                            <div className="w-full h-48 bg-linear-to-r from-[#7c3aed] to-[#a78bfa] rounded-2xl flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                                  <Play
                                    size={24}
                                    className="text-[#7c3aed] ml-1"
                                    fill="#7c3aed"
                                  />
                                </button>
                              </div>
                              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">
                                      P
                                    </span>
                                  </div>
                                  <span className="text-xs text-white/90 font-medium">
                                    {entry.demoVideo.title}
                                  </span>
                                </div>
                                <span className="text-xs text-white/70 font-medium">
                                  {entry.demoVideo.duration}
                                </span>
                              </div>
                              {/* Progress bar */}
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                <div className="w-1/4 h-full bg-white/60" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* View older updates */}
            <div className="flex justify-center mt-4">
              <button className="flex items-center gap-2 text-sm font-medium text-[#227bfe] hover:text-[#1d6fea] transition-colors">
                View older updates
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="h-8" />
          </main>
        </div>

        <Footer locale={locale} />
      </div>
    </>
  );
}
