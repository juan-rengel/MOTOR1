"use client";

import { useMemo, type ReactNode } from "react";
import { Float, Sparkles } from "@react-three/drei";
import { Color } from "three";
import type { SceneSettings } from "@/domain/scene";
import type { RenderQuality } from "../scene-canvas";
import { GroundOcclusion, StudioEnvironment } from "./studio-environment";

/**
 * Palco de produto reutilizável: pedestal, luzes de vitrine, ambiente de
 * estúdio, sombras e flutuação suave do objeto.
 * Obs.: não usa ContactShadows do drei — em fundos claros ele gerava um
 * quadrado escuro sobre o pedestal; sombras reais + oclusão suave resolvem.
 */
export function ProductStage({
  settings,
  background,
  quality,
  animate,
  children,
  pedestalY = -0.9,
  pedestalRadius = 1.25,
  floatIntensity = 0.5,
}: {
  settings: SceneSettings;
  background: string;
  quality: RenderQuality;
  /** Falso com movimento reduzido ou captura de imagem: objeto parado. */
  animate: boolean;
  children: ReactNode;
  pedestalY?: number;
  pedestalRadius?: number;
  floatIntensity?: number;
}) {
  const bg = useMemo(() => new Color(background), [background]);
  const isLight = bg.getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
  const pedestal = useMemo(() => "#" + bg.clone().lerp(new Color(isLight ? "#000000" : "#ffffff"), isLight ? 0.06 : 0.09).getHexString(), [bg, isLight]);

  return (
    <>
      <fog attach="fog" args={[background, 9, 22]} />
      <ambientLight intensity={isLight ? 0.6 : 0.18} />
      <spotLight position={[2.5, 6, 3.5]} angle={0.45} penumbra={1} intensity={isLight ? 2.6 : 3.2} decay={0} castShadow={quality.shadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <spotLight position={[-4, 2.5, -3]} angle={0.6} penumbra={1} intensity={2.4} decay={0} color={settings.accentColor} />
      <StudioEnvironment preset={settings.environment} accent={settings.accentColor} />

      {animate ? (
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={floatIntensity} floatingRange={[-0.04, 0.06]}>
          {children}
        </Float>
      ) : (
        children
      )}

      <group position={[0, pedestalY, 0]}>
        <mesh receiveShadow={quality.shadows} position={[0, -0.25, 0]}>
          <cylinderGeometry args={[pedestalRadius, pedestalRadius * 1.04, 0.5, 96]} />
          <meshPhysicalMaterial color={pedestal} roughness={0.35} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.25} />
        </mesh>
        <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[pedestalRadius * 0.96, pedestalRadius, 96]} />
          <meshBasicMaterial color={settings.accentColor} toneMapped={false} transparent opacity={0.7} />
        </mesh>
        <GroundOcclusion width={pedestalRadius * 1.5} depth={pedestalRadius * 1.1} opacity={0.3} y={0.004} />
      </group>

      <mesh rotation-x={-Math.PI / 2} position={[0, pedestalY - 0.5, 0]} receiveShadow={quality.shadows}>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial color={background} roughness={0.9} />
      </mesh>

      {quality.particles > 0 && animate && (
        <Sparkles count={Math.round(quality.particles * 0.6)} scale={[6, 3, 6]} position={[0, 0.6, 0]} size={1.6} speed={0.2} opacity={0.3} color={settings.accentColor} />
      )}
    </>
  );
}
