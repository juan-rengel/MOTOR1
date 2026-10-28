"use client";

import type { CSSProperties } from "react";
import type { SectionOf } from "@/domain/sections";
import { useMotion } from "@/features/animations/motion-context";

const DURATION = { slow: "55s", normal: "34s", fast: "20s" } as const;

/** Faixa contínua de palavras. Sem movimento quando o visitante prefere menos animação. */
export function MarqueeSection({ section }: { section: SectionOf<"marquee"> }) {
  const p = section.props;
  const { enabled } = useMotion();
  const words = p.items.map((i) => i.text).filter(Boolean);
  if (words.length === 0) return null;
  const sequence = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <li key={`${w}-${i}`} className="flex items-center">
          <span className="site-heading px-8 text-[clamp(2rem,5vw,4rem)] whitespace-nowrap" style={i % 2 ? { color: "transparent", WebkitTextStroke: "1px var(--site-text)" } : undefined}>
            {w}
          </span>
          <span className="text-2xl text-site-primary" aria-hidden>
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="site-marquee overflow-hidden border-y border-site-border py-8" data-motion={enabled ? "on" : "off"}>
      <div className="site-marquee-track" style={{ "--marquee-duration": DURATION[p.speed] } as CSSProperties}>
        {sequence(false)}
        {sequence(true)}
      </div>
    </section>
  );
}
