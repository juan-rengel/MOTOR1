"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { Box } from "lucide-react";
import type { SceneSettings } from "@/domain/scene";
import { subscribeNever, supportsWebGL } from "@/features/animations/device";
import { useMotion } from "@/features/animations/motion-context";
import { SiteImage } from "@/features/site-renderer/primitives/site-image";
import { cn } from "@/lib/cn";
import { LAZY_SCENES } from "./lazy-scenes";
import { SCENES } from "./registry";
import { SceneErrorBoundary } from "./scene-error-boundary";
import type { CameraKey } from "./shared/camera-rig";

/**
 * Hospeda uma cena 3D em qualquer seção:
 * - Mostra a imagem substituta imediatamente (sem tela vazia, sem salto de layout).
 * - Só baixa three.js e a cena quando a área está perto da tela.
 * - Pausa a renderização quando sai da tela; libera recursos ao desmontar.
 * - Cai para a imagem se não houver WebGL, se a cena falhar ou em aparelhos fracos
 *   (nesse caso o visitante pode pedir "Ver em 3D").
 */
export function SceneHost({
  settings,
  progress,
  background,
  className,
  eventSource,
  showDiagnostics = false,
  cameraOverride,
}: {
  cameraOverride?: CameraKey;
  settings: SceneSettings;
  progress: RefObject<number>;
  background: string;
  className?: string;
  eventSource?: RefObject<HTMLElement | null>;
  /** No editor: exibe o motivo quando a cena não é renderizada. */
  showDiagnostics?: boolean;
}) {
  const { tier, reducedMotion } = useMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  // null no servidor (desconhecido); no cliente, o suporte real a WebGL.
  const webgl = useSyncExternalStore<boolean | null>(subscribeNever, supportsWebGL, () => null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  // "Pronto" vale para uma combinação específica de cena + modelo; trocar a cena volta ao estado de carregamento.
  const sceneKey = `${settings.sceneId}|${settings.modelSrc}`;
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const ready = readyKey === sceneKey;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nearObserver = new IntersectionObserver(([e]) => e?.isIntersecting && setNear(true), { rootMargin: "400px 0px" });
    const visibleObserver = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), { rootMargin: "50px 0px" });
    nearObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  const definition = SCENES[settings.sceneId];
  const LazyScene = LAZY_SCENES[settings.sceneId];
  const onReady = useCallback(() => setReadyKey(sceneKey), [sceneKey]);

  const needsModel = definition.requiresModel && !settings.modelSrc;
  const lowAuto = settings.quality === "auto" && tier === "low";
  let blockedReason: string | null = null;
  if (!settings.enabled) blockedReason = "Cena 3D desativada.";
  else if (webgl === false) blockedReason = "Este navegador não oferece WebGL — exibindo a imagem substituta.";
  else if (needsModel) blockedReason = "Selecione um modelo GLB para esta cena.";
  else if (lowAuto && !forceLoad) blockedReason = "Aparelho com pouca capacidade gráfica — exibindo a imagem substituta.";
  const shouldRender = blockedReason === null && webgl === true && near;

  return (
    <div ref={containerRef} className={cn("relative size-full overflow-hidden", className)} data-scene={settings.sceneId} data-scene-ready={ready || undefined}>
      <SiteImage image={settings.fallbackImage} priority className={cn("absolute inset-0 transition-opacity duration-1000", ready && "opacity-0")} />
      {shouldRender && (
        <SceneErrorBoundary
          resetKey={sceneKey}
          fallback={(error) =>
            showDiagnostics ? (
              <p className="absolute top-24 left-4 z-10 rounded bg-black/70 px-3 py-2 text-xs text-white">Falha na cena 3D: {error.message}</p>
            ) : null
          }
        >
          <Suspense fallback={null}>
            <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
              <LazyScene settings={settings} progress={progress} background={background} tier={tier} reducedMotion={reducedMotion} visible={visible} onReady={onReady} eventSource={eventSource} cameraOverride={cameraOverride} />
            </div>
          </Suspense>
        </SceneErrorBoundary>
      )}
      {shouldRender && !ready && (
        <span className="absolute right-4 bottom-4 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[11px] text-white/80 backdrop-blur" role="status">
          <span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
          Carregando cena 3D
        </span>
      )}
      {lowAuto && !forceLoad && settings.enabled && webgl && !needsModel && (
        <button
          type="button"
          onClick={() => setForceLoad(true)}
          className="absolute right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur"
        >
          <Box className="size-4" aria-hidden /> Ver em 3D
        </button>
      )}
      {showDiagnostics && blockedReason && settings.enabled && (
        <p className="absolute top-24 left-4 z-10 max-w-xs rounded bg-black/70 px-3 py-2 text-xs text-white">{blockedReason}</p>
      )}
    </div>
  );
}
