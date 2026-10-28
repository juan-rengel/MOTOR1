"use client";

import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { ImageReveal } from "@/features/animations/image-reveal";
import { Parallax } from "@/features/animations/parallax";
import { Reveal } from "@/features/animations/reveal";
import { SectionHeading } from "../primitives/heading";
import { SiteImage } from "../primitives/site-image";

export function EditorialSection({ section }: { section: SectionOf<"editorial"> }) {
  const p = section.props;
  return (
    <section className="site-section">
      <div className="site-container">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} />
        <div className="space-y-24 md:space-y-36">
          {p.items.map((item, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={item.id} className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
                <div className={cn("md:col-span-7", flip && "md:order-2")}>
                  <ImageReveal className="overflow-hidden rounded-[var(--site-radius-lg)]" direction={flip ? "right" : "left"}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Parallax className="absolute -inset-y-[10%] inset-x-0" speed={0.8}>
                        <SiteImage image={item.image} className="size-full" />
                      </Parallax>
                    </div>
                  </ImageReveal>
                </div>
                <Reveal className={cn("md:col-span-5", flip && "md:order-1")}>
                  {item.kicker && <p className="site-eyebrow mb-5">{item.kicker}</p>}
                  <h3 className="site-heading text-[clamp(1.8rem,3.4vw,2.8rem)]">{item.title}</h3>
                  {item.text && <p className="mt-5 leading-relaxed text-site-muted md:text-lg">{item.text}</p>}
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
