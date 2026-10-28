"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { ensureGsap, gsap, useGSAP } from "./gsap";
import { useMotion } from "./motion-context";
import { EASE, REVEAL_START } from "./tokens";

type RevealVariant = "fade-up" | "fade" | "scale" | "slide-left" | "slide-right";

type RevealProps<T extends ElementType> = {
  as?: T;
  variant?: RevealVariant;
  delay?: number;
  /** Se definido, anima os filhos diretos em sequência em vez do elemento inteiro. */
  stagger?: boolean;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/**
 * Entrada de elementos ao rolar. Respeita movimento reduzido: sem animação,
 * o conteúdo aparece normalmente (nunca fica escondido).
 * O atributo data-reveal permite que páginas renderizadas no servidor ocultem
 * o elemento antes da hidratação (ver site-motion-script.ts).
 */
export function Reveal<T extends ElementType = "div">({
  as,
  variant = "fade-up",
  delay = 0,
  stagger = false,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const { enabled, profile, settings } = useMotion();
  const active = enabled && settings.sectionTransitions;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!active) {
        el.style.opacity = "1";
        return;
      }
      ensureGsap();
      const targets = stagger ? Array.from(el.children) : [el];
      const from: gsap.TweenVars = { opacity: 0 };
      if (variant === "fade-up") from.y = profile.distance;
      if (variant === "scale") from.scale = 0.94;
      if (variant === "slide-left") from.x = -profile.distance * 1.5;
      if (variant === "slide-right") from.x = profile.distance * 1.5;
      if (stagger) gsap.set(el, { opacity: 1 });
      gsap.fromTo(targets, from, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: profile.duration,
        delay,
        ease: EASE.out,
        stagger: stagger ? profile.stagger : 0,
        scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
        clearProps: "transform",
      });
    },
    { dependencies: [active], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} data-reveal="" {...rest}>
      {children}
    </Tag>
  );
}
