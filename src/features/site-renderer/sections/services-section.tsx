"use client";

import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { Reveal } from "@/features/animations/reveal";
import { SectionHeading } from "../primitives/heading";
import { SiteIcon } from "../site-icon";

export function ServicesSection({ section }: { section: SectionOf<"services"> }) {
  const p = section.props;
  return (
    <section className="site-section">
      <div className="site-container">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        {p.layout === "grid" ? (
          <Reveal as="ul" stagger className="grid border-t border-l border-site-border sm:grid-cols-2 lg:grid-cols-3">
            {p.items.map((item, i) => (
              <li key={item.id} className="group relative border-r border-b border-site-border bg-site-bg p-8 transition-colors duration-500 hover:bg-site-surface md:p-10">
                <span className="absolute top-8 right-8 font-mono text-xs text-site-muted md:top-10 md:right-10">{String(i + 1).padStart(2, "0")}</span>
                <span className="mb-8 flex size-12 items-center justify-center rounded-[var(--site-radius)] border border-site-border text-site-primary transition-[transform,border-color,background-color] duration-500 group-hover:-rotate-6 group-hover:border-site-primary group-hover:bg-site-primary group-hover:text-site-on-primary">
                  <SiteIcon id={item.icon} className="size-5" />
                </span>
                <h3 className="site-heading text-2xl">{item.title}</h3>
                {item.description && <p className="mt-3 text-sm leading-relaxed text-site-muted">{item.description}</p>}
                {item.note && <p className="mt-5 text-xs font-semibold tracking-wider text-site-primary uppercase">{item.note}</p>}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-site-primary transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
              </li>
            ))}
          </Reveal>
        ) : (
          <Reveal as="ol" stagger className="divide-y divide-site-border border-y border-site-border">
            {p.items.map((item, i) => (
              <li key={item.id} className="group grid items-baseline gap-4 py-8 md:grid-cols-[80px_1fr_1.3fr_auto] md:gap-10">
                <span className="font-mono text-sm text-site-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={cn("site-heading text-2xl transition-colors duration-300 group-hover:text-site-primary md:text-3xl")}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-site-muted">{item.description}</p>
                {item.note && <span className="text-xs font-semibold tracking-wider text-site-primary uppercase">{item.note}</span>}
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
