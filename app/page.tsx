"use client";

import { useEffect, useState } from "react";
import { Navbar, Hero, Product, Solutions, Resources, Testimonials, FinalCTA, Footer, FAQ } from "./home";
import type { NavItem } from "./home";

const NAV_ITEMS: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Resources", href: "#resources" },
  { label: "Pricing", href: "/pricing" },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        html { scroll-behavior: smooth; }
        .hc { transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s ease; }
        .hc:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.11); }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1.5px; background:#111; transition:width .2s; }
        .nav-link:hover::after { width:100%; }
        .float { animation: float 4s ease-in-out infinite; }
        .float-slow { animation: float 6s ease-in-out infinite; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .reveal-left { opacity:0; transform:translateX(-40px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal-right { opacity:0; transform:translateX(40px); transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .reveal-up { opacity:0; transform:translateY(32px); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .reveal-scale { opacity:0; transform:scale(0.93); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .revealed { opacity:1 !important; transform:none !important; }
        .stagger-1 { transition-delay: 0ms !important; }
        .stagger-2 { transition-delay: 80ms !important; }
        .stagger-3 { transition-delay: 160ms !important; }
        .stagger-4 { transition-delay: 240ms !important; }
        .btn-shine { position:relative; overflow:hidden; }
        .btn-shine::after { content:''; position:absolute; top:0; left:-100%; width:60%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transition:left 0.5s ease; }
        .btn-shine:hover::after { left:140%; }
      `}</style>

      <Navbar scrolled={scrolled} navItems={NAV_ITEMS} />
      <Hero />
      <Product />
      <Solutions />
      <Resources />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
