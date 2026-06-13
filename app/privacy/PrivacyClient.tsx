"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Printer, Search, Shield } from "lucide-react";
import { Navbar } from "../home";
import { Footer } from "../home";
import type { Locale } from "../home";
import type { PrivacyBlock, PrivacyDocument } from "./parse";

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      className="w-full h-auto max-w-[320px]"
    >
      {/* Background blob */}
      <ellipse cx="220" cy="120" rx="90" ry="70" fill="#ebf1fd" opacity="0.6" />
      <ellipse cx="80" cy="170" rx="50" ry="35" fill="#f3e8ff" opacity="0.5" />
      {/* Plant left */}
      <g transform="translate(40, 120)">
        <path
          d="M20 70 Q15 50 5 40"
          stroke="#22c55e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M20 70 Q25 45 35 35"
          stroke="#22c55e"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M20 70 Q18 55 12 48"
          stroke="#22c55e"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <ellipse
          cx="5"
          cy="38"
          rx="6"
          ry="10"
          fill="#22c55e"
          transform="rotate(-20 5 38)"
        />
        <ellipse
          cx="35"
          cy="33"
          rx="6"
          ry="10"
          fill="#4ade80"
          transform="rotate(20 35 33)"
        />
        <ellipse
          cx="12"
          cy="46"
          rx="5"
          ry="8"
          fill="#16a34a"
          transform="rotate(-10 12 46)"
        />
        <rect x="14" y="68" width="12" height="14" rx="3" fill="#d97706" />
      </g>
      {/* Checklist right */}
      <g transform="translate(240, 60)">
        <rect
          x="0"
          y="0"
          width="56"
          height="70"
          rx="8"
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1.5"
        />
        <rect x="8" y="12" width="28" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="8" y="22" width="20" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="8" y="32" width="24" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="8" y="42" width="18" height="3" rx="1.5" fill="#d1d5db" />
        <rect x="8" y="52" width="22" height="3" rx="1.5" fill="#d1d5db" />
        <circle cx="42" cy="14" r="5" fill="#227bfe" />
        <path
          d="M39 14 L41.5 16.5 L45 11"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="34" r="5" fill="#227bfe" />
        <path
          d="M39 34 L41.5 36.5 L45 31"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="54" r="5" fill="#227bfe" />
        <path
          d="M39 54 L41.5 56.5 L45 51"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* Shield center */}
      <g transform="translate(120, 50)">
        <path
          d="M40 8 C65 8 85 20 85 40 C85 72 65 88 40 98 C15 88 -5 72 -5 40 C-5 20 15 8 40 8Z"
          fill="#227bfe"
        />
        <path
          d="M40 15 C60 15 76 25 76 42 C76 68 60 80 40 88 C20 80 4 68 4 42 C4 25 20 15 40 15Z"
          fill="#1d6fea"
        />
        {/* Lock body */}
        <rect x="26" y="42" width="28" height="24" rx="4" fill="white" />
        {/* Lock shackle */}
        <path
          d="M32 42 V34 C32 27 36 22 40 22 C44 22 48 27 48 34 V42"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Keyhole */}
        <circle cx="40" cy="52" r="3" fill="#227bfe" />
        <rect x="38" y="52" width="4" height="7" rx="2" fill="#227bfe" />
      </g>
      {/* Decorative dots */}
      <circle cx="100" cy="40" r="4" fill="#c9dbff" />
      <circle cx="280" cy="30" r="3" fill="#d6bffe" />
      <circle cx="300" cy="140" r="5" fill="#c9dbff" opacity="0.6" />
      <circle cx="60" cy="100" r="3" fill="#d6bffe" opacity="0.5" />
    </svg>
  );
}

export default function PrivacyClient({
  document,
  locale = "en"
}: {
  document: PrivacyDocument;
  locale?: Locale;
}) {
  const sections = document.sections;
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tocNavRef = useRef<HTMLElement | null>(null);

  const tocItems = useMemo(
    () =>
      sections.map((s) => ({
        id: s.id,
        number: s.number,
        title: s.title
      })),
    [sections]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-section-id") || "";
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = tocRefs.current[activeId];
    const container = tocNavRef.current;
    if (!el || !container) return;
    // Scroll only within the TOC container, never the page, otherwise the
    // window scroll fights the user's manual scrolling.
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    const viewTop = container.scrollTop;
    const viewBottom = viewTop + container.clientHeight;
    if (elTop < viewTop) {
      container.scrollTo({ top: elTop, behavior: "smooth" });
    } else if (elBottom > viewBottom) {
      container.scrollTo({
        top: elBottom - container.clientHeight,
        behavior: "smooth"
      });
    }
  }, [activeId]);

  const handleTocClick = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    const testRe = new RegExp(`^${escaped}$`, "i");
    return parts.map((part, i) =>
      testRe.test(part) ? (
        <mark key={i} className="bg-yellow-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const blockText = (block: PrivacyBlock) =>
    block.type === "list" ? block.items.join(" ") : block.text;

  const sectionMatchesSearch = (
    section: PrivacyDocument["sections"][number]
  ) => {
    if (!searchQuery.trim()) return true;
    const haystack = (
      section.title +
      " " +
      section.blocks.map(blockText).join(" ")
    ).toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  };

  const renderBlock = (block: PrivacyBlock, index: number) => {
    if (block.type === "heading") {
      return (
        <p key={index} className="font-semibold text-[#060718] mt-4 mb-2">
          {highlightText(block.text, searchQuery)}
        </p>
      );
    }
    if (block.type === "list") {
      return (
        <ul key={index} className="list-disc pl-5 mb-3">
          {block.items.map((item, j) => (
            <li key={j} className="text-sm text-gray-600">
              {highlightText(item, searchQuery)}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{highlightText(block.text, searchQuery)}</p>;
  };

  return (
    <>
      <style>{`
        @media print {
          .privacy-no-print { display: none !important; }
          .privacy-print-full { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .privacy-sidebar { display: none !important; }
          body { background: white !important; }
        }
        .privacy-section p { margin-bottom: 0.75rem; line-height: 1.65; }
        .privacy-section ul { list-style: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .privacy-section ul li { margin-bottom: 0.35rem; line-height: 1.55; }
      `}</style>

      <div className="min-h-screen bg-[#f7f7fb]">
        <div className="privacy-no-print">
          <Navbar locale={locale} />
        </div>

        {/* Content top bar (search + print) */}
        <div className="privacy-no-print max-w-7xl mx-auto px-6 pt-28 pb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ebf1fd] flex items-center justify-center">
              <Shield size={18} className="text-[#227bfe]" />
            </div>
            <span className="text-sm font-semibold text-[#060718]">
              Privacy Policy
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-white w-48 focus:outline-none focus:ring-2 focus:ring-[#227bfe]/20 focus:border-[#227bfe] transition-all"
              />
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-8 flex gap-8">
          {/* Sidebar */}
          <aside className="privacy-sidebar privacy-no-print w-64 shrink-0 hidden lg:block bg-white rounded-2xl border border-gray-100 p-5 h-fit">
            <div className="sticky top-28">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                On this page
              </h3>
              <nav
                ref={tocNavRef}
                className="flex flex-col gap-0.5 max-h-[calc(100vh-12rem)] overflow-y-auto"
              >
                {tocItems.map((item) => {
                  const isActive = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        tocRefs.current[item.id] = el;
                      }}
                      onClick={() => handleTocClick(item.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        isActive
                          ? "bg-[#ebf1fd] text-[#227bfe] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isActive
                            ? "bg-[#227bfe] text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.number}
                      </span>
                      <span className="leading-snug">{item.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 relative overflow-hidden">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-[#060718] mb-2">
                    {document.title}
                  </h1>
                  {document.subtitle && (
                    <p className="text-base text-gray-500 mb-4">
                      {document.subtitle}
                    </p>
                  )}
                  {document.lastUpdated && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600">
                      <Calendar size={15} className="text-gray-400" />
                      Last Updated: {document.lastUpdated}
                    </div>
                  )}
                </div>
                <div className="shrink-0 hidden sm:block">
                  <HeroIllustration />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((section) => {
                if (searchQuery && !sectionMatchesSearch(section)) return null;

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    data-section-id={section.id}
                    ref={(el) => {
                      sectionRefs.current[section.id] = el;
                    }}
                    className="bg-white rounded-2xl border border-gray-100 p-8 privacy-section scroll-mt-40"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-[#227bfe] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {section.number}
                      </div>
                      <h2 className="text-xl font-bold text-[#060718]">
                        {section.title}
                      </h2>
                    </div>

                    <div className="text-sm text-gray-600 leading-relaxed">
                      {section.blocks.map((block, i) => renderBlock(block, i))}
                    </div>
                  </section>
                );
              })}

              {/* Closing statement */}
              {document.closing && (
                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                  <p className="text-sm text-gray-600 text-center">
                    {document.closing}
                  </p>
                </div>
              )}
            </div>

            {/* Footer spacing */}
            <div className="h-16" />
          </main>
        </div>
        <div className="privacy-no-print">
          <Footer locale={locale} />
        </div>
      </div>
    </>
  );
}
