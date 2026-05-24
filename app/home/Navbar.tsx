"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { anim } from "./hooks";
import type { NavItem } from "./types";

interface NavbarProps {
  navItems: NavItem[];
}

export function Navbar({ navItems }: NavbarProps) {
  // Initialise from current scrollY so hash-links load with the correct style
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 20);
    check(); // run immediately on mount
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300"
      style={{
        backdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(8px)",
        background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.08)"
          : "1px solid rgba(255,255,255,0.3)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <nav
        className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto"
        style={anim("0ms")}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/papanclip_logo.png"
            alt="Papanclip"
            width={200}
            height={60}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>

        <div
          className="hidden md:flex items-center gap-7 text-sm font-medium transition-colors"
          style={{ color: "#374151" }}
        >
          {navItems.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="nav-link hover:text-gray-900 transition-colors"
            >
              {n.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
