"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { Color, MathUtils, SpotLight, Object3D } from "three";
import { useMemo } from "react";
import { CinematicCamera, type CameraKey } from "../../shared/camera-rig";
import { GroundOcclusion, LightBeam, StudioEnvironment } from "../../shared/studio-environment";
import { resolveQuality, SceneCanvas } from "../../scene-canvas";
import type { SceneComponentProps } from "../../types";
import { CarModel } from "./car-model";

/** Momentos de câmera: três-quartos frontal → farol → roda/freio → traseira → aérea. */
const CAMERA_KEYS: CameraKey[] = [
  { azimuth: 38, elevation: 9, radius: 10.2, target: [0, 0.55, 0], fov: 30, shift: -5.5 },
  { azimuth: 22, elevation: 5, radius: 6.4, target: [1.5, 0.62, 0.3], fov: 28, shift: -5 },
  { azimuth: 70, elevation: 4, radius: 4.4, target: [1.3, 0.4, 0.7], fov: 28, shift: -4.5 },
  { azimuth: 146, elevation: 9, radius: 7.6, target: [0, 0.6, 0], fov: 30, shift: -6 },
  { azimuth: 214, elevation: 30, radius: 9.8, target: [0, 0.35, 0], fov: 30, shift: 0 },
];

function SceneContent({ settings, progress, background, tier, reducedMotion, cameraOverride }: SceneComponentProps) {
  const quality = resolveQuality(settings.quality, tier);
  // Chão levemente mais claro que o fundo para "assentar" o carro (sombra e reflexo visíveis).
  const floor = useMemo(() => "#" + new Color(background).lerp(new Color("#ffffff"), 0.1).getHexString(), [background]);
  const lights = useRef(0.2);
  const spin = useRef(0);
  const headlight = useRef<SpotLight>(null);
  const headTarget = useRef<Object3D>(null);

  useFrame((_, delta) => {
    const p = settings.cameraMotion === "scroll" && !reducedMotion ? (progress.current ?? 0) : 0.3;
    // Faróis acendem no início da rolagem; rodas giram conforme o avanço.
    const goal = MathUtils.smoothstep(p, 0.04, 0.2);
    lights.current = MathUtils.damp(lights.current, Math.max(goal, 0.25), 4, delta);
    const spinGoal = settings.cameraMotion === "scroll" && !reducedMotion ? p * Math.PI * 10 : spin.current;
    spin.current = MathUtils.damp(spin.current, spinGoal, 6, delta);
    if (headlight.current) headlight.current.intensity = lights.current * 18;
    if (headlight.current && headTarget.current) headlight.current.target = headTarget.current;
  });

  return (
    <>
      <fog attach="fog" args={[background, 10, 28]} />
      <ambientLight intensity={0.12} />
      <spotLight position={[3, 8, 3]} angle={0.5} penumbra={1} intensity={4} decay={0} castShadow={quality.shadows} shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <spotLight position={[-6, 3, -5]} angle={0.5} penumbra={1} intensity={3} decay={0} color={settings.accentColor} />
      <spotLight ref={headlight} position={[2.35, 0.7, 0]} angle={0.55} penumbra={0.8} intensity={0} decay={0} distance={14} color="#fff1d6" />
      <object3D ref={headTarget} position={[9, 0, 0]} />

      <StudioEnvironment preset={settings.environment} accent={settings.accentColor} />
      <CarModel paint={settings.primaryColor} accent={settings.accentColor} lights={lights} spin={spin} />
      <GroundOcclusion width={6.2} depth={3.2} opacity={0.9} />
      <ContactShadows position={[0, 0.006, 0]} scale={11} blur={2.6} far={2.2} opacity={0.8} resolution={512} frames={1} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow={quality.shadows}>
        <circleGeometry args={[34, 64]} />
        {quality.reflections ? (
          <MeshReflectorMaterial
            resolution={tier === "high" ? 1024 : 512}
            mixBlur={1}
            mixStrength={1.6}
            blur={[400, 120]}
            roughness={0.9}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color={floor}
            metalness={0.6}
            mirror={0.45}
          />
        ) : (
          <meshStandardMaterial color={floor} roughness={0.55} metalness={0.4} />
        )}
      </mesh>

      <LightBeam color="#fff3dc" opacity={settings.environment === "night" ? 0.05 : 0.075} />
      {quality.particles > 0 && !reducedMotion && !cameraOverride && (
        <Sparkles count={quality.particles} scale={[9, 3.5, 7]} position={[0, 1.8, 0]} size={2.2} speed={0.25} opacity={0.35} color="#ffe9c4" />
      )}

      <CinematicCamera
        keys={CAMERA_KEYS}
        progress={progress}
        motion={settings.cameraMotion}
        interactive={settings.interactive}
        reducedMotion={reducedMotion}
        override={cameraOverride}
      />
    </>
  );
}

export default function GarageCarScene(props: SceneComponentProps) {
  const quality = resolveQuality(props.settings.quality, props.tier);
  return (
    <SceneCanvas visible={props.visible} quality={quality} background={props.background} onReady={props.onReady} eventSource={props.eventSource} cameraPosition={[6.5, 1.3, 5]} fov={30}>
      <SceneContent {...props} />
    </SceneCanvas>
  );
}
