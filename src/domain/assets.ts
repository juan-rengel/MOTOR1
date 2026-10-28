import { z } from "zod";

export const ASSET_KINDS = ["image", "video", "model", "logo", "texture", "icon", "font", "other"] as const;
export const assetKindSchema = z.enum(ASSET_KINDS);
export type AssetKind = z.infer<typeof assetKindSchema>;

export const ASSET_KIND_LABELS: Record<AssetKind, string> = {
  image: "Imagens",
  video: "Vídeos",
  model: "Modelos 3D",
  logo: "Logotipos",
  texture: "Texturas",
  icon: "Ícones",
  font: "Fontes",
  other: "Outros",
};

export const assetRecordSchema = z.object({
  id: z.string().min(1).max(64),
  ownerId: z.string().max(128),
  kind: assetKindSchema,
  name: z.string().trim().min(1).max(120),
  /** Caminho servido ao navegador (local) — nunca um caminho do disco. */
  src: z.string().max(600),
  mimeType: z.string().max(80),
  size: z.number().int().nonnegative(),
  alt: z.string().max(240),
  license: z.string().max(300),
  /** demo: incluído no projeto; upload: enviado nesta instalação. */
  source: z.enum(["demo", "upload"]),
  createdAt: z.string().max(40),
});
export type AssetRecord = z.infer<typeof assetRecordSchema>;

export const uploadMetadataSchema = z.object({
  kind: z.enum(["image", "video", "model", "logo", "texture"]),
  name: z.string().trim().min(1, "Informe um nome.").max(120),
  alt: z.string().trim().max(240),
  license: z.string().trim().max(300),
});
export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;
