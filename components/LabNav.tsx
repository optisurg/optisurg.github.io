"use client";

import BinaryLogo from "@/components/BinaryLogo";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#approach", label: "Approach" },
  { href: "#proof", label: "Proof" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#team", label: "Team" },
];

export default function LabNav() {
  return (
    <div className="sticky top-0 z-30 border-b border-foreground/15 bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <BinaryLogo />
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-foreground/60">ONN</span>
            <span className="font-serif text-lg">Optical Neural Network</span>
          </div>
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
        <div className="font-mono text-[11px] text-foreground/60">Team 7 · 2026</div>
      </div>
    </div>
  );
}
