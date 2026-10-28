"use client";

import { Suspense, useEffect, type ReactNode, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
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
}: {
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
      frameloop={visible ? "always" : "never"}
      dpr={quality.dpr}
      shadows={quality.shadows}
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
        <ReadySignal onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
