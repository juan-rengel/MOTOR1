import type { FontId } from "@/domain/theme";

export interface FontDefinition {
  id: FontId;
  label: string;
  /** Valor de font-family usado no CSS (as fontes são servidas localmente via @fontsource). */
  family: string;
  character: string;
}

export const FONTS: Record<FontId, FontDefinition> = {
  inter: { id: "inter", label: "Inter", family: "'Inter Variable', system-ui, sans-serif", character: "Neutra e legível" },
  manrope: { id: "manrope", label: "Manrope", family: "'Manrope Variable', system-ui, sans-serif", character: "Moderna e amigável" },
  "space-grotesk": {
    id: "space-grotesk",
    label: "Space Grotesk",
    family: "'Space Grotesk Variable', system-ui, sans-serif",
    character: "Tecnológica",
  },
  playfair: {
    id: "playfair",
    label: "Playfair Display",
    family: "'Playfair Display Variable', Georgia, serif",
    character: "Elegante, editorial",
  },
  oswald: { id: "oswald", label: "Oswald", family: "'Oswald Variable', Impact, sans-serif", character: "Condensada, impacto" },
};

export const FONT_OPTIONS = Object.values(FONTS);
