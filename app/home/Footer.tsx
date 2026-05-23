"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-8 px-8 text-center text-xs text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/assets/papanclip_logo.png"
          alt="Papanclip"
          width={120}
          height={36}
          className="opacity-60 brightness-0 invert"
        />
        <span>© {new Date().getFullYear()} Papanclip · Built for high-performance teams</span>
      </div>
    </footer>
  );
}
