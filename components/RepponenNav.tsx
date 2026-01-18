"use client";

const links = [
  { href: "#concept", label: "Concept" },
  { href: "#team", label: "Team" },
];

export default function RepponenNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1b3a2a] bg-[#040906]/80 backdrop-blur-md shadow-[0_0_24px_rgba(120,255,190,0.12)]">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
        <div className="font-serif text-xl tracking-tight text-foreground/90">Optical Neural Network</div>
        <nav className="hidden md:flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70">
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
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/50">Team 7</span>
      </div>
    </header>
  );
}
