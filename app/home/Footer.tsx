"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-8 px-8 text-center text-xs text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/assets/papanclip_logo.png"
          alt="PapanClip — software manajemen proyek dan tugas"
          width={120}
          height={36}
          className="opacity-60 brightness-0 invert"
        />
        <p className="max-w-2xl text-balance leading-relaxed text-gray-500">
          PapanClip adalah software manajemen proyek dan aplikasi manajemen
          tugas untuk tim agile. Kelola proyek, tugas, sprint, dan workflow
          pengembangan software dalam satu platform — bantu tim merencanakan,
          melacak, dan menyelesaikan proyek lebih cepat. Alternatif Jira,
          ClickUp, dan Trello untuk tim developer di Indonesia.
        </p>
        <span>© {new Date().getFullYear()} PapanClip · Built for high-performance teams</span>
      </div>
    </footer>
  );
}
