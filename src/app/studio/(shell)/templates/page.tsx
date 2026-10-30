import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/studio/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { segmentLabel, styleLabel } from "@/config/labels";
import { SEGMENTS } from "@/config/segments";
import { TEMPLATES, isUniversalTemplate } from "@/features/templates/registry";

export const metadata = { title: "Modelos" };

export default function TemplatesPage() {
  const covered = new Set(TEMPLATES.flatMap((t) => t.segments));
  return (
    <>
      <PageHeader
        eyebrow="Biblioteca"
        title="Modelos"
        description="Cada modelo tem estrutura, identidade e experiência próprias, construídas sobre os mesmos componentes e motores de animação e 3D."
      />
      <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((t) => (
          <li key={t.id} className="overflow-hidden rounded-xl border border-line bg-ink-900">
            <div className="relative aspect-[16/9] bg-ink-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- imagem local de demonstração */}
              <img src={t.preview.src} alt={t.preview.alt} className="size-full object-cover" loading="lazy" />
            </div>
            <div className="p-5">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {isUniversalTemplate(t) ? (
                  <Badge tone="cyan">Todos os segmentos</Badge>
                ) : (
                  t.segments.map((s) => (
                    <Badge key={s} tone="cyan">
                      {segmentLabel(s)}
                    </Badge>
                  ))
                )}
                <Badge>Estilo padrão: {styleLabel(t.defaultStyle)}</Badge>
              </div>
              <h2 className="font-display text-lg font-semibold">{t.name}</h2>
              <p className="mt-1 text-sm text-fg-muted">{t.description}</p>
              <div className="mt-4 flex gap-2">
                <ButtonLink href={`/demo/${t.id}`} target="_blank" size="sm" icon={<ExternalLink className="size-3.5" aria-hidden />}>
                  Ver demonstração
                </ButtonLink>
                <ButtonLink href="/studio/new" size="sm" variant="ghost">
                  Usar modelo
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <section className="mt-12">
        <h2 className="mb-3 font-display text-lg font-semibold">Cobertura por segmento</h2>
        <p className="mb-4 max-w-2xl text-sm text-fg-muted">
          Segmentos sem modelo dedicado usam o modelo Essencial, com os textos do próprio segmento. Modelos dedicados só são
          oferecidos ao segmento para o qual foram desenhados. Novos modelos entram registrando um arquivo em
          <code className="mx-1 text-fg">src/features/templates</code>.
        </p>
        <ul className="flex flex-wrap gap-2">
          {SEGMENTS.map((s) => (
            <li key={s.id}>
              <Badge tone={covered.has(s.id) ? "ok" : "neutral"}>
                {s.label}: {covered.has(s.id) ? "modelo dedicado" : "modelo Essencial"}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
