import { ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
}

export default function Section({ id, eyebrow, title, summary, children }: SectionProps) {
  return (
    <section id={id} className="px-4 py-16 border-t border-foreground/10 bg-white/60">
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-foreground/50 mb-2">{eyebrow}</p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{title}</h2>
          <p className="font-mono text-sm text-foreground/70 leading-relaxed">{summary}</p>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </section>
  );
}
