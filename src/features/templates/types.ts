import type { BusinessInfo, SegmentId } from "@/domain/business";
import type { SceneSettings } from "@/domain/scene";
import type { Section } from "@/domain/sections";
import type { SiteTheme, VisualStyleId } from "@/domain/theme";
import type { CopyPack } from "@/features/content/copy-packs";
import type { SegmentDefinition } from "@/config/segments";

export interface TemplateContext {
  business: BusinessInfo;
  style: VisualStyleId;
  segment: SegmentDefinition;
  copy: CopyPack;
}

export type ThemeTweak = Partial<Omit<SiteTheme, "colors" | "fonts">> & {
  colors?: Partial<SiteTheme["colors"]>;
  fonts?: Partial<SiteTheme["fonts"]>;
};

/**
 * Definição de um modelo (template). Cada modelo compartilha os componentes
 * de seção e o motor de animação/3D, mas define estrutura, conteúdo inicial,
 * ajustes visuais e cena 3D próprios.
 */
export interface TemplateDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /**
   * "dedicated" (padrão): desenhado para os segmentos de `segments` e só aceito neles.
   * "universal": base neutra aceita em qualquer segmento (sem conteúdo de um segmento específico).
   */
  kind?: "dedicated" | "universal";
  /** Segmentos para os quais o modelo foi desenhado (vazio em modelos universais). */
  segments: SegmentId[];
  defaultStyle: VisualStyleId;
  /** Recursos de destaque exibidos na escolha do modelo. */
  features: string[];
  preview: { src: string; alt: string };
  /** Ajustes de tema aplicados por estilo (ex.: cor da marca do segmento). */
  themeTweaks?: Partial<Record<VisualStyleId | "all", ThemeTweak>>;
  scene: (ctx: TemplateContext) => SceneSettings;
  buildSections: (ctx: TemplateContext) => Section[];
  /** Dados de um negócio fictício usados nas demonstrações públicas do modelo. */
  demoBusiness: BusinessInfo;
}
