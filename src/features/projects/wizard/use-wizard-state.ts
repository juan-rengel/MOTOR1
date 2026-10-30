"use client";

import { useState } from "react";
import { getSegment } from "@/config/segments";
import { businessSchema, emptySocialLinks, type BusinessInfo, type SegmentId } from "@/domain/business";
import type { VisualStyleId } from "@/domain/theme";
import { normalizePhone } from "@/lib/phone";
import { templatesForSegment } from "@/features/templates/registry";

export const WIZARD_STEPS = [
  { id: "business", label: "Negócio" },
  { id: "style", label: "Estilo visual" },
  { id: "template", label: "Modelo" },
  { id: "review", label: "Revisão" },
] as const;
export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export type FieldErrors = Partial<Record<string, string>>;

export function emptyBusiness(segment: SegmentId = "mechanic"): BusinessInfo {
  return {
    name: "",
    segment,
    city: "",
    description: "",
    offerings: [],
    audience: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    hours: "",
    social: emptySocialLinks(),
    goal: getSegment(segment).defaultGoal,
  };
}

/** Valida os dados do negócio com o mesmo schema usado no servidor + regras de telefone. */
export function validateBusiness(business: BusinessInfo): FieldErrors {
  const errors: FieldErrors = {};
  const parsed = businessSchema.safeParse(business);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      errors[key] ??= issue.message;
    }
  }
  for (const key of ["whatsapp", "phone"] as const) {
    if (business[key].trim() && !errors[key]) {
      const result = normalizePhone(business[key]);
      if (!result.ok) errors[key] = result.reason;
    }
  }
  return errors;
}

export function useWizardState(initialSegment?: SegmentId) {
  const [step, setStep] = useState<WizardStepId>("business");
  const [business, setBusiness] = useState<BusinessInfo>(() => emptyBusiness(initialSegment));
  const [style, setStyle] = useState<VisualStyleId>(() => getSegment(initialSegment ?? "mechanic").suggestedStyles[0] ?? "cinematic");
  const [templateId, setTemplateId] = useState<string | null>(null);

  function changeSegment(segment: SegmentId) {
    const def = getSegment(segment);
    setBusiness((b) => ({ ...b, segment, goal: def.defaultGoal }));
    setStyle(def.suggestedStyles[0] ?? "modern");
    setTemplateId(null);
  }

  const { recommended, others } = templatesForSegment(business.segment);
  // Só vale uma escolha oferecida para o segmento atual (o servidor recusa modelos de outros segmentos).
  const offered = [...recommended, ...others];
  const effectiveTemplateId = (templateId && offered.some((t) => t.id === templateId) ? templateId : null) ?? recommended[0]?.id ?? null;

  return {
    step,
    setStep,
    business,
    setBusiness,
    changeSegment,
    style,
    setStyle,
    templateId: effectiveTemplateId,
    setTemplateId,
    recommended,
    others,
  };
}
