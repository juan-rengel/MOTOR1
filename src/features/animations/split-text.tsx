"use client";

import { useRef, type ElementType } from "react";
import { cn } from "@/lib/cn";
import { ensureGsap, gsap, useGSAP } from "./gsap";
import { useMotion } from "./motion-context";
import { EASE, REVEAL_START } from "./tokens";

/**
 * Título com revelação palavra a palavra (cada palavra sobe de dentro de uma
 * máscara). Leitores de tela recebem o texto completo; as palavras animadas
 * ficam ocultas para tecnologias assistivas.
 */
export function SplitText({
  text,
  as,
  className,
  delay = 0,
  immediate = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Anima ao montar (para a capa), sem esperar a rolagem. */
  immediate?: boolean;
}) {
  const Tag = (as ?? "h2") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const { enabled, settings, profile } = useMotion();
  const active = enabled && settings.textReveal;
  const words = text.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !active) {
        if (el) el.style.opacity = "1";
        return;
      }
      ensureGsap();
      const inner = el.querySelectorAll<HTMLElement>("[data-word]");
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        inner,
        { yPercent: 110, rotate: 2 },
        {
          yPercent: 0,
          rotate: 0,
          duration: profile.duration * 1.2,
          ease: EASE.expo,
          stagger: profile.stagger * 0.8,
          delay,
          scrollTrigger: immediate ? undefined : { trigger: el, start: REVEAL_START, once: true },
        },
      );
    },
    { dependencies: [active, text], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className} data-reveal="">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="block">
        {words.map((word, i) => (
          <span key={`${i}-${word}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <span data-word className={cn("inline-block will-change-transform")}>
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
