import type { RefObject } from "react";
import type { SceneSettings } from "@/domain/scene";
import type { DeviceTier } from "@/features/animations/device";
import type { CameraKey } from "./shared/camera-rig";

/** Propriedades que toda cena 3D recebe do SceneHost. */
export interface SceneComponentProps {
  settings: SceneSettings;
  /** Progresso 0..1 (rolagem da seção). Lido a cada quadro, sem re-renderizar o React. */
  progress: RefObject<number>;
  /** Cor de fundo do site, usada para fundir névoa e chão com a página. */
  background: string;
  tier: DeviceTier;
  reducedMotion: boolean;
  /** Falso quando a área está fora da tela: a cena deve pausar a renderização. */
  visible: boolean;
  /** Chamado quando o primeiro quadro estiver pronto (para esmaecer a imagem substituta). */
  onReady: () => void;
  /** Elemento que recebe eventos de ponteiro (permite interação com textos por cima). */
  eventSource?: RefObject<HTMLElement | null>;
  /** Enquadramento fixo (usado para gerar imagens de demonstração). */
  cameraOverride?: CameraKey;
}

export interface SceneDefinition {
  id: SceneSettings["sceneId"];
  label: string;
  description: string;
  /** Rótulos dos "momentos" de câmera, na ordem, para orientar os capítulos. */
  cameraMoments: string[];
  /** Exige um modelo GLB informado pelo usuário. */
  requiresModel: boolean;
  load: () => Promise<{ default: React.ComponentType<SceneComponentProps> }>;
}
