import type { SegmentId } from "@/domain/business";
import { fashionTemplate } from "./fashion";
import { mechanicTemplate } from "./mechanic";
import { opticsTemplate } from "./optics";
import type { TemplateDefinition } from "./types";

/**
 * Registro de modelos. Para adicionar um modelo: criar o arquivo em
 * features/templates/<nome>.ts e incluí-lo nesta lista.
 */
export const TEMPLATES: readonly TemplateDefinition[] = [mechanicTemplate, opticsTemplate, fashionTemplate];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/** Modelos ordenados: primeiro os desenhados para o segmento. */
export function templatesForSegment(segment: SegmentId): { recommended: TemplateDefinition[]; others: TemplateDefinition[] } {
  const recommended = TEMPLATES.filter((t) => t.segments.includes(segment));
  const others = TEMPLATES.filter((t) => !t.segments.includes(segment));
  return { recommended, others };
}
