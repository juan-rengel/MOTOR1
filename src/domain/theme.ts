import { z } from "zod";
import { hexColorSchema } from "./primitives";

export const FONT_IDS = ["inter", "manrope", "space-grotesk", "playfair", "oswald"] as const;
export const fontIdSchema = z.enum(FONT_IDS);
export type FontId = z.infer<typeof fontIdSchema>;

export const VISUAL_STYLE_IDS = [
  "cinematic",
  "luxury",
  "modern",
  "minimal",
  "industrial",
  "tech",
  "elegant",
  "vibrant",
] as const;
export const visualStyleIdSchema = z.enum(VISUAL_STYLE_IDS);
export type VisualStyleId = z.infer<typeof visualStyleIdSchema>;

export const themeColorsSchema = z.object({
  background: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
  muted: hexColorSchema,
  primary: hexColorSchema,
  onPrimary: hexColorSchema,
  accent: hexColorSchema,
  border: hexColorSchema,
});
export type ThemeColors = z.infer<typeof themeColorsSchema>;
export type ThemeColorKey = keyof ThemeColors;

export const themeSchema = z.object({
  mode: z.enum(["dark", "light"]),
  colors: themeColorsSchema,
  fonts: z.object({ heading: fontIdSchema, body: fontIdSchema }),
  radius: z.enum(["sharp", "soft", "round"]),
  headingCase: z.enum(["normal", "uppercase"]),
  /** Granulação de filme sobre a página (efeito cinematográfico leve). */
  grain: z.boolean(),
});
export type SiteTheme = z.infer<typeof themeSchema>;
