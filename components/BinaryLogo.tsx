"use client";

import { useEffect, useState } from "react";

const base = ["O", "N", "N", "0", "1", "0", "0", "1"];

export default function BinaryLogo() {
  const [cols, setCols] = useState(base);

  useEffect(() => {
    const id = setInterval(() => {
      setCols((prev) =>
        prev.map((char, index) => {
          if (index < 3) return char; // lock ONN letters
          return Math.random() > 0.5 ? "1" : "0";
        })
      );
    }, 280);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-stretch" role="img" aria-label="ONN logo prototype">
      {cols.map((char, idx) => (
        <div
          key={`${char}-${idx}`}
          className="flex flex-col border border-foreground/20 bg-background/80 min-w-[18px] mx-[1px]"
        >
          <span className="font-mono text-xs text-center py-1 select-none">
            {char}
          </span>
        </div>
      ))}
    </div>
  );
}
