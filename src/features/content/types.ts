import { z } from "zod";
import { businessSchema } from "@/domain/business";
import { visualStyleIdSchema } from "@/domain/theme";

/**
 * Contrato da camada de geração de conteúdo.
 * Provedores possíveis: regras locais (hoje) e serviços de IA (FASE 8).
 * A interface do editor só conhece este contrato.
 */
export const CONTENT_TASKS = ["hero", "seo", "cta", "about", "services"] as const;
export const contentTaskSchema = z.enum(CONTENT_TASKS);
export type ContentTask = z.infer<typeof contentTaskSchema>;

export const contentRequestSchema = z.object({
  task: contentTaskSchema,
  business: businessSchema,
  style: visualStyleIdSchema,
});
export type ContentRequest = z.infer<typeof contentRequestSchema>;

export interface ContentProviderInfo {
  id: string;
  label: string;
  /** "rules": texto montado por regras determinísticas (sem IA). "ai": modelo de linguagem. */
  kind: "rules" | "ai";
}

/** Cada variante é um conjunto de campos de texto (ex.: { title, subtitle }). */
export type ContentVariant = Record<string, string>;

export interface ContentSuggestion {
  task: ContentTask;
  provider: ContentProviderInfo;
  variants: ContentVariant[];
  /** Aviso exibido junto às sugestões (ex.: "gerado por regras locais, sem IA"). */
  notice: string;
}

export interface ContentGenerator {
  readonly info: ContentProviderInfo;
  generate(request: ContentRequest): Promise<ContentSuggestion>;
}
