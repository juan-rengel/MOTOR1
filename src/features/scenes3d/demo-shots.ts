import type { SceneSettings } from "@/domain/scene";
import type { CameraKey } from "./shared/camera-rig";

/**
 * Enquadramentos usados para gerar as imagens de demonstração dos modelos
 * a partir das próprias cenas 3D (script: npm run assets:demo).
 * As imagens resultantes são produzidas por este projeto — sem licenças de terceiros.
 */
export interface DemoShot {
  id: string;
  /** Caminho relativo a public/. */
  file: string;
  width: number;
  height: number;
  background: string;
  scene: Partial<SceneSettings> & Pick<SceneSettings, "sceneId">;
  camera: CameraKey;
}

const garage = (overrides: Partial<SceneSettings> = {}) => ({ sceneId: "garage-car" as const, primaryColor: "#b3121b", accentColor: "#ffb547", environment: "studio" as const, ...overrides });

export const DEMO_SHOTS: DemoShot[] = [
  { id: "mech-hero", file: "assets/demo/mechanic/hero-poster.jpg", width: 1600, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 38, elevation: 9, radius: 10.2, target: [0, 0.55, 0], fov: 30, shift: -5.5 } },
  { id: "mech-front", file: "assets/demo/mechanic/car-front.jpg", width: 1200, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 24, elevation: 6, radius: 7.4, target: [0.5, 0.55, 0], fov: 30 } },
  { id: "mech-side", file: "assets/demo/mechanic/car-side.jpg", width: 1200, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 90, elevation: 4, radius: 9.2, target: [0, 0.6, 0], fov: 30 } },
  { id: "mech-rear", file: "assets/demo/mechanic/car-rear.jpg", width: 1200, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 148, elevation: 9, radius: 7.8, target: [-0.4, 0.55, 0], fov: 30 } },
  { id: "mech-wheel", file: "assets/demo/mechanic/wheel.jpg", width: 1200, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 76, elevation: 5, radius: 2.9, target: [1.4, 0.38, 0.83], fov: 30 } },
  { id: "mech-headlight", file: "assets/demo/mechanic/headlight.jpg", width: 1600, height: 900, background: "#0a0b0d", scene: garage(), camera: { azimuth: 34, elevation: 5, radius: 1.7, target: [2.2, 0.6, 0.42], fov: 26 } },
  { id: "mech-top", file: "assets/demo/mechanic/car-top.jpg", width: 900, height: 1125, background: "#0a0b0d", scene: garage(), camera: { azimuth: 125, elevation: 48, radius: 14, target: [0, 0.4, 0], fov: 30 } },
];

export function getDemoShot(id: string) {
  return DEMO_SHOTS.find((s) => s.id === id);
}
