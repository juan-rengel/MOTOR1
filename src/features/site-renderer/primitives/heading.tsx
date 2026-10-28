"use client";

import type { ElementType } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/features/animations/reveal";
import { SplitText } from "@/features/animations/split-text";

/** Título de seção padrão: sobretítulo, título com revelação e subtítulo. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  as = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  as?: ElementType;
  className?: string;
}) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <div className={cn("mb-12 max-w-3xl md:mb-16", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal as="p" variant="fade" className="site-eyebrow mb-4">
          {eyebrow}
        </Reveal>
      )}
      {title && <SplitText as={as} text={title} className="site-heading text-[clamp(2rem,4.6vw,3.6rem)]" />}
      {subtitle && (
        <Reveal as="p" delay={0.1} className="mt-5 text-base leading-relaxed text-site-muted md:text-lg">
          {subtitle}
        </Reveal>
      )}
    </div>
  );
}
