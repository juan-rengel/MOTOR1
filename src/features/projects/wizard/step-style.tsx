"use client";

import "@fontsource-variable/playfair-display";
import "@fontsource-variable/oswald";
import "@fontsource-variable/manrope";
import { FONTS } from "@/config/fonts";
import { VISUAL_STYLE_LIST } from "@/config/styles";
import { getSegment } from "@/config/segments";
import type { SegmentId } from "@/domain/business";
import type { VisualStyleId } from "@/domain/theme";
import { Badge } from "@/components/ui/misc";
import { cn } from "@/lib/cn";

const MOTION_LABEL = { none: "Sem movimento", subtle: "Movimento sutil", balanced: "Movimento equilibrado", cinematic: "Movimento cinematográfico" };

export function StepStyle({
  segment,
  value,
  onChange,
}: {
  segment: SegmentId;
  value: VisualStyleId;
  onChange: (style: VisualStyleId) => void;
}) {
  const suggested = getSegment(segment).suggestedStyles;
  return (
    <div>
      <h2 className="font-display text-lg font-semibold">Estilo visual</h2>
      <p className="mt-1 mb-6 text-sm text-fg-muted">
        Define cores, tipografia, cantos e intensidade das animações. Tudo pode ser ajustado depois no editor.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Estilo visual">
        {VISUAL_STYLE_LIST.map((style) => {
          const { colors, fonts, headingCase } = style.theme;
          const active = style.id === value;
          return (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(style.id)}
              className={cn(
                "group overflow-hidden rounded-xl border text-left transition-[border-color,transform] duration-200 hover:-translate-y-0.5",
                active ? "border-cyan-glow ring-2 ring-cyan-glow/30" : "border-line hover:border-line-strong",
              )}
            >
              <div className="relative h-32 p-4" style={{ background: colors.background, color: colors.text }}>
                <span
                  className="block text-2xl leading-none font-semibold"
                  style={{ fontFamily: FONTS[fonts.heading].family, textTransform: headingCase === "uppercase" ? "uppercase" : "none" }}
                >
                  Aa Título
                </span>
                <span className="mt-2 block text-xs" style={{ fontFamily: FONTS[fonts.body].family, color: colors.muted }}>
                  Texto de apoio do site
                </span>
                <span
                  className="absolute bottom-4 left-4 rounded px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: colors.primary, color: colors.onPrimary, borderRadius: style.theme.radius === "round" ? 999 : style.theme.radius === "soft" ? 6 : 0 }}
                >
                  Botão
                </span>
                <span className="absolute right-4 bottom-4 flex gap-1" aria-hidden>
                  {[colors.surface, colors.primary, colors.accent].map((c, i) => (
                    <span key={i} className="size-4 rounded-full border border-black/10" style={{ background: c }} />
                  ))}
                </span>
              </div>
              <div className="bg-ink-900 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{style.label}</span>
                  {suggested.includes(style.id) && <Badge tone="cyan">Sugerido</Badge>}
                </div>
                <p className="mt-1 text-xs text-fg-subtle">{style.description}</p>
                <p className="mt-2 font-mono text-[10px] tracking-wider text-fg-subtle uppercase">{MOTION_LABEL[style.motionLevel]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
