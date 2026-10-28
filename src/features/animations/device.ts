/**
 * Detecção de capacidade do dispositivo (somente no navegador).
 * "low": reduz efeitos (sem parallax pesado, 3D em baixa resolução ou desativado).
 */
export type DeviceTier = "high" | "medium" | "low";

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

let cachedTier: DeviceTier | null = null;

/** Nível do dispositivo (calculado uma vez por carregamento). */
export function detectDeviceTier(): DeviceTier {
  if (typeof navigator === "undefined") return "medium";
  cachedTier ??= computeTier();
  return cachedTier;
}

function computeTier(): DeviceTier {
  const nav = navigator as NavigatorWithHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData === true;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  if (saveData || slowNet || cores <= 2 || memory <= 2) return "low";
  const smallScreen = typeof window !== "undefined" && Math.min(window.screen.width, window.screen.height) < 500;
  if (cores <= 4 || memory <= 4 || smallScreen) return "medium";
  return "high";
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

let webglSupport: boolean | null = null;

/** Verifica suporte a WebGL criando um contexto temporário (resultado em cache). */
export function supportsWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    webglSupport = gl !== null;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** Assinatura para useSyncExternalStore: notifica quando a preferência de movimento muda. */
export function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/** Para valores que não mudam durante a sessão (WebGL, nível do aparelho). */
export function subscribeNever(): () => void {
  return () => undefined;
}
