"use client";

import { useEffect, useMemo } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import { AdditiveBlending, CanvasTexture, Color, DoubleSide, ShaderMaterial } from "three";
import type { SceneSettings } from "@/domain/scene";

const PRESETS = {
  studio: { key: "#ffffff", fill: "#dfe8f5", strength: 1 },
  night: { key: "#9db8ff", fill: "#6a7fb8", strength: 0.75 },
  warm: { key: "#ffe2bf", fill: "#ffc58a", strength: 0.95 },
} as const;

/**
 * Ambiente de estúdio gerado localmente com painéis de luz (Lightformers).
 * Não depende de arquivos HDR externos. Renderizado uma única vez (frames=1).
 */
export function StudioEnvironment({ preset, accent }: { preset: SceneSettings["environment"]; accent: string }) {
  const p = PRESETS[preset];
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.2 * p.strength} color={p.key} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={3 * p.strength} color={p.fill} position={[-7, 1.6, 0]} rotation-y={Math.PI / 2} scale={[10, 0.8, 1]} />
      <Lightformer form="rect" intensity={3 * p.strength} color={p.fill} position={[7, 1.6, 0]} rotation-y={-Math.PI / 2} scale={[10, 0.8, 1]} />
      <Lightformer form="rect" intensity={2.4} color={accent} position={[0, 1.2, -9]} scale={[14, 1.4, 1]} />
      <Lightformer form="ring" intensity={1.5 * p.strength} color={p.key} position={[9, 3, 4]} scale={3} />
    </Environment>
  );
}

/** Sombra de oclusão suave (gradiente radial) que "assenta" objetos no chão. */
export function GroundOcclusion({ width, depth, opacity = 0.85, y = 0.004 }: { width: number; depth: number; opacity?: number; y?: number }) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.55, "rgba(0,0,0,0.65)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={y} renderOrder={1}>
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Feixe de luz volumétrico falso (cone aditivo com gradiente) — atmosfera de estúdio. */
export function LightBeam({ color = "#ffffff", opacity = 0.07, position = [0, 3.6, 0] as [number, number, number], radius = 3.2, height = 7.2 }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        uniforms: { uColor: { value: new Color(color) }, uOpacity: { value: opacity } },
        // Brilho maior no centro do cone e silhueta esmaecida (sem bordas duras).
        vertexShader: `varying float vY; varying vec3 vNormal; varying vec3 vView;
          void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position,1.0); vView = normalize(-mv.xyz); vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vY; varying vec3 vNormal; varying vec3 vView;
          void main(){ float facing = pow(abs(dot(vNormal, vView)), 2.0); float a = smoothstep(0.0, 1.0, vY) * facing * uOpacity; gl_FragColor = vec4(uColor, a); }`,
      }),
    [color, opacity],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh position={position} material={material} renderOrder={2}>
      <coneGeometry args={[radius, height, 48, 1, true]} />
    </mesh>
  );
}
