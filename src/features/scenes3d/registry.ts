import type { SceneId } from "@/domain/scene";
import type { SceneDefinition } from "./types";

/**
 * Registro de cenas 3D. Cada cena é carregada sob demanda (code splitting):
 * páginas sem 3D não baixam three.js.
 */
export const SCENES: Record<SceneId, SceneDefinition> = {
  "garage-car": {
    id: "garage-car",
    label: "Carro em estúdio",
    description: "Carro esportivo procedural com iluminação de estúdio, reflexos e câmera cinematográfica.",
    cameraMoments: ["Três-quartos frontal", "Farol", "Roda e freio", "Traseira", "Visão aérea"],
    requiresModel: false,
    load: () => import("./scenes/garage-car/garage-car-scene"),
  },
  eyewear: {
    id: "eyewear",
    label: "Vitrine de óculos",
    description: "Armação procedural com lentes de vidro sobre pedestal de vitrine.",
    cameraMoments: ["Três-quartos", "Frontal", "Detalhe da haste", "Vista traseira"],
    requiresModel: false,
    variants: [
      { id: "square", label: "Armação quadrada" },
      { id: "round", label: "Armação redonda" },
      { id: "cat", label: "Armação gatinho" },
      { id: "aviator", label: "Aviador (lentes escuras)" },
    ],
    load: () => import("./scenes/eyewear/eyewear-scene"),
  },
  sneaker: {
    id: "sneaker",
    label: "Tênis em destaque",
    description: "Tênis procedural flutuando sobre pedestal iluminado, com cores configuráveis.",
    cameraMoments: ["Três-quartos", "Perfil", "Bico", "Vista superior"],
    requiresModel: false,
    load: () => import("./scenes/sneaker/sneaker-scene"),
  },
  "silk-flow": {
    id: "silk-flow",
    label: "Tecido em movimento",
    description: "Tecido acetinado ondulando com brilho de seda — ideal para moda.",
    cameraMoments: ["Panorâmica", "Detalhe", "Dobra", "Abertura"],
    requiresModel: false,
    load: () => import("./scenes/silk-flow/silk-flow-scene"),
  },
  "custom-model": {
    id: "custom-model",
    label: "Modelo próprio (GLB)",
    description: "Apresenta um modelo 3D GLB enviado à biblioteca de recursos, com iluminação de estúdio.",
    cameraMoments: ["Frontal", "Lateral", "Traseira", "Aérea"],
    requiresModel: true,
    load: () => import("./scenes/custom-model/custom-model-scene"),
  },
};

export const SCENE_LIST = Object.values(SCENES);
