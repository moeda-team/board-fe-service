"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navbar, Footer } from "../home";
import type { Locale } from "../home";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell,
  Loader2,
  AlertCircle,
  ImageIcon
} from "lucide-react";
import { useChangelogs } from "@/hooks/api/useChangelogs";
import type { Changelog } from "@/types/type-changelogs";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function isImageAttachment(att: { fileType: string }) {
  return att.fileType.startsWith("image/");
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<
    "all" | "this-month" | "last-3-months" | "this-year"
  >("all");
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const { data: changelogs = [], isLoading, isError } = useChangelogs();

  const getDateRangeBounds = useCallback((range: typeof dateRange) => {
    const now = new Date();
    switch (range) {
      case "this-month": {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end: now };
      }
      case "last-3-months": {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        return { start, end: now };
      }
      case "this-year": {
        const start = new Date(now.getFullYear(), 0, 1);
        return { start, end: now };
      }
      default:
        return null;
    }
  }, []);

  const dateRangeLabel = useMemo(() => {
    switch (dateRange) {
      case "this-month":
        return "This month";
      case "last-3-months":
        return "Last 3 months";
      case "this-year":
        return "This year";
      default:
        return "All time";
    }
  }, [dateRange]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dateDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(e.target as Node)
      ) {
        setDateDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dateDropdownOpen]);

  const filteredEntries = useMemo(() => {
    let result = changelogs;
    // Date range filter
    const bounds = getDateRangeBounds(dateRange);
    if (bounds) {
      result = result.filter((e: Changelog) => {
        const d = new Date(e.releaseDate ?? e.createdAt);
        return d >= bounds.start && d <= bounds.end;
      });
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "");
      result = result.filter(
        (e: Changelog) =>
          e.title.toLowerCase().includes(q) ||
          stripHtml(e.content).toLowerCase().includes(q) ||
          (e.menu && e.menu.toLowerCase().includes(q))
      );
    }
    return result;
  }, [changelogs, searchQuery, dateRange, getDateRangeBounds]);

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
        /* Rich HTML content styles */
        .changelog-content b, .changelog-content strong { font-weight: 700; }
        .changelog-content i, .changelog-content em { font-style: italic; }
        .changelog-content u { text-decoration: underline; }
        .changelog-content s, .changelog-content strike, .changelog-content del { text-decoration: line-through; }
        .changelog-content br { display: block; content: ""; margin-top: 0.25em; }
        .changelog-content p { margin: 0.5em 0; }
        .changelog-content ul { list-style: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .changelog-content ol { list-style: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .changelog-content li { margin: 0.2em 0; }
        .changelog-content li > ul, .changelog-content li > ol { margin: 0.15em 0; }
        .changelog-content blockquote { border-left: 3px solid #d1d5db; padding-left: 1em; color: #6b7280; margin: 0.75em 0; font-style: italic; }
        .changelog-content a { color: #227bfe; text-decoration: underline; }
        .changelog-content a:hover { color: #1a65d6; }
        .changelog-content h1 { font-size: 1.25em; font-weight: 700; margin: 0.75em 0 0.25em; }
        .changelog-content h2 { font-size: 1.125em; font-weight: 700; margin: 0.75em 0 0.25em; }
        .changelog-content h3 { font-size: 1em; font-weight: 600; margin: 0.5em 0 0.25em; }
        .changelog-content code { background: #f1f5f9; padding: 0.15em 0.35em; border-radius: 0.25em; font-size: 0.9em; }
        .changelog-content pre { background: #f1f5f9; padding: 0.75em 1em; border-radius: 0.5em; overflow-x: auto; margin: 0.75em 0; }
        .changelog-content pre code { background: none; padding: 0; }
        .changelog-content hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }
        .changelog-content img { max-width: 100%; border-radius: 0.5em; margin: 0.5em 0; }
        .changelog-content table { border-collapse: collapse; width: 100%; margin: 0.75em 0; }
        .changelog-content th, .changelog-content td { border: 1px solid #e5e7eb; padding: 0.4em 0.75em; text-align: left; }
        .changelog-content th { background: #f8fafc; font-weight: 600; }
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
              <div className="relative" ref={dateDropdownRef}>
                <button
                  onClick={() => setDateDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} />
                  {dateRangeLabel}
                  <ChevronDown
                    size={14}
                    className={
                      "transition-transform " +
                      (dateDropdownOpen ? "rotate-180" : "")
                    }
                  />
                </button>
                {dateDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 z-10 w-44 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
                    {(
                      [
                        ["all", "All time"],
                        ["this-month", "This month"],
                        ["last-3-months", "Last 3 months"],
                        ["this-year", "This year"]
                      ] as const
                    ).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDateRange(key);
                          setDateDropdownOpen(false);
                        }}
                        className={
                          "w-full text-left px-3 py-2 text-sm transition-colors " +
                          (dateRange === key
                            ? "bg-[#ebf1fd] text-[#227bfe] font-semibold"
                            : "text-gray-600 hover:bg-gray-50")
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 size={32} className="animate-spin mb-3" />
                <span className="text-sm">Loading changelogs…</span>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="flex flex-col items-center justify-center py-20 text-red-400">
                <AlertCircle size={32} className="mb-3" />
                <span className="text-sm">Failed to load changelogs.</span>
              </div>
            )}

            {/* Entries */}
            {!isLoading && !isError && (
              <div className="space-y-0">
                {filteredEntries.map((entry: Changelog, idx: number) => {
                  const isExpanded = expandedId === entry.id;
                  const isFirst = idx === 0;
                  const images = entry.attachments.filter(isImageAttachment);

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
                            className={
                              "w-2.5 h-2.5 rounded-full " +
                              (isFirst ? "bg-[#8b5cf6]" : "bg-[#227bfe]") +
                              " ring-4 ring-white"
                            }
                          ></div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {entry.version && (
                              <span className="text-xs text-gray-400 font-medium">
                                v{entry.version}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-medium">
                              {formatDate(entry.releaseDate)}
                            </span>
                            {isFirst && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#ebf1fd] text-[#227bfe] text-[10px] font-bold">
                                NEW
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-[#060718] mb-1">
                            {entry.title}
                          </h3>
                          {entry.menu && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-50 text-purple-600 text-[10px] font-bold mr-1.5">
                              {entry.menu}
                            </span>
                          )}
                          <span
                            className="changelog-content text-sm text-gray-500 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                          />
                        </div>

                        {/* Thumbnail / Chevron */}
                        <div className="shrink-0 flex flex-col items-end gap-3">
                          {images.length > 0 ? (
                            <div className="w-28 h-20 rounded-xl border border-gray-100 overflow-hidden">
                              <img
                                src={images[0].fileUrl}
                                alt={images[0].fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-28 h-20 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                              <ImageIcon size={20} className="text-gray-300" />
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
                          {/* Content detail */}
                          <div className="mb-6 changelog-content text-sm text-gray-700 leading-relaxed max-w-none">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: entry.content
                              }}
                            />
                          </div>

                          {/* Highlights */}
                          {entry.highlights && entry.highlights.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-bold text-[#060718] mb-3">
                                Highlights
                              </h4>
                              <ul className="space-y-1.5">
                                {entry.highlights.map((h, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-gray-600"
                                  >
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#227bfe] shrink-0" />
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* YouTube video */}
                          {entry.youtubeUrl &&
                            (() => {
                              const ytId = entry.youtubeUrl.match(
                                /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
                              )?.[1];
                              return ytId ? (
                                <div className="mb-6">
                                  <h4 className="text-sm font-bold text-[#060718] mb-3">
                                    Demo Video
                                  </h4>
                                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100">
                                    <iframe
                                      src={
                                        "https://www.youtube.com/embed/" + ytId
                                      }
                                      title="Demo video"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      className="absolute inset-0 w-full h-full"
                                    />
                                  </div>
                                </div>
                              ) : null;
                            })()}

                          {/* Attachments / Screenshots */}
                          {images.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-bold text-[#060718] mb-3">
                                Screenshots
                              </h4>
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {images.map((att) => (
                                  <a
                                    key={att.id}
                                    href={att.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0"
                                  >
                                    <img
                                      src={att.fileUrl}
                                      alt={att.fileName}
                                      className="w-40 h-28 rounded-xl border border-gray-100 object-cover hover:opacity-90 transition-opacity"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Creator info */}
                          {entry.creator && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {entry.creator.avatarUrl && (
                                <img
                                  src={entry.creator.avatarUrl}
                                  alt={entry.creator.fullName}
                                  className="w-5 h-5 rounded-full"
                                />
                              )}
                              <span>{entry.creator.fullName}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredEntries.length === 0 && (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No changelogs found.
                  </div>
                )}
              </div>
            )}

            <div className="h-8" />
          </main>
        </div>

        <Footer locale={locale} />
      </div>
    </>
  );
}
