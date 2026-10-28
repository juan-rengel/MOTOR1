"use client";

import { ExternalLink } from "lucide-react";
import type { TemplateDefinition } from "@/features/templates/types";
import type { VisualStyleId } from "@/domain/theme";
import { Badge, Notice } from "@/components/ui/misc";
import { segmentLabel } from "@/config/labels";
import type { SegmentId } from "@/domain/business";
import { cn } from "@/lib/cn";

function TemplateCard({
  template,
  active,
  style,
  onSelect,
}: {
  template: TemplateDefinition;
  active: boolean;
  style: VisualStyleId;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-ink-900 transition-colors duration-200",
        active ? "border-cyan-glow ring-2 ring-cyan-glow/30" : "border-line hover:border-line-strong",
      )}
    >
      <button type="button" role="radio" aria-checked={active} onClick={onSelect} className="block w-full text-left">
        <div className="relative aspect-[16/9] overflow-hidden bg-ink-800">
          {/* eslint-disable-next-line @next/next/no-img-element -- imagem local de demonstração */}
          <img src={template.preview.src} alt={template.preview.alt} className="size-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent" aria-hidden />
          <span className="absolute bottom-3 left-4 font-display text-lg font-semibold text-white">{template.name}</span>
        </div>
        <div className="p-4">
          <p className="text-sm text-fg-muted">{template.tagline}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {template.features.map((f) => (
              <li key={f}>
                <Badge>{f}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </button>
      <div className="border-t border-line px-4 py-2.5">
        <a
          href={`/demo/${template.id}?style=${style}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-soft hover:text-cyan-glow"
        >
          Ver demonstração com este estilo <ExternalLink className="size-3" aria-hidden />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </div>
  );
}

export function StepTemplate({
  segment,
  recommended,
  others,
  value,
  style,
  onChange,
}: {
  segment: SegmentId;
  recommended: readonly TemplateDefinition[];
  others: readonly TemplateDefinition[];
  value: string | null;
  style: VisualStyleId;
  onChange: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Modelo inicial">
      <h2 className="font-display text-lg font-semibold">Modelo inicial</h2>
      <p className="mt-1 mb-6 text-sm text-fg-muted">
        O modelo define a estrutura, as seções e a experiência cinematográfica. Conteúdo e visual continuam editáveis.
      </p>
      {recommended.length > 0 ? (
        <>
          <h3 className="mb-3 text-xs font-medium tracking-wider text-cyan-glow uppercase">Recomendados para {segmentLabel(segment).toLowerCase()}</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((t) => (
              <TemplateCard key={t.id} template={t} style={style} active={t.id === value} onSelect={() => onChange(t.id)} />
            ))}
          </div>
        </>
      ) : (
        <Notice tone="warn" title="Ainda não há modelo dedicado a este segmento">
          Os modelos abaixo podem ser adaptados: troque textos, imagens, seções e cores no editor. Novos modelos por segmento
          estão previstos na arquitetura.
        </Notice>
      )}
      {others.length > 0 && (
        <>
          <h3 className="mt-8 mb-3 text-xs font-medium tracking-wider text-fg-subtle uppercase">Outros modelos (adaptáveis)</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {others.map((t) => (
              <TemplateCard key={t.id} template={t} style={style} active={t.id === value} onSelect={() => onChange(t.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
