import { GOAL_LABELS } from "@/config/segments";
import { segmentLabel, styleLabel } from "@/config/labels";
import type { BusinessInfo } from "@/domain/business";
import type { VisualStyleId } from "@/domain/theme";
import type { TemplateDefinition } from "@/features/templates/types";
import { Notice } from "@/components/ui/misc";
import { formatPhoneForDisplay } from "@/lib/phone";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-line py-2.5 text-sm last:border-0">
      <dt className="text-fg-subtle">{label}</dt>
      <dd className={value ? "text-fg" : "text-fg-subtle italic"}>{value || "não informado"}</dd>
    </div>
  );
}

export function StepReview({
  business,
  style,
  template,
}: {
  business: BusinessInfo;
  style: VisualStyleId;
  template: TemplateDefinition | undefined;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h2 className="font-display text-lg font-semibold">Revisão</h2>
        <p className="mt-1 mb-4 text-sm text-fg-muted">Confira os dados. Você poderá alterar tudo no editor.</p>
        <dl className="rounded-xl border border-line bg-ink-900 px-4">
          <Row label="Nome" value={business.name} />
          <Row label="Segmento" value={segmentLabel(business.segment)} />
          <Row label="Cidade" value={business.city} />
          <Row label="Objetivo" value={GOAL_LABELS[business.goal]} />
          <Row label="Serviços" value={business.offerings.join(", ")} />
          <Row label="WhatsApp" value={business.whatsapp ? formatPhoneForDisplay(business.whatsapp) : ""} />
          <Row label="Telefone" value={business.phone ? formatPhoneForDisplay(business.phone) : ""} />
          <Row label="E-mail" value={business.email} />
          <Row label="Estilo" value={styleLabel(style)} />
          <Row label="Modelo" value={template?.name ?? ""} />
        </dl>
      </div>
      <div className="space-y-3">
        <Notice tone="cyan" title="O que acontece ao criar">
          O projeto é criado com conteúdo inicial do modelo, adaptado aos dados informados, e salvo nesta instalação.
        </Notice>
        <Notice tone="warn" title="Conteúdo demonstrativo">
          Textos e imagens iniciais são exemplos. Revise-os no editor antes de qualquer publicação.
        </Notice>
        {!business.whatsapp && (
          <Notice tone="warn" title="WhatsApp não informado">
            Botões de WhatsApp ficarão indisponíveis até você informar um número no editor.
          </Notice>
        )}
      </div>
    </div>
  );
}
