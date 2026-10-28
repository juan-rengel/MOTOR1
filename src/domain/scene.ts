import { z } from "zod";
import { hexColorSchema, imageRefSchema, mediaSrcSchema } from "./primitives";

export const SCENE_IDS = ["garage-car", "eyewear", "sneaker", "silk-flow", "custom-model"] as const;
export const sceneIdSchema = z.enum(SCENE_IDS);
export type SceneId = z.infer<typeof sceneIdSchema>;

export const sceneSchema = z.object({
  enabled: z.boolean(),
  sceneId: sceneIdSchema,
  /** scroll: câmera acompanha a rolagem; orbit: giro contínuo lento; static: câmera fixa. */
  cameraMotion: z.enum(["scroll", "orbit", "static"]),
  /** Permite girar/inclinar o objeto com mouse ou toque. */
  interactive: z.boolean(),
  quality: z.enum(["auto", "low", "high"]),
  primaryColor: hexColorSchema,
  accentColor: hexColorSchema,
  environment: z.enum(["studio", "night", "warm"]),
  /** Imagem exibida quando o 3D está desativado, sem suporte ou carregando. */
  fallbackImage: imageRefSchema,
  /** Modelo GLB próprio (usado pela cena "custom-model"). */
  modelSrc: mediaSrcSchema,
  /**
   * Variação visual própria de cada cena (ex.: formato da armação na vitrine de óculos).
   * Padrão vazio mantém projetos gravados antes deste campo válidos.
   */
  variant: z.string().max(30).regex(/^[a-z0-9-]*$/).default(""),
});
export type SceneSettings = z.infer<typeof sceneSchema>;
