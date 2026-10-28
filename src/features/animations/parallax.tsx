"use client";

import { useRef, type ReactNode } from "react";
import { ensureGsap, gsap, useGSAP } from "./gsap";
import { useMotion } from "./motion-context";

/**
 * Parallax controlado: desloca o conteúdo verticalmente conforme a rolagem.
 * `speed` relativo (1 = padrão do nível de movimento). Desligado em movimento
 * reduzido, dispositivos fracos ou quando o projeto desativa parallax.
 */
export function Parallax({ children, speed = 1, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { enabled, settings, profile } = useMotion();
  const amount = enabled && settings.parallax ? profile.parallax * speed : 0;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || amount === 0) return;
      ensureGsap();
      gsap.fromTo(
        el,
        { yPercent: -amount * 100 },
        {
          yPercent: amount * 100,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { dependencies: [amount], scope: ref, revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className} style={amount ? { willChange: "transform" } : undefined}>
      {children}
    </div>
  );
}
