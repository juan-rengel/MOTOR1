"use client";

import type { Cta, CtaAction } from "@/domain/cta";
import { CTA_ACTION_LABELS } from "@/domain/cta";
import type { BusinessInfo } from "@/domain/business";
import type { Section } from "@/domain/sections";
import { Input, Select } from "@/components/ui/field";
import { resolveCta } from "@/lib/cta";

/** Edição de botão: rótulo, ação e destino conforme a ação escolhida. */
export function CtaField({
  label,
  value,
  sections,
  business,
  onChange,
}: {
  label: string;
  value: Cta;
  sections: Section[];
  business: BusinessInfo;
  onChange: (next: Cta, key?: string) => void;
}) {
  const resolved = resolveCta(value, business);
  return (
    <fieldset className="space-y-2 rounded-lg border border-line bg-ink-900/60 p-3">
      <legend className="px-1 text-xs font-medium text-fg-muted">{label}</legend>
      <Input value={value.label} maxLength={60} onChange={(e) => onChange({ ...value, label: e.target.value }, "label")} placeholder="Texto do botão (vazio = oculto)" aria-label={`${label}: texto`} className="h-9" />
      <Select value={value.action} onChange={(e) => onChange({ ...value, action: e.target.value as CtaAction, target: "" })} aria-label={`${label}: ação`} className="h-9">
        {(Object.keys(CTA_ACTION_LABELS) as CtaAction[]).map((a) => (
          <option key={a} value={a}>
            {CTA_ACTION_LABELS[a]}
          </option>
        ))}
      </Select>
      {value.action === "section" && (
        <Select value={value.target} onChange={(e) => onChange({ ...value, target: e.target.value })} aria-label={`${label}: seção de destino`} className="h-9">
          <option value="">Escolha a seção…</option>
          {sections.map((s) => (
            <option key={s.id} value={s.anchor}>
              {s.navLabel || s.anchor}
            </option>
          ))}
        </Select>
      )}
      {value.action === "whatsapp" && (
        <Input value={value.target} maxLength={500} onChange={(e) => onChange({ ...value, target: e.target.value }, "target")} placeholder="Mensagem inicial (o visitante pode editar)" aria-label={`${label}: mensagem`} className="h-9" />
      )}
      {value.action === "link" && (
        <Input value={value.target} maxLength={500} onChange={(e) => onChange({ ...value, target: e.target.value }, "target")} placeholder="https://..." aria-label={`${label}: endereço`} className="h-9" />
      )}
      {resolved.status === "unavailable" && <p className="text-[11px] text-warn">⚠ {resolved.reason}</p>}
    </fieldset>
  );
}
