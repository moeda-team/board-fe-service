"use client";

import { Navbar, FAQ, Footer } from "../home";
import type { NavItem } from "../home";

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "/#product" },
  { label: "Solutions", href: "/#solutions" },
  { label: "Resources", href: "/#resources" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
];

export default function FaqClient() {
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        html { scroll-behavior: smooth; }
        .hc { transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s ease; }
        .hc:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.11); }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:#111; transition:width .2s; }
        .nav-link:hover::after { width:100%; }
        .reveal-up { opacity:0; transform:translateY(32px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .revealed { opacity:1 !important; transform:none !important; }
        .stagger-1 { transition-delay: 0ms !important; }
        .stagger-2 { transition-delay: 80ms !important; }
        .stagger-3 { transition-delay: 160ms !important; }
      `}</style>

      <Navbar navItems={NAV_ITEMS} />
      <FAQ standalone />
      <Footer />
    </>
  );
}
