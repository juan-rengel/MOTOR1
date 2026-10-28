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

/* ---------- Ótica ---------- */
const OPTICS_BG = "#f5f1ea";
const eyewear = (variant: string, primaryColor: string, overrides: Partial<SceneSettings> = {}) => ({ sceneId: "eyewear" as const, variant, primaryColor, accentColor: "#c9a96e", environment: "warm" as const, ...overrides });
const FRAME_CAM: CameraKey = { azimuth: 72, elevation: 9, radius: 4.4, target: [0, 0.05, 0.3], fov: 30 };
const frames: Array<[string, string, string]> = [
  ["square-black", "square", "#161616"],
  ["round-tortoise", "round", "#6b3f22"],
  ["cat-burgundy", "cat", "#6d1a2c"],
  ["aviator-gold", "aviator", "#161616"],
  ["square-crystal", "square", "#c9d3d6"],
  ["round-navy", "round", "#1d3b4f"],
];
DEMO_SHOTS.push(
  { id: "optics-hero", file: "assets/demo/optics/hero-poster.jpg", width: 1600, height: 900, background: OPTICS_BG, scene: eyewear("square", "#3b2a20"), camera: { azimuth: 62, elevation: 10, radius: 6.4, target: [0, -0.1, -0.3], fov: 30, shift: -8 } },
  ...frames.map(([name, variant, color]) => ({ id: `optics-${name}`, file: `assets/demo/optics/frame-${name}.jpg`, width: 900, height: 1125, background: "#efe9df", scene: eyewear(variant, color), camera: FRAME_CAM })),
  { id: "optics-detail-front", file: "assets/demo/optics/detail-front.jpg", width: 1200, height: 900, background: OPTICS_BG, scene: eyewear("cat", "#6d1a2c"), camera: { azimuth: 90, elevation: 4, radius: 2.7, target: [0, 0.1, 0.35], fov: 28 } },
  { id: "optics-detail-lens", file: "assets/demo/optics/detail-lens.jpg", width: 1200, height: 900, background: OPTICS_BG, scene: eyewear("round", "#6b3f22"), camera: { azimuth: 70, elevation: 14, radius: 1.8, target: [0.36, 0.1, 0.35], fov: 28 } },
  { id: "optics-detail-hinge", file: "assets/demo/optics/detail-hinge.jpg", width: 1200, height: 900, background: OPTICS_BG, scene: eyewear("square", "#161616"), camera: { azimuth: 52, elevation: 10, radius: 2.5, target: [0.5, 0.12, 0.15], fov: 28 } },
);

/* ---------- Moda: tecido ---------- */
const FASHION_BG = "#fff8f1";
const silk = (primaryColor: string, accentColor: string) => ({ sceneId: "silk-flow" as const, primaryColor, accentColor, environment: "studio" as const });
const SILK_CAM: CameraKey = { azimuth: 85, elevation: 40, radius: 3.6, target: [0.2, -0.2, 0], fov: 30 };
const fabrics: Array<[string, string, string]> = [
  ["rose", "#9d174d", "#f9a8d4"],
  ["navy", "#1e3a8a", "#93c5fd"],
  ["emerald", "#065f46", "#6ee7b7"],
  ["amber", "#b45309", "#fde68a"],
  ["black", "#111827", "#9ca3af"],
  ["pearl", "#e7e1d8", "#ffffff"],
];
DEMO_SHOTS.push(
  { id: "silk-hero", file: "assets/demo/fashion/silk-hero.jpg", width: 1600, height: 900, background: FASHION_BG, scene: silk("#9d174d", "#f9a8d4"), camera: { azimuth: 90, elevation: 8, radius: 7.2, target: [0, 0, 0], fov: 32, shift: -4 } },
  ...fabrics.map(([name, c, a]) => ({ id: `silk-${name}`, file: `assets/demo/fashion/silk-${name}.jpg`, width: 900, height: 1125, background: FASHION_BG, scene: silk(c, a), camera: SILK_CAM })),
  { id: "silk-look-1", file: "assets/demo/fashion/look-1.jpg", width: 1200, height: 900, background: FASHION_BG, scene: silk("#e8604c", "#fed7aa"), camera: { azimuth: 75, elevation: 34, radius: 3.4, target: [0.6, 0, 0], fov: 30 } },
  { id: "silk-look-2", file: "assets/demo/fashion/look-2.jpg", width: 1200, height: 900, background: "#0b1020", scene: silk("#1e1b4b", "#a5b4fc"), camera: { azimuth: 105, elevation: 30, radius: 3.8, target: [-0.4, -0.2, 0], fov: 30 } },
);

/* ---------- Moda: tênis ---------- */
const sneaker = (primaryColor: string, accentColor: string) => ({ sceneId: "sneaker" as const, primaryColor, accentColor, environment: "studio" as const });
const SNEAKER_CAM: CameraKey = { azimuth: 58, elevation: 14, radius: 8.4, target: [0, -0.1, 0], fov: 30 };
const colorways: Array<[string, string, string]> = [
  ["white-rose", "#f4f4f2", "#e11d48"],
  ["black-cyan", "#18181b", "#22d3ee"],
  ["navy-orange", "#1e2a4a", "#f97316"],
  ["sand-green", "#d6c3a5", "#15803d"],
  ["red-white", "#b91c1c", "#f8fafc"],
  ["grey-violet", "#9ca3af", "#7c3aed"],
];
DEMO_SHOTS.push(
  { id: "sneaker-hero", file: "assets/demo/fashion/sneaker-hero.jpg", width: 1600, height: 900, background: FASHION_BG, scene: sneaker("#f4f4f2", "#e11d48"), camera: { azimuth: 58, elevation: 12, radius: 6.4, target: [0, 0.1, 0], fov: 30, shift: -5 } },
  ...colorways.map(([name, c, a]) => ({ id: `sneaker-${name}`, file: `assets/demo/fashion/sneaker-${name}.jpg`, width: 900, height: 1125, background: "#f3ece4", scene: sneaker(c, a), camera: SNEAKER_CAM })),
  { id: "sneaker-detail", file: "assets/demo/fashion/sneaker-detail.jpg", width: 1200, height: 900, background: FASHION_BG, scene: sneaker("#18181b", "#22d3ee"), camera: { azimuth: 38, elevation: 14, radius: 4.6, target: [0.4, 0, 0], fov: 28 } },
  { id: "sneaker-top", file: "assets/demo/fashion/sneaker-top.jpg", width: 1200, height: 900, background: FASHION_BG, scene: sneaker("#d6c3a5", "#15803d"), camera: { azimuth: 125, elevation: 26, radius: 6.4, target: [0, -0.1, 0], fov: 30 } },
);

export function getDemoShot(id: string) {
  return DEMO_SHOTS.find((s) => s.id === id);
}
