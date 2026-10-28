import type { AssetKind } from "@/domain/assets";

/**
 * Identificação do tipo REAL do arquivo pelos primeiros bytes ("assinatura"),
 * sem confiar na extensão nem no tipo informado pelo navegador.
 * SVG, HTML e executáveis não são aceitos (SVG pode conter scripts).
 */
export interface DetectedType {
  mime: string;
  ext: string;
  family: "image" | "video" | "model";
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function detectFileType(bytes: Uint8Array): DetectedType | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") return { mime: "image/png", ext: "png", family: "image" };
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg", family: "image" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") return { mime: "image/webp", ext: "webp", family: "image" };
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") return { mime: "image/avif", ext: "avif", family: "image" };
    if (["isom", "iso2", "mp41", "mp42", "avc1", "M4V ", "dash"].includes(brand)) return { mime: "video/mp4", ext: "mp4", family: "video" };
  }
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return { mime: "video/webm", ext: "webm", family: "video" };
  if (ascii(bytes, 0, 4) === "glTF") return { mime: "model/gltf-binary", ext: "glb", family: "model" };
  return null;
}

const MB = 1024 * 1024;

/** Limites por família de arquivo (fase local). */
export const SIZE_LIMITS: Record<DetectedType["family"], number> = {
  image: 10 * MB,
  video: 60 * MB,
  model: 25 * MB,
};

/** Quais famílias cada categoria aceita. */
export const KIND_ACCEPTS: Partial<Record<AssetKind, DetectedType["family"][]>> = {
  image: ["image"],
  logo: ["image"],
  texture: ["image"],
  video: ["video"],
  model: ["model"],
};

export const ACCEPT_ATTRIBUTE: Partial<Record<AssetKind, string>> = {
  image: "image/png,image/jpeg,image/webp,image/avif",
  logo: "image/png,image/jpeg,image/webp,image/avif",
  texture: "image/png,image/jpeg,image/webp",
  video: "video/mp4,video/webm",
  model: ".glb,model/gltf-binary",
};

export type FileCheck = { ok: true; type: DetectedType } | { ok: false; reason: string };

export function checkUpload(kind: AssetKind, bytes: Uint8Array, size: number): FileCheck {
  const type = detectFileType(bytes);
  if (!type) return { ok: false, reason: "Formato não suportado. Use PNG, JPG, WEBP, AVIF, MP4, WEBM ou GLB." };
  const accepted = KIND_ACCEPTS[kind] ?? [];
  if (!accepted.includes(type.family)) {
    return { ok: false, reason: `Este arquivo (${type.ext.toUpperCase()}) não corresponde à categoria escolhida.` };
  }
  if (size > SIZE_LIMITS[type.family]) {
    return { ok: false, reason: `Arquivo muito grande. Limite: ${Math.round(SIZE_LIMITS[type.family] / MB)} MB.` };
  }
  if (size === 0) return { ok: false, reason: "Arquivo vazio." };
  return { ok: true, type };
}
