"use client";

import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { Parallax } from "@/features/animations/parallax";
import { Reveal } from "@/features/animations/reveal";
import { SplitText } from "@/features/animations/split-text";
import { CtaButton } from "../primitives/cta-button";
import { SiteImage } from "../primitives/site-image";
import { useSite } from "../site-context";

export function CtaSection({ section }: { section: SectionOf<"cta"> }) {
  const { project } = useSite();
  const p = section.props;
  const onPrimary = p.background === "primary";
  const withImage = p.background === "image" && Boolean(p.image.src);

  return (
    <section className="site-section">
      <div className="site-container">
        <div
          className={cn(
            "relative isolate overflow-hidden rounded-[var(--site-radius-lg)] px-6 py-20 text-center md:px-16 md:py-28",
            onPrimary && "bg-site-primary text-site-on-primary",
            !onPrimary && "border border-site-border bg-site-surface",
          )}
        >
          {withImage && (
            <div className="absolute inset-0 -z-10" aria-hidden>
              <Parallax className="absolute -inset-y-[15%] inset-x-0">
                <SiteImage image={{ ...p.image, alt: "" }} className="size-full" />
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
            </div>
          )}
          {p.eyebrow && (
            <Reveal as="p" variant="fade" className={cn("site-eyebrow mb-5 justify-center", onPrimary && "text-site-on-primary", withImage && "text-white")}>
              {p.eyebrow}
            </Reveal>
          )}
          <SplitText text={p.title} className={cn("site-heading mx-auto max-w-4xl text-[clamp(2.2rem,5.4vw,4.6rem)]", withImage && "text-white")} />
          {p.subtitle && (
            <Reveal as="p" className={cn("mx-auto mt-6 max-w-2xl text-lg", onPrimary ? "opacity-80" : withImage ? "text-white/80" : "text-site-muted")}>
              {p.subtitle}
            </Reveal>
          )}
          <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
            <CtaButton
              cta={p.primaryCta}
              business={project.business}
              size="lg"
              className={onPrimary ? "!bg-site-on-primary !text-site-primary" : undefined}
            />
            <CtaButton cta={p.secondaryCta} business={project.business} size="lg" variant="outline" className={withImage ? "!text-white" : undefined} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
