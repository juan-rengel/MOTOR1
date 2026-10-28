import { lazy } from "react";
import { SCENE_IDS, type SceneId } from "@/domain/scene";
import { SCENES } from "./registry";

/**
 * Componentes de cena carregados sob demanda, criados uma única vez no módulo
 * (cada cena vira um pedaço de código separado, baixado só quando usado).
 */
export const LAZY_SCENES = Object.fromEntries(SCENE_IDS.map((id) => [id, lazy(SCENES[id].load)])) as Record<
  SceneId,
  ReturnType<typeof lazy<React.ComponentType<import("./types").SceneComponentProps>>>
>;
