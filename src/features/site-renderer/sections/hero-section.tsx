"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { Parallax } from "@/features/animations/parallax";
import { Reveal } from "@/features/animations/reveal";
import { SplitText } from "@/features/animations/split-text";
import { useMotion } from "@/features/animations/motion-context";
import { CtaButton } from "../primitives/cta-button";
import { SiteImage } from "../primitives/site-image";
import { useSite } from "../site-context";

function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (enabled) void video.play().catch(() => undefined);
    else video.pause();
  }, [enabled]);
  return (
    <video
      ref={ref}
      className="absolute inset-0 size-full object-cover"
      src={src}
      poster={poster || undefined}
      muted
      loop
      playsInline
      autoPlay={enabled}
      preload="metadata"
      aria-hidden
    />
  );
}

export function HeroSection({ section }: { section: SectionOf<"hero"> }) {
  const { project } = useSite();
  const p = section.props;
  const centered = p.align === "center";

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden pt-28 pb-20 md:items-center md:pb-28">
      <div className="absolute inset-0" aria-hidden>
        {p.mediaKind === "image" && (
          <Parallax className="absolute -inset-y-[12%] inset-x-0">
            <SiteImage image={p.image} priority className="size-full" />
          </Parallax>
        )}
        {p.mediaKind === "video" && p.video.src && <HeroVideo src={p.video.src} poster={p.video.poster} />}
        {(p.mediaKind === "gradient" || (p.mediaKind === "video" && !p.video.src)) && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 75% 30%, color-mix(in srgb, var(--site-primary) 35%, transparent), transparent 70%), radial-gradient(50% 60% at 15% 80%, color-mix(in srgb, var(--site-accent) 28%, transparent), transparent 70%), var(--site-bg)",
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, var(--site-bg) 0%, color-mix(in srgb, var(--site-bg) ${Math.round(p.overlay * 100)}%, transparent) 55%, color-mix(in srgb, var(--site-bg) ${Math.round(p.overlay * 60)}%, transparent) 100%)`,
          }}
        />
      </div>

      <div className={cn("site-container relative", centered && "text-center")}>
        <div className={cn("max-w-4xl", centered && "mx-auto")}>
          {p.eyebrow && (
            <Reveal as="p" variant="fade" className={cn("site-eyebrow mb-6", centered && "justify-center")}>
              {p.eyebrow}
            </Reveal>
          )}
          <SplitText as="h1" text={p.title} immediate delay={0.15} className="site-heading text-[clamp(2.6rem,7.5vw,6.2rem)]" />
          {p.subtitle && (
            <Reveal as="p" delay={0.45} className={cn("mt-6 max-w-2xl text-lg leading-relaxed text-site-text/80 md:text-xl", centered && "mx-auto")}>
              {p.subtitle}
            </Reveal>
          )}
          <Reveal delay={0.6} className={cn("mt-10 flex flex-wrap gap-3", centered && "justify-center")}>
            <CtaButton cta={p.primaryCta} business={project.business} size="lg" />
            <CtaButton cta={p.secondaryCta} business={project.business} size="lg" variant="outline" />
          </Reveal>
        </div>
      </div>

      <a
        href={`#${project.sections[project.sections.indexOf(section) + 1]?.anchor ?? "top"}`}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-site-muted uppercase md:flex"
        aria-label="Rolar para a próxima seção"
      >
        Role
        <ChevronDown className="size-4 animate-bounce" aria-hidden />
      </a>
    </section>
  );
}
