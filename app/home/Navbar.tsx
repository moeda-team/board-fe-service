"use client";

import Link from "next/link";
import { anim } from "./hooks";
import type { NavItem } from "./types";

interface NavbarProps {
  scrolled: boolean;
  navItems: NavItem[];
}

export function Navbar({ scrolled, navItems }: NavbarProps) {
  return (
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
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="5" cy="5" r="4" fill="#53A3FF" />
            <circle cx="15" cy="5" r="4" fill="#14100A" />
            <circle cx="5" cy="15" r="4" fill="#14100A" />
            <circle cx="15" cy="15" r="4" fill="#14100A" />
          </svg>
          ChronoTask
        </Link>
        <div
          className="hidden md:flex items-center gap-7 text-sm font-medium transition-colors"
          style={{ color: scrolled ? "#374151" : "#4b5563" }}
        >
          {navItems.map((n) => (
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
  );
}
