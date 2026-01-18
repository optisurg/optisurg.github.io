"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring } from "framer-motion";

const GLYPHS = ["0", "1", "▒", "░", "▓", "█", "/", "\\", "·"];

export default function AsciiPane() {
  const [frame, setFrame] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  useEffect(() => {
    let raf = 0;
    let last = 0;

    const render = (t: number) => {
      if (t - last < 60) {
        raf = requestAnimationFrame(render);
        return;
      }
      last = t;

      const width = wrapRef.current?.clientWidth || window.innerWidth * 0.35;
      const height = wrapRef.current?.clientHeight || window.innerHeight;
      const charW = 8;
      const charH = 14;
      const cols = Math.floor(width / charW);
      const rows = Math.floor(height / charH);
      const scroll = progress.get();
      const drift = (scroll ?? 0) * 40 + t * 0.0006;

      let out = "";
      const center = Math.floor(cols / 2);
      const beamWidth = 4;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dx = Math.abs(c - center);
          const beam = dx <= beamWidth;
          if (beam) {
            const flicker = Math.sin(drift + r * 0.2 + c * 0.1);
            const idx = Math.min(GLYPHS.length - 1, Math.max(0, Math.floor((flicker + 1) * (GLYPHS.length / 2))));
            out += GLYPHS[idx];
          } else {
            out += Math.random() > 0.975 ? "1" : "0";
          }
        }
        out += "\n";
      }

      setFrame(out);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return (
    <div
      ref={wrapRef}
      className="hidden lg:block fixed inset-y-0 right-0 w-[38vw] border-l border-foreground/15 bg-foreground/5"
      aria-hidden="true"
    >
      <pre className="text-[10px] leading-[12px] text-lab-accent/80 font-mono p-4 whitespace-pre select-none pointer-events-none">
        {frame}
      </pre>
    </div>
  );
}
