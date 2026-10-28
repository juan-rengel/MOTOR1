"use client";

import { Suspense, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import type { SceneSettings } from "@/domain/scene";
import type { DeviceTier } from "@/features/animations/device";

export interface RenderQuality {
  dpr: [number, number];
  shadows: boolean;
  reflections: boolean;
  particles: number;
}

export function resolveQuality(quality: SceneSettings["quality"], tier: DeviceTier): RenderQuality {
  const level = quality === "auto" ? tier : quality === "high" ? "high" : "low";
  if (level === "high") return { dpr: [1, 2], shadows: true, reflections: true, particles: 70 };
  if (level === "medium") return { dpr: [1, 1.5], shadows: false, reflections: false, particles: 40 };
  return { dpr: [1, 1], shadows: false, reflections: false, particles: 0 };
}

/** No modo sob demanda, desenha alguns quadros extras para reflexos/sombras se estabilizarem. */
function WarmupFrames({ count }: { count: number }) {
  const invalidate = useThree((state) => state.invalidate);
  const rendered = useRef(0);
  useFrame(() => {
    rendered.current += 1;
    if (rendered.current < count) invalidate();
  });
  useEffect(() => invalidate(), [invalidate]);
  return null;
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    // Aguarda dois quadros para garantir que a primeira imagem foi desenhada.
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(onReady);
    });
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

/**
 * Canvas WebGL padrão das cenas: tom de cor cinematográfico (ACES), resolução
 * limitada pelo nível do dispositivo, renderização pausada fora da tela e
 * redução automática de resolução quando a taxa de quadros cai.
 */
export function SceneCanvas({
  children,
  visible,
  quality,
  background,
  onReady,
  eventSource,
  cameraPosition = [6, 1.2, 6],
  fov = 30,
  renderOnDemand = false,
}: {
  /** Renderiza só quando necessário (captura de imagens): evita desenhar quadros contínuos. */
  renderOnDemand?: boolean;
  children: ReactNode;
  visible: boolean;
  quality: RenderQuality;
  background: string;
  onReady: () => void;
  eventSource?: RefObject<HTMLElement | null>;
  cameraPosition?: [number, number, number];
  fov?: number;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={!visible ? "never" : renderOnDemand ? "demand" : "always"}
      dpr={quality.dpr}
      shadows={quality.shadows ? "percentage" : false}
      camera={{ position: cameraPosition, fov, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false, preserveDrawingBuffer: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.outputColorSpace = SRGBColorSpace;
      }}
      eventSource={eventSource?.current ?? undefined}
      eventPrefix="client"
      aria-hidden
    >
      <color attach="background" args={[background]} />
      <PerformanceMonitor flipflops={2}>
        <AdaptiveDpr pixelated={false} />
      </PerformanceMonitor>
      <Suspense fallback={null}>
        {children}
        {renderOnDemand && <WarmupFrames count={8} />}
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
