"use client";

import { useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { DoubleSide, MathUtils, type Material, type MeshPhysicalMaterial, type WebGLProgramParametersWithUniforms } from "three";
import { CinematicCamera, type CameraKey } from "../../shared/camera-rig";
import { StudioEnvironment } from "../../shared/studio-environment";
import { resolveQuality, SceneCanvas } from "../../scene-canvas";
import type { SceneComponentProps } from "../../types";

const CAMERA_KEYS: CameraKey[] = [
  { azimuth: 90, elevation: 8, radius: 7.2, target: [0, 0, 0], fov: 32, shift: -4 },
  { azimuth: 70, elevation: 20, radius: 3.6, target: [0.8, 0.2, 0], fov: 30, shift: -3 },
  { azimuth: 115, elevation: 2, radius: 4.8, target: [-0.6, -0.2, 0], fov: 30, shift: -3 },
  { azimuth: 90, elevation: 35, radius: 8.5, target: [0, 0, 0], fov: 32, shift: 0 },
];

/**
 * Deslocamento do tecido feito na GPU: ondas somadas + normais analíticas
 * (sem recalcular a malha no processador). Mantém o material físico do
 * three.js (brilho acetinado "sheen", iluminação e névoa).
 */
function silkOnBeforeCompile(this: Material, shader: WebGLProgramParametersWithUniforms) {
  shader.uniforms.uTime = { value: 0 };
  shader.uniforms.uAmp = { value: 0.45 };
  shader.uniforms.uPhase = { value: 0 };
  this.userData.shader = shader;
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
      uniform float uTime; uniform float uAmp; uniform float uPhase;
      float silkH(vec2 p, out vec2 d) {
        float a = p.x * 1.3 + uTime * 0.6 + uPhase;
        float b = p.y * 1.9 - uTime * 0.45 + p.x * 0.4;
        float c = (p.x + p.y) * 2.7 + uTime * 0.9;
        d.x = uAmp * (0.35 * 1.3 * cos(a) + 0.25 * 0.4 * cos(b) + 0.15 * 2.7 * cos(c));
        d.y = uAmp * (0.25 * 1.9 * cos(b) + 0.15 * 2.7 * cos(c));
        return uAmp * (0.35 * sin(a) + 0.25 * sin(b) + 0.15 * sin(c));
      }`,
    )
    .replace(
      "#include <beginnormal_vertex>",
      `vec2 silkD; float silkHeight = silkH(position.xy, silkD);
      vec3 objectNormal = normalize(vec3(-silkD.x, -silkD.y, 1.0));
      #ifdef USE_TANGENT
        vec3 objectTangent = vec3( tangent.xyz );
      #endif`,
    )
    .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.xy, position.z + silkHeight);");
}
const silkCacheKey = () => "cws-silk-v1";

function Silk({ color, sheen, segments, animate, progress, scroll }: { color: string; sheen: string; segments: [number, number]; animate: boolean; progress: React.RefObject<number>; scroll: boolean }) {
  const material = useRef<MeshPhysicalMaterial>(null);
  const time = useRef(0);
  useFrame((_, delta) => {
    const shader = material.current?.userData.shader as WebGLProgramParametersWithUniforms | undefined;
    if (!shader) return;
    if (animate) time.current += Math.min(delta, 0.1);
    const p = scroll ? (progress.current ?? 0) : 0;
    shader.uniforms.uTime!.value = time.current;
    shader.uniforms.uPhase!.value = MathUtils.damp(shader.uniforms.uPhase!.value as number, p * 5, 3, delta);
    shader.uniforms.uAmp!.value = MathUtils.damp(shader.uniforms.uAmp!.value as number, 0.38 + p * 0.3, 3, delta);
  });
  const materialProps: ThreeElements["meshPhysicalMaterial"] = {
    color,
    roughness: 0.42,
    metalness: 0.05,
    sheen: 1,
    sheenColor: sheen,
    sheenRoughness: 0.32,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
    side: DoubleSide,
  };
  return (
    <mesh rotation={[-1.05, 0.15, 0.32]} castShadow receiveShadow>
      <planeGeometry args={[12, 8, segments[0], segments[1]]} />
      <meshPhysicalMaterial ref={material} {...materialProps} onBeforeCompile={silkOnBeforeCompile} customProgramCacheKey={silkCacheKey} />
    </mesh>
  );
}

function SceneContent({ settings, progress, background, tier, reducedMotion, cameraOverride }: SceneComponentProps) {
  const quality = resolveQuality(settings.quality, tier);
  const segments: [number, number] = quality.reflections ? [300, 200] : quality.shadows ? [220, 150] : [150, 100];
  return (
    <>
      <fog attach="fog" args={[background, 8, 20]} />
      <ambientLight intensity={0.25} />
      <spotLight position={[3, 6, 4]} angle={0.6} penumbra={1} intensity={3} decay={0} castShadow={quality.shadows} />
      <spotLight position={[-5, 1, -2]} angle={0.7} penumbra={1} intensity={3.5} decay={0} color={settings.accentColor} />
      <StudioEnvironment preset={settings.environment} accent={settings.accentColor} />
      <Silk color={settings.primaryColor} sheen={settings.accentColor} segments={segments} animate={!reducedMotion && !cameraOverride} progress={progress} scroll={settings.cameraMotion === "scroll" && !reducedMotion} />
      <CinematicCamera keys={CAMERA_KEYS} progress={progress} motion={settings.cameraMotion} interactive={settings.interactive} reducedMotion={reducedMotion} override={cameraOverride} />
    </>
  );
}

export default function SilkFlowScene(props: SceneComponentProps) {
  const quality = resolveQuality(props.settings.quality, props.tier);
  return (
    <SceneCanvas visible={props.visible} quality={quality} background={props.background} onReady={props.onReady} eventSource={props.eventSource} renderOnDemand={Boolean(props.cameraOverride)} cameraPosition={[0, 1, 7]} fov={32}>
      <SceneContent {...props} />
    </SceneCanvas>
  );
}
