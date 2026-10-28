"use client";

import { Plus } from "lucide-react";
import type { SectionOf } from "@/domain/sections";
import { Reveal } from "@/features/animations/reveal";
import { SectionHeading } from "../primitives/heading";

/** Acordeão nativo (<details>): acessível por teclado e leitores de tela, sem JavaScript. */
export function FaqSection({ section }: { section: SectionOf<"faq"> }) {
  const p = section.props;
  return (
    <section className="site-section">
      <div className="site-container grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <SectionHeading eyebrow={p.eyebrow} title={p.title} className="md:mb-0" />
        <Reveal as="div" stagger className="divide-y divide-site-border border-y border-site-border">
          {p.items.map((item) => (
            <details key={item.id} className="group py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-site-border transition-transform duration-300 group-open:rotate-45 group-open:border-site-primary group-open:text-site-primary">
                  <Plus className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="pr-12 pb-6 leading-relaxed whitespace-pre-line text-site-muted">{item.answer}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
