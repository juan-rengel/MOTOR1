"use client";

import { useMemo, useState } from "react";
import type { SectionOf } from "@/domain/sections";
import { cn } from "@/lib/cn";
import { Reveal } from "@/features/animations/reveal";
import { CtaButton } from "../primitives/cta-button";
import { SectionHeading } from "../primitives/heading";
import { SiteImage } from "../primitives/site-image";
import { useSite } from "../site-context";

/** Catálogo comercial com filtro por categoria e pedido pelo WhatsApp. */
export function CatalogSection({ section }: { section: SectionOf<"catalog"> }) {
  const { project } = useSite();
  const p = section.props;
  const categories = useMemo(
    () => Array.from(new Set(p.items.map((i) => i.category.trim()).filter(Boolean))),
    [p.items],
  );
  const [filter, setFilter] = useState<string | null>(null);
  const activeFilter = filter && categories.includes(filter) ? filter : null;
  const items = activeFilter ? p.items.filter((i) => i.category.trim() === activeFilter) : p.items;

  return (
    <section className="site-section">
      <div className="site-container">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
        {p.showFilters && categories.length > 1 && (
          <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "__all"}
                type="button"
                aria-pressed={activeFilter === c}
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-[var(--site-radius-button)] border px-4 py-2 text-sm transition-colors duration-300",
                  activeFilter === c
                    ? "border-site-primary bg-site-primary text-site-on-primary"
                    : "border-site-border text-site-text/80 hover:border-site-primary",
                )}
              >
                {c ?? "Todos"}
              </button>
            ))}
          </div>
        )}
        <Reveal as="ul" stagger key={activeFilter ?? "all"} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-[var(--site-radius-lg)]">
                <SiteImage
                  image={item.image.alt ? item.image : { ...item.image, alt: item.name }}
                  ratio="4/5"
                  imgClassName="transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                {item.badge && (
                  <span className="absolute top-4 left-4 rounded-[var(--site-radius-button)] bg-site-bg/85 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {item.category && <p className="text-xs tracking-[0.18em] text-site-muted uppercase">{item.category}</p>}
                  <h3 className="site-heading mt-1 text-xl">{item.name}</h3>
                </div>
                {item.price && <p className="shrink-0 font-semibold text-site-primary">{item.price}</p>}
              </div>
              {item.description && <p className="mt-2 text-sm leading-relaxed text-site-muted">{item.description}</p>}
              <div className="mt-5">
                <CtaButton
                  cta={{ label: p.orderLabel, action: "whatsapp", target: p.orderMessage.replaceAll("{produto}", item.name) }}
                  business={project.business}
                  variant="outline"
                  className="w-full"
                />
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
