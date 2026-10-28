"use client";

import { useRef } from "react";
import type { SectionOf } from "@/domain/sections";
import { ensureGsap, ScrollTrigger, useGSAP } from "@/features/animations/gsap";
import { Reveal } from "@/features/animations/reveal";
import { SplitText } from "@/features/animations/split-text";
import { SceneHost } from "@/features/scenes3d/scene-host";
import { CtaButton } from "../primitives/cta-button";
import { useSite } from "../site-context";

/**
 * Abertura cinematográfica: a cena 3D fica fixa (sticky) enquanto a capa e os
 * capítulos rolam por cima. O progresso da rolagem (0..1) é passado à cena,
 * que move a câmera entre seus "momentos". Sem WebGL ou com 3D desativado,
 * a mesma estrutura funciona com a imagem substituta.
 */
export function SceneStorySection({ section }: { section: SectionOf<"sceneStory"> }) {
  const { project, mode } = useSite();
  const p = section.props;
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const screens = p.chapters.length + 1;

  useGSAP(
    () => {
      const el = sectionRef.current;
      if (!el) return;
      ensureGsap();
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current = self.progress;
          if (barRef.current) barRef.current.style.transform = `scaleY(${self.progress})`;
        },
      });
      return () => trigger.kill();
    },
    { scope: sectionRef, dependencies: [screens] },
  );

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${screens * 100 + 25}svh` }} aria-label={p.title || undefined}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SceneHost
          settings={project.scene}
          progress={progress}
          background={project.theme.colors.background}
          eventSource={sectionRef}
          showDiagnostics={mode === "editor"}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--site-bg) 82%, transparent) 0%, color-mix(in srgb, var(--site-bg) 30%, transparent) 45%, transparent 70%), linear-gradient(0deg, var(--site-bg) 0%, transparent 28%)",
          }}
          aria-hidden
        />
        <div className="absolute top-1/2 right-5 hidden h-40 w-px -translate-y-1/2 bg-site-text/15 md:block" aria-hidden>
          <span ref={barRef} className="absolute inset-0 origin-top scale-y-0 bg-site-primary" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="flex h-[100svh] items-end pb-24 md:items-center md:pb-0">
          <div className="site-container pointer-events-auto">
            <div className="max-w-2xl">
              {p.eyebrow && (
                <Reveal as="p" variant="fade" className="site-eyebrow mb-6">
                  {p.eyebrow}
                </Reveal>
              )}
              <SplitText as="h1" text={p.title} immediate delay={0.2} className="site-heading text-[clamp(2.6rem,7vw,6rem)]" />
              {p.subtitle && (
                <Reveal as="p" delay={0.5} className="mt-6 max-w-xl text-lg leading-relaxed text-site-text/80">
                  {p.subtitle}
                </Reveal>
              )}
              <Reveal delay={0.65} className="mt-10 flex flex-wrap gap-3">
                <CtaButton cta={p.primaryCta} business={project.business} size="lg" />
                <CtaButton cta={p.secondaryCta} business={project.business} size="lg" variant="outline" />
              </Reveal>
            </div>
          </div>
        </div>
        {p.chapters.map((chapter, i) => (
          <div key={chapter.id} className="flex h-[100svh] items-end pb-20 md:items-center md:pb-0">
            <div className="site-container">
              <Reveal
                variant={i % 2 ? "slide-right" : "slide-left"}
                className="pointer-events-auto max-w-md rounded-[var(--site-radius-lg)] border border-site-border/70 bg-site-bg/55 p-7 backdrop-blur-md md:p-9"
              >
                {chapter.kicker && <p className="site-eyebrow mb-4">{chapter.kicker}</p>}
                <h2 className="site-heading text-[clamp(1.9rem,3.6vw,3rem)]">{chapter.title}</h2>
                {chapter.text && <p className="mt-4 leading-relaxed text-site-text/80">{chapter.text}</p>}
              </Reveal>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
