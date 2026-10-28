"use client";

import type { BusinessInfo, BusinessGoal, SocialNetwork } from "@/domain/business";
import { GOAL_IDS } from "@/domain/business";
import type { Project } from "@/domain/project";
import { GOAL_LABELS } from "@/config/segments";
import { segmentLabel } from "@/config/labels";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Notice } from "@/components/ui/misc";
import { formatPhoneForDisplay, normalizePhone } from "@/lib/phone";
import { SOCIAL_LABELS, resolveSocialUrl } from "@/lib/social";
import { updateBusiness, type EditorAction } from "../editor-state";

export function BusinessPanel({ project, dispatch }: { project: Project; dispatch: (a: EditorAction) => void }) {
  const b = project.business;
  const set = <K extends keyof BusinessInfo>(key: K, value: BusinessInfo[K]) =>
    dispatch({ type: "edit", key: `business.${String(key)}`, apply: updateBusiness({ [key]: value } as Partial<BusinessInfo>) });

  const phoneHint = (v: string) => {
    if (!v.trim()) return { error: undefined, hint: "Com DDD. Ex.: (11) 91234-5678" };
    const r = normalizePhone(v);
    return r.ok ? { error: undefined, hint: `✓ ${formatPhoneForDisplay(v)}` } : { error: r.reason, hint: undefined };
  };
  const wa = phoneHint(b.whatsapp);
  const ph = phoneHint(b.phone);

  return (
    <div className="space-y-5">
      <Notice>
        Segmento: <strong className="text-fg">{segmentLabel(b.segment)}</strong>. Estes dados alimentam botões, cabeçalho, rodapé e
        contato em todo o site.
      </Notice>
      <Field label="Nome comercial" error={!b.name.trim() ? "Obrigatório." : undefined}>
        {(a) => <Input id={a.id} aria-invalid={a.invalid} value={b.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />}
      </Field>
      <Field label="Cidade ou região" optional>
        {(a) => <Input id={a.id} value={b.city} maxLength={80} onChange={(e) => set("city", e.target.value)} />}
      </Field>
      <Field label="Descrição" optional>
        {(a) => <Textarea id={a.id} value={b.description} maxLength={600} onChange={(e) => set("description", e.target.value)} />}
      </Field>
      <Field label="Público-alvo" optional>
        {(a) => <Input id={a.id} value={b.audience} maxLength={200} onChange={(e) => set("audience", e.target.value)} />}
      </Field>
      <Field label="Objetivo principal">
        {(a) => (
          <Select id={a.id} value={b.goal} onChange={(e) => set("goal", e.target.value as BusinessGoal)}>
            {GOAL_IDS.map((g) => (
              <option key={g} value={g}>
                {GOAL_LABELS[g]}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <h3 className="pt-2 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Contato</h3>
      <Field label="WhatsApp" optional error={wa.error} hint={wa.hint}>
        {(a) => <Input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} inputMode="tel" value={b.whatsapp} maxLength={30} onChange={(e) => set("whatsapp", e.target.value)} />}
      </Field>
      <Field label="Telefone" optional error={ph.error} hint={ph.hint}>
        {(a) => <Input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} inputMode="tel" value={b.phone} maxLength={30} onChange={(e) => set("phone", e.target.value)} />}
      </Field>
      <Field label="E-mail" optional error={b.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) ? "E-mail inválido." : undefined}>
        {(a) => <Input id={a.id} aria-invalid={a.invalid} type="email" value={b.email} maxLength={120} onChange={(e) => set("email", e.target.value)} />}
      </Field>
      <Field label="Endereço" optional>
        {(a) => <Input id={a.id} value={b.address} maxLength={200} onChange={(e) => set("address", e.target.value)} />}
      </Field>
      <Field label="Horário de atendimento" optional>
        {(a) => <Input id={a.id} value={b.hours} maxLength={200} onChange={(e) => set("hours", e.target.value)} />}
      </Field>
      <h3 className="pt-2 text-xs font-semibold tracking-wider text-fg-subtle uppercase">Redes sociais</h3>
      {(Object.keys(b.social) as SocialNetwork[]).map((network) => {
        const value = b.social[network];
        const invalid = value.trim() !== "" && resolveSocialUrl(network, value) === null;
        return (
          <Field key={network} label={SOCIAL_LABELS[network]} optional error={invalid ? "Formato não reconhecido." : undefined}>
            {(a) => (
              <Input id={a.id} aria-invalid={a.invalid} value={value} maxLength={200} placeholder={network === "website" ? "https://..." : "@usuario ou URL"} onChange={(e) => set("social", { ...b.social, [network]: e.target.value })} />
            )}
          </Field>
        );
      })}
    </div>
  );
}
