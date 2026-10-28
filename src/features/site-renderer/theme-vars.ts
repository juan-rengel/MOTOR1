import type { CSSProperties } from "react";
import { FONTS } from "@/config/fonts";
import type { SiteTheme } from "@/domain/theme";

const RADIUS = {
  sharp: { base: "2px", lg: "4px", button: "2px" },
  soft: { base: "10px", lg: "18px", button: "10px" },
  round: { base: "16px", lg: "28px", button: "999px" },
} as const;

/** Converte o tema do projeto em variáveis CSS consumidas pelas classes "site-*". */
export function themeToCssVars(theme: SiteTheme): CSSProperties {
  const r = RADIUS[theme.radius];
  return {
    "--site-bg": theme.colors.background,
    "--site-surface": theme.colors.surface,
    "--site-text": theme.colors.text,
    "--site-muted": theme.colors.muted,
    "--site-primary": theme.colors.primary,
    "--site-on-primary": theme.colors.onPrimary,
    "--site-accent": theme.colors.accent,
    "--site-border": theme.colors.border,
    "--site-font-heading": FONTS[theme.fonts.heading].family,
    "--site-font-body": FONTS[theme.fonts.body].family,
    "--site-radius": r.base,
    "--site-radius-lg": r.lg,
    "--site-radius-button": r.button,
    "--site-heading-case": theme.headingCase === "uppercase" ? "uppercase" : "none",
    "--site-heading-tracking": theme.headingCase === "uppercase" ? "0.01em" : "-0.02em",
    colorScheme: theme.mode,
  } as CSSProperties;
}
