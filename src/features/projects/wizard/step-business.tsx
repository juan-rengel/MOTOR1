"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { GOAL_LABELS, SEGMENTS } from "@/config/segments";
import { GOAL_IDS, type BusinessInfo, type BusinessGoal, type SegmentId, type SocialNetwork } from "@/domain/business";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SiteIcon } from "@/features/site-renderer/site-icon";
import { formatPhoneForDisplay, normalizePhone } from "@/lib/phone";
import { SOCIAL_LABELS } from "@/lib/social";
import { cn } from "@/lib/cn";
import type { FieldErrors } from "./use-wizard-state";

interface Props {
  business: BusinessInfo;
  errors: FieldErrors;
  onChange: (next: BusinessInfo) => void;
  onSegmentChange: (segment: SegmentId) => void;
}

export function StepBusiness({ business, errors, onChange, onSegmentChange }: Props) {
  const [offeringDraft, setOfferingDraft] = useState("");
  const segment = SEGMENTS.find((s) => s.id === business.segment);
  const set = <K extends keyof BusinessInfo>(key: K, value: BusinessInfo[K]) => onChange({ ...business, [key]: value });

  function addOffering(value: string) {
    const v = value.trim();
    if (!v || business.offerings.includes(v) || business.offerings.length >= 12) return;
    set("offerings", [...business.offerings, v]);
    setOfferingDraft("");
  }

  function onOfferingKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOffering(offeringDraft);
    }
  }

  const whatsappPreview = business.whatsapp.trim() && normalizePhone(business.whatsapp).ok ? formatPhoneForDisplay(business.whatsapp) : null;

  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="mb-1 font-display text-lg font-semibold">Segmento</legend>
        <p className="mb-4 text-sm text-fg-muted">Define os modelos recomendados e as sugestões de conteúdo.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Segmento">
          {SEGMENTS.map((s) => {
            const active = s.id === business.segment;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSegmentChange(s.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors duration-150",
                  active ? "border-cyan-glow bg-cyan-glow/10" : "border-line bg-ink-900 hover:border-line-strong",
                )}
              >
                <SiteIcon id={s.icon} className={cn("mt-0.5 size-4 shrink-0", active ? "text-cyan-glow" : "text-fg-subtle")} />
                <span>
                  <span className="block text-sm font-medium text-fg">{s.label}</span>
                  <span className="mt-0.5 hidden text-xs text-fg-subtle sm:block">{s.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-lg font-semibold sm:col-span-2">Identificação</legend>
        <Field label="Nome comercial" error={errors.name} className="sm:col-span-2">
          {(a) => (
            <Input
              id={a.id}
              aria-describedby={a.describedBy}
              aria-invalid={a.invalid}
              value={business.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex.: Auto Center Silva"
              autoComplete="organization"
              required
            />
          )}
        </Field>
        <Field label="Cidade ou região" optional error={errors.city}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} value={business.city} onChange={(e) => set("city", e.target.value)} placeholder="Ex.: Campinas – SP" />}
        </Field>
        <Field label="Objetivo principal do site" error={errors.goal}>
          {(a) => (
            <Select id={a.id} value={business.goal} onChange={(e) => set("goal", e.target.value as BusinessGoal)}>
              {GOAL_IDS.map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Descrição do negócio" optional error={errors.description} hint="Usada como texto de apresentação. Se ficar vazia, sugerimos um texto genérico editável." className="sm:col-span-2">
          {(a) => (
            <Textarea id={a.id} aria-describedby={a.describedBy} value={business.description} maxLength={600} onChange={(e) => set("description", e.target.value)} />
          )}
        </Field>
        <Field label="Público-alvo" optional error={errors.audience} className="sm:col-span-2">
          {(a) => <Input id={a.id} value={business.audience} onChange={(e) => set("audience", e.target.value)} placeholder="Ex.: motoristas da região que buscam manutenção preventiva" />}
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-display text-lg font-semibold">Principais serviços ou produtos</legend>
        <p className="mb-4 text-sm text-fg-muted">
          Opcional. Se você não informar, o modelo usa itens demonstrativos que você poderá editar.
        </p>
        <div className="flex gap-2">
          <Input
            aria-label="Novo serviço ou produto"
            value={offeringDraft}
            onChange={(e) => setOfferingDraft(e.target.value)}
            onKeyDown={onOfferingKey}
            placeholder="Digite e pressione Enter"
            maxLength={80}
          />
          <Button onClick={() => addOffering(offeringDraft)} icon={<Plus className="size-4" aria-hidden />}>
            Adicionar
          </Button>
        </div>
        {business.offerings.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Serviços adicionados">
            {business.offerings.map((o) => (
              <li key={o} className="flex items-center gap-1 rounded-md border border-cyan-glow/30 bg-cyan-glow/10 py-1 pr-1 pl-2.5 text-xs text-cyan-soft">
                {o}
                <button type="button" aria-label={`Remover ${o}`} className="rounded p-0.5 hover:bg-cyan-glow/20" onClick={() => set("offerings", business.offerings.filter((x) => x !== o))}>
                  <X className="size-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {segment && segment.offeringHints.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs text-fg-subtle">Sugestões para {segment.label.toLowerCase()}:</p>
            <div className="flex flex-wrap gap-1.5">
              {segment.offeringHints
                .filter((h) => !business.offerings.includes(h))
                .map((h) => (
                  <button key={h} type="button" onClick={() => addOffering(h)} className="rounded-md border border-line px-2 py-1 text-xs text-fg-muted transition-colors hover:border-cyan-glow/40 hover:text-fg">
                    + {h}
                  </button>
                ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-1 font-display text-lg font-semibold sm:col-span-2">Contato</legend>
        <p className="-mt-3 mb-1 text-sm text-fg-muted sm:col-span-2">
          Botões de WhatsApp e ligação só funcionam com números válidos. Nunca preenchemos números automaticamente.
        </p>
        <Field label="WhatsApp" optional error={errors.whatsapp} hint={whatsappPreview ? `Link será criado para ${whatsappPreview}` : "Com DDD. Ex.: (11) 91234-5678"}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} inputMode="tel" value={business.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} autoComplete="tel" />}
        </Field>
        <Field label="Telefone comercial" optional error={errors.phone}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} inputMode="tel" value={business.phone} onChange={(e) => set("phone", e.target.value)} />}
        </Field>
        <Field label="E-mail" optional error={errors.email}>
          {(a) => <Input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} type="email" value={business.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />}
        </Field>
        <Field label="Horário de atendimento" optional error={errors.hours}>
          {(a) => <Input id={a.id} value={business.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Ex.: Seg. a sex., 8h às 18h" />}
        </Field>
        <Field label="Endereço" optional error={errors.address} className="sm:col-span-2">
          {(a) => <Input id={a.id} value={business.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />}
        </Field>
      </fieldset>

      <details className="rounded-lg border border-line bg-ink-900/60 p-4">
        <summary className="cursor-pointer text-sm font-medium text-fg">Redes sociais (opcional)</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(Object.keys(business.social) as SocialNetwork[]).map((network) => (
            <Field key={network} label={SOCIAL_LABELS[network]} optional error={errors[`social.${network}`]}>
              {(a) => (
                <Input
                  id={a.id}
                  value={business.social[network]}
                  onChange={(e) => set("social", { ...business.social, [network]: e.target.value })}
                  placeholder={network === "website" ? "https://..." : "@usuario ou URL"}
                />
              )}
            </Field>
          ))}
        </div>
      </details>
    </div>
  );
}
