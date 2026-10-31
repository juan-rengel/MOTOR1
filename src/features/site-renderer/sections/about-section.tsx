"use client";

import { Check } from "lucide-react";
import type { SectionOf } from "@/domain/sections";
import { ImageReveal } from "@/features/animations/image-reveal";
import { Reveal } from "@/features/animations/reveal";
import { SplitText } from "@/features/animations/split-text";
import { SiteImage } from "../primitives/site-image";

export function AboutSection({ section }: { section: SectionOf<"about"> }) {
  const p = section.props;
  const hasImage = Boolean(p.image.src);
  return (
    <section className="site-section">
      <div className={hasImage ? "site-container grid items-center gap-12 md:grid-cols-2 md:gap-20" : "site-container max-w-4xl"}>
        <div>
          {p.eyebrow && (
            <Reveal as="p" variant="fade" className="site-eyebrow mb-5">
              {p.eyebrow}
            </Reveal>
          )}
          <SplitText text={p.title} className="site-heading text-[clamp(2rem,4.2vw,3.4rem)]" />
          <Reveal className="mt-6 space-y-4 leading-relaxed whitespace-pre-line text-site-muted md:text-lg">{p.text}</Reveal>
          {p.highlights.length > 0 && (
            <Reveal as="ul" stagger className="mt-10 grid gap-3">
              {p.highlights.map((h) => (
                <li key={h.id} className="flex items-center gap-3 border-b border-site-border pb-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-site-primary text-site-on-primary">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span>{h.text}</span>
                </li>
              ))}
            </Reveal>
          )}
        </div>
        {hasImage && (
          <ImageReveal className="overflow-hidden rounded-[var(--site-radius-lg)]">
            <SiteImage image={p.image} ratio="4/5" sizes="(min-width: 768px) 50vw, 100vw" />
          </ImageReveal>
        )}
      </div>
    </section>
  );
}
