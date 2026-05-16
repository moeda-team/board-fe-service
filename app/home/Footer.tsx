"use client";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-8 px-8 text-center text-xs text-gray-400">
      © {new Date().getFullYear()} ChronoTask · Built for high-performance teams
    </footer>
  );
}
