"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#approach", label: "Approach" },
  { href: "#proof", label: "Proof" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#team", label: "Team" },
];

export default function SiteHeader() {
  const [Clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeLabel = Clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="sticky top-0 z-40 border-b border-lab-gray/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex flex-col leading-tight">
          <span className="font-serif text-lg tracking-tight">Optical Neural Network</span>
          <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/60">Team 7 · McMaster University</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.4em]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-2 py-2 hover:text-lab-accent transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="text-right font-mono text-[11px] text-foreground/60">
          <p>Feasibility 2026</p>
          <p>{timeLabel} EST</p>
        </div>
      </div>
    </header>
  );
}
