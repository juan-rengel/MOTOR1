import { z } from "zod";

export const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const hexColorSchema = z.string().regex(HEX_COLOR_PATTERN, "Use uma cor no formato #RRGGBB.");

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugSchema = z
  .string()
  .min(1)
  .max(48)
  .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens.");

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const uuidSchema = z.string().regex(UUID_PATTERN, "Identificador inválido.");

/** Identificador curto usado em seções e itens (gerado pelo sistema). */
export const shortIdSchema = z.string().regex(/^[a-z0-9]{6,24}$/, "Identificador inválido.");

/**
 * Mídia aceita pelos sites:
 * - caminho da própria origem (ex.: /assets/demo/carro.jpg, /api/assets/<id>/file)
 * - URL https externa
 * - vazio (sem mídia)
 * Bloqueia esquemas perigosos (javascript:, data:, file:) e travessia de diretórios.
 */
export function isSafeMediaSrc(value: string): boolean {
  if (value === "") return true;
  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.includes("..") && !value.includes("\\");
  }
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const mediaSrcSchema = z
  .string()
  .max(600)
  .refine(isSafeMediaSrc, "Use um caminho local (/...) ou uma URL https.");

export const imageRefSchema = z.object({
  src: mediaSrcSchema,
  alt: z.string().max(240),
});
export type ImageRef = z.infer<typeof imageRefSchema>;

export const videoRefSchema = z.object({
  src: mediaSrcSchema,
  poster: mediaSrcSchema,
});
export type VideoRef = z.infer<typeof videoRefSchema>;

/**
 * Links que um visitante pode seguir. Aceita âncoras internas, caminhos locais,
 * http(s), mailto e tel. Bloqueia javascript:, data: e similares.
 */
export function isSafeHref(value: string): boolean {
  const v = value.trim();
  if (v === "") return false;
  if (v.startsWith("#")) return /^#[a-z0-9-]+$/.test(v);
  if (v.startsWith("/")) return !v.startsWith("//") && !v.includes("\\");
  try {
    const url = new URL(v);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export const text = (max: number) => z.string().max(max);
