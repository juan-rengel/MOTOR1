import type { MotionLevel } from "@/domain/motion";
import type { SiteTheme, VisualStyleId } from "@/domain/theme";

export interface VisualStyleDefinition {
  id: VisualStyleId;
  label: string;
  description: string;
  theme: SiteTheme;
  motionLevel: MotionLevel;
}

/**
 * Estilos visuais. Cada estilo define uma identidade completa (cores, fontes,
 * cantos, granulação) e o nível de movimento padrão. Modelos podem ajustar o
 * resultado (ver templates/*), e o usuário pode editar tudo no editor.
 */
export const VISUAL_STYLES: Record<VisualStyleId, VisualStyleDefinition> = {
  cinematic: {
    id: "cinematic",
    label: "Cinematográfico",
    description: "Escuro, contrastado, com granulação de filme e movimento marcante.",
    motionLevel: "cinematic",
    theme: {
      mode: "dark",
      colors: {
        background: "#0a0b0d",
        surface: "#15171b",
        text: "#f3f1ec",
        muted: "#a3a19c",
        primary: "#e8b04a",
        onPrimary: "#111111",
        accent: "#ff6a3d",
        border: "#2a2d33",
      },
      fonts: { heading: "oswald", body: "inter" },
      radius: "sharp",
      headingCase: "uppercase",
      grain: true,
    },
  },
  luxury: {
    id: "luxury",
    label: "Luxuoso",
    description: "Preto profundo com dourado, serifas elegantes e ritmo calmo.",
    motionLevel: "balanced",
    theme: {
      mode: "dark",
      colors: {
        background: "#0d0c0a",
        surface: "#191712",
        text: "#f4efe6",
        muted: "#aaa190",
        primary: "#c9a96e",
        onPrimary: "#14110b",
        accent: "#e9dcc3",
        border: "#2f2a22",
      },
      fonts: { heading: "playfair", body: "manrope" },
      radius: "sharp",
      headingCase: "normal",
      grain: true,
    },
  },
  modern: {
    id: "modern",
    label: "Moderno",
    description: "Claro, limpo, azul confiante e cantos arredondados.",
    motionLevel: "balanced",
    theme: {
      mode: "light",
      colors: {
        background: "#f6f7f9",
        surface: "#ffffff",
        text: "#0f1720",
        muted: "#55606e",
        primary: "#2563eb",
        onPrimary: "#ffffff",
        accent: "#0ea5e9",
        border: "#e1e6ee",
      },
      fonts: { heading: "manrope", body: "inter" },
      radius: "round",
      headingCase: "normal",
      grain: false,
    },
  },
  minimal: {
    id: "minimal",
    label: "Minimalista",
    description: "Muito espaço em branco, tipografia neutra, quase sem efeitos.",
    motionLevel: "subtle",
    theme: {
      mode: "light",
      colors: {
        background: "#fafaf8",
        surface: "#ffffff",
        text: "#161616",
        muted: "#646464",
        primary: "#161616",
        onPrimary: "#fafaf8",
        accent: "#a8916f",
        border: "#e6e4df",
      },
      fonts: { heading: "inter", body: "inter" },
      radius: "sharp",
      headingCase: "normal",
      grain: false,
    },
  },
  industrial: {
    id: "industrial",
    label: "Industrial",
    description: "Grafite, laranja de sinalização e tipografia condensada.",
    motionLevel: "balanced",
    theme: {
      mode: "dark",
      colors: {
        background: "#111213",
        surface: "#1c1e20",
        text: "#ececec",
        muted: "#9a9fa4",
        primary: "#f97316",
        onPrimary: "#111111",
        accent: "#facc15",
        border: "#2e3134",
      },
      fonts: { heading: "oswald", body: "inter" },
      radius: "sharp",
      headingCase: "uppercase",
      grain: true,
    },
  },
  tech: {
    id: "tech",
    label: "Tecnológico",
    description: "Azul noturno, ciano elétrico e tipografia geométrica.",
    motionLevel: "cinematic",
    theme: {
      mode: "dark",
      colors: {
        background: "#05080c",
        surface: "#0d141c",
        text: "#e6f1ff",
        muted: "#8697ab",
        primary: "#22d3ee",
        onPrimary: "#031015",
        accent: "#a78bfa",
        border: "#1a2633",
      },
      fonts: { heading: "space-grotesk", body: "inter" },
      radius: "soft",
      headingCase: "normal",
      grain: false,
    },
  },
  elegant: {
    id: "elegant",
    label: "Elegante",
    description: "Tons quentes de papel, serifas e acabamento editorial.",
    motionLevel: "subtle",
    theme: {
      mode: "light",
      colors: {
        background: "#f5f1ea",
        surface: "#fffdf9",
        text: "#1f1b16",
        muted: "#6a6155",
        primary: "#6b4f3a",
        onPrimary: "#ffffff",
        accent: "#a8855a",
        border: "#e4dbcd",
      },
      fonts: { heading: "playfair", body: "manrope" },
      radius: "soft",
      headingCase: "normal",
      grain: false,
    },
  },
  vibrant: {
    id: "vibrant",
    label: "Vibrante",
    description: "Cores intensas, energia e contrastes ousados.",
    motionLevel: "balanced",
    theme: {
      mode: "light",
      colors: {
        background: "#fff8f1",
        surface: "#ffffff",
        text: "#1a1023",
        muted: "#64566f",
        primary: "#e11d48",
        onPrimary: "#ffffff",
        accent: "#7c3aed",
        border: "#f0e1d6",
      },
      fonts: { heading: "space-grotesk", body: "manrope" },
      radius: "round",
      headingCase: "normal",
      grain: false,
    },
  },
};

export const VISUAL_STYLE_LIST = Object.values(VISUAL_STYLES);
