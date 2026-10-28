"use client";

import { useRef } from "react";
import type { SectionOf } from "@/domain/sections";
import { ensureGsap, gsap, useGSAP } from "@/features/animations/gsap";
import { useMotion } from "@/features/animations/motion-context";
import { Reveal } from "@/features/animations/reveal";
import { SectionHeading } from "../primitives/heading";

/** Etapas com linha de progresso que se preenche conforme a rolagem. */
export function StepsSection({ section }: { section: SectionOf<"steps"> }) {
  const p = section.props;
  const listRef = useRef<HTMLOListElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const { enabled, settings } = useMotion();
  const active = enabled && settings.sectionTransitions;

  useGSAP(
    () => {
      if (!active || !lineRef.current || !listRef.current) return;
      ensureGsap();
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: listRef.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 } },
      );
    },
    { dependencies: [active], scope: listRef, revertOnUpdate: true },
  );

  return (
    <section className="site-section bg-site-surface">
      <div className="site-container grid gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} className="md:sticky md:top-28 md:self-start" />
        <ol ref={listRef} className="relative space-y-12 pl-14">
          <span className="absolute top-2 bottom-2 left-[19px] w-px bg-site-border" aria-hidden />
          <span ref={lineRef} className="absolute top-2 bottom-2 left-[19px] w-px origin-top bg-site-primary" aria-hidden />
          {p.items.map((step, i) => (
            <Reveal as="li" key={step.id} className="relative">
              <span className="absolute top-0 -left-14 flex size-10 items-center justify-center rounded-full border border-site-primary bg-site-surface font-mono text-sm text-site-primary">
                {i + 1}
              </span>
              <h3 className="site-heading text-2xl md:text-3xl">{step.title}</h3>
              {step.text && <p className="mt-3 max-w-xl leading-relaxed text-site-muted">{step.text}</p>}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
