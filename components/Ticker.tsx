"use client";

import { useState } from "react";

const copy = "Optical Neural Network · Team 7 · Feasibility · 4f Systems · Simulation-Driven Hardware · Energy-Efficient AI · Real-time Surgical Imaging ·";

export default function Ticker() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-foreground/15 bg-background/90 backdrop-blur">
      <div className="relative h-10 overflow-hidden flex items-center">
        <div
          className={`absolute inset-0 whitespace-nowrap font-mono text-xs tracking-[0.4em] text-foreground/70 ${
            paused ? "animate-none" : "animate-marquee"
          } motion-reduce:animate-none`}
        >
          <span className="px-6">{copy.repeat(6)}</span>
        </div>
        <button
          type="button"
          onClick={() => setPaused((prev) => !prev)}
          className="relative z-10 ml-auto mr-4 rounded-full border border-foreground/20 bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-foreground/70 hover:text-lab-accent transition-colors"
          aria-pressed={paused}
        >
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    </div>
  );
}
