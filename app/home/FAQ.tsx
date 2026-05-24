"use client";

import { useState } from "react";
import { useReveal } from "./hooks";

const FAQS = [
  {
    category: "Umum",
    items: [
      {
        q: "Gimana cara coba gratis Papanclip?",
        a: "Saat ini Papanclip masih dalam fase Beta Testing, jadi kamu bisa akses dan coba semua fitur secara gratis. Tinggal buka website Papanclip dan langsung mulai pakai tanpa ribet.",
      },
      {
        q: "Fitur apa saja yang ada di Papanclip?",
        a: "Papanclip menyediakan fitur task management, board sprint, monitoring progress, collaboration team, AI summary, attachment file, dan berbagai fitur productivity lainnya yang terus dikembangkan berdasarkan feedback user.",
      },
      {
        q: "Apakah Papanclip bisa dipakai untuk banyak project dan user?",
        a: "Bisa. Papanclip dirancang untuk kebutuhan tim dan perusahaan dengan jumlah project maupun user yang fleksibel tanpa batasan penggunaan normal.",
      },
      {
        q: "Apakah Papanclip bisa dipakai di mobile?",
        a: "Bisa. Papanclip dapat diakses melalui browser di desktop maupun mobile sehingga tetap nyaman digunakan di mana saja.",
      },
    ],
  },
  {
    category: "Storage & Data",
    items: [
      {
        q: "Apakah ada batas upload storage?",
        a: "Maksimal ukuran upload per file adalah 50 MB. Untuk total penyimpanan saat ini masih unlimited untuk penggunaan normal pekerjaan dan tidak disalahgunakan.",
      },
      {
        q: "Sampai kapan data saya tersimpan di Papanclip?",
        a: "Selama subscription Papanclip kamu masih aktif, data perusahaan akan tetap tersimpan dengan aman. Jika berhenti berlangganan, data masih akan disimpan selama 3 bulan sebelum dihapus permanen.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "Kalau ada kendala bisa tanya ke mana?",
        a: "Kamu bisa hubungi tim support Papanclip via email: support.papanclip@gmail.com",
      },
      {
        q: "Support Papanclip tersedia jam berapa?",
        a: "Tim support Papanclip siap membantu 24 jam.",
      },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FAQProps {
  standalone?: boolean;
}

export function FAQ({ standalone = false }: FAQProps) {
  const reveal = useReveal();
  const [open, setOpen] = useState<string | null>("0-0");

  const toggle = (key: string) => setOpen((prev) => (prev === key ? null : key));

  return (
    <section
      id="faq"
      className={`bg-white px-6 ${standalone ? "py-12 pt-28 min-h-screen" : "py-24"}`}
    >
      <div ref={reveal.ref} className="max-w-3xl mx-auto w-full">

        {/* Header */}
        <div className={`text-center mb-14 reveal-up ${reveal.visible ? "revealed" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">FAQ</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
            Pertanyaan yang sering ditanyakan.
          </h2>
          <p className="text-gray-500 mt-4 max-w-md mx-auto">
            Tidak menemukan jawaban yang kamu cari?{" "}
            <a href="mailto:support.papanclip@gmail.com" className="text-blue-500 hover:underline">
              Hubungi kami
            </a>
            .
          </p>
        </div>

        {/* Accordion by category */}
        <div className={`space-y-10 reveal-up stagger-2 ${reveal.visible ? "revealed" : ""}`}>
          {FAQS.map((group, gi) => (
            <div key={group.category}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
                {group.category}
              </p>
              <div className="space-y-2">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  const isOpen = open === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-xl border transition-colors duration-200 ${
                        isOpen ? "border-gray-200 bg-gray-50" : "border-gray-100 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className={`text-sm font-semibold ${isOpen ? "text-gray-900" : "text-gray-700"}`}>
                          {item.q}
                        </span>
                        <ChevronIcon open={isOpen} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className={`mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900 rounded-2xl px-8 py-6 reveal-up stagger-3 ${reveal.visible ? "revealed" : ""}`}>
          <div>
            <p className="font-semibold text-white">Masih ada pertanyaan?</p>
            <p className="text-sm text-gray-400 mt-0.5">Tim kami siap membantu kamu 24 jam.</p>
          </div>
          <a
            href="mailto:support.papanclip@gmail.com"
            className="shrink-0 text-sm font-semibold bg-white text-gray-900 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Hubungi support
          </a>
        </div>

      </div>
    </section>
  );
}
