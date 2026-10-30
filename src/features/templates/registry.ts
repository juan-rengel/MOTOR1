import type { SegmentId } from "@/domain/business";
import { essentialTemplate } from "./essential";
import { fashionTemplate } from "./fashion";
import { mechanicTemplate } from "./mechanic";
import { opticsTemplate } from "./optics";
import type { TemplateDefinition } from "./types";

/**
 * Registro de modelos. Para adicionar um modelo: criar o arquivo em
 * features/templates/<nome>.ts e incluí-lo nesta lista (novos modelos entram no fim).
 */
export const TEMPLATES: readonly TemplateDefinition[] = [mechanicTemplate, opticsTemplate, fashionTemplate, essentialTemplate];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function isUniversalTemplate(template: TemplateDefinition): boolean {
  return template.kind === "universal";
}

/**
 * Um modelo dedicado só pode ser usado nos segmentos para os quais foi desenhado
 * (ele traz textos, imagens e cena 3D do segmento). Modelos universais servem a todos.
 */
export function isTemplateCompatible(template: TemplateDefinition, segment: SegmentId): boolean {
  return isUniversalTemplate(template) || template.segments.includes(segment);
}

/**
 * Modelos oferecidos para um segmento:
 * - recommended: os dedicados ao segmento; se não houver, os universais;
 * - others: os universais, como alternativa, quando o segmento já tem modelo dedicado.
 * Modelos dedicados a outros segmentos nunca são oferecidos.
 */
export function templatesForSegment(segment: SegmentId): { recommended: TemplateDefinition[]; others: TemplateDefinition[] } {
  const dedicated = TEMPLATES.filter((t) => !isUniversalTemplate(t) && t.segments.includes(segment));
  const universal = TEMPLATES.filter(isUniversalTemplate);
  return dedicated.length > 0 ? { recommended: dedicated, others: universal } : { recommended: universal, others: [] };
}

/** Segmentos que já têm modelo dedicado. */
export function hasDedicatedTemplate(segment: SegmentId): boolean {
  return TEMPLATES.some((t) => !isUniversalTemplate(t) && t.segments.includes(segment));
}
