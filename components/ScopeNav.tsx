"use client";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#approach", label: "Approach" },
  { href: "#proof", label: "Proof" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#team", label: "Team" },
];

export default function ScopeNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-lab-gray/70 bg-background/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex flex-col leading-tight">
          <span className="font-mono text-[11px] uppercase tracking-[0.5em] text-lab-accent">Team 7</span>
          <span className="font-serif text-2xl text-foreground">Optical Neural Network</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.4em] text-foreground/70">
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
      </div>
    </header>
  );
}
