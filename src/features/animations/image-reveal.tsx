"use client";

import { useRef, type ReactNode } from "react";
import { ensureGsap, gsap, useGSAP } from "./gsap";
import { useMotion } from "./motion-context";
import { EASE, PLAY_ONCE, REVEAL_START } from "./tokens";

/**
 * Revelação de imagem: a máscara abre (clip-path) enquanto a imagem desacelera
 * de uma escala maior para a normal — efeito de "abertura de cena".
 */
export function ImageReveal({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { enabled, settings, profile } = useMotion();
  const active = enabled && settings.imageReveal;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !active) {
        if (el) el.style.opacity = "1";
        return;
      }
      ensureGsap();
      const media = el.querySelector<HTMLElement>("[data-reveal-media]") ?? el.firstElementChild;
      const clipFrom = { up: "inset(100% 0% 0% 0%)", left: "inset(0% 100% 0% 0%)", right: "inset(0% 0% 0% 100%)" }[direction];
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: REVEAL_START, toggleActions: PLAY_ONCE } });
      tl.set(el, { opacity: 1 });
      tl.fromTo(el, { clipPath: clipFrom }, { clipPath: "inset(0% 0% 0% 0%)", duration: profile.duration * 1.4, ease: EASE.inOut });
      if (media) {
        tl.fromTo(media, { scale: profile.imageScale }, { scale: 1, duration: profile.duration * 2, ease: EASE.out }, 0);
      }
    },
    { dependencies: [active], scope: ref, revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={className} data-reveal="">
      {children}
    </div>
  );
}
