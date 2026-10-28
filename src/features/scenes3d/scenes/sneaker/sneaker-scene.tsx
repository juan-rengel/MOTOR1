"use client";

import { useEffect, useMemo } from "react";
import { Color } from "three";
import { CinematicCamera, type CameraKey } from "../../shared/camera-rig";
import { ProductStage } from "../../shared/product-stage";
import { resolveQuality, SceneCanvas } from "../../scene-canvas";
import type { SceneComponentProps } from "../../types";
import { createHeelCounterGeometry, createMudguardGeometry, createOutsoleGeometry, createSoleGeometry, createStripeGeometry, createUpperGeometry, instepY } from "./sneaker-geometry";

const CAMERA_KEYS: CameraKey[] = [
  { azimuth: 58, elevation: 12, radius: 6.4, target: [0, 0.1, 0], fov: 30, shift: -5 },
  { azimuth: 90, elevation: 3, radius: 5.2, target: [0, 0.1, 0], fov: 28, shift: -4 },
  { azimuth: 22, elevation: 10, radius: 3.6, target: [0.9, 0, 0], fov: 28, shift: -3 },
  { azimuth: 140, elevation: 42, radius: 6, target: [0, 0, 0], fov: 30, shift: 0 },
];

const LACE_X = [0.62, 0.45, 0.28, 0.11, -0.06];

function Sneaker({ upper, accent }: { upper: string; accent: string }) {
  const geo = useMemo(
    () => ({
      sole: createSoleGeometry(),
      outsole: createOutsoleGeometry(),
      upper: createUpperGeometry(),
      mudguard: createMudguardGeometry(),
      heel: createHeelCounterGeometry(),
      stripe: createStripeGeometry(),
    }),
    [],
  );
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  // Painéis em tom levemente mais escuro que o cabedal (efeito de couro sobreposto).
  const panel = useMemo(() => "#" + new Color(upper).lerp(new Color("#000000"), 0.14).getHexString(), [upper]);

  return (
    <group rotation-z={0.05}>
      <mesh geometry={geo.outsole} castShadow receiveShadow>
        <meshStandardMaterial color="#3b3530" roughness={0.85} />
      </mesh>
      <mesh geometry={geo.sole} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f3f1ec" roughness={0.55} clearcoat={0.15} />
      </mesh>
      <mesh geometry={geo.upper} castShadow position-y={0.005}>
        <meshPhysicalMaterial color={upper} roughness={0.55} sheen={0.5} sheenRoughness={0.5} sheenColor="#ffffff" />
      </mesh>
      <mesh geometry={geo.mudguard} castShadow position-y={0.005}>
        <meshPhysicalMaterial color={panel} roughness={0.42} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      <mesh geometry={geo.heel} position-y={0.005}>
        <meshPhysicalMaterial color={accent} roughness={0.4} clearcoat={0.3} />
      </mesh>
      <mesh geometry={geo.stripe} position-y={0.005}>
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.05} />
      </mesh>
      {/* Abertura do calçado (interior escuro) */}
      <mesh position={[-0.82, 0.955, 0]} rotation-x={-Math.PI / 2} rotation-y={0.06} scale={[0.34, 0.2, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshStandardMaterial color="#151515" roughness={0.95} />
      </mesh>
      {/* Lingueta */}
      <mesh position={[-0.3, 0.9, 0]} rotation-z={0.42}>
        <boxGeometry args={[0.3, 0.04, 0.26]} />
        <meshPhysicalMaterial color={upper} roughness={0.6} />
      </mesh>
      {/* Cadarços */}
      {LACE_X.map((x) => (
        <mesh key={x} position={[x, instepY(x) + 0.025, 0]} rotation-z={x > 0.15 ? 0.29 : 0.25}>
          <boxGeometry args={[0.035, 0.03, 0.4]} />
          <meshStandardMaterial color="#fbfbf9" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ settings, progress, background, tier, reducedMotion, cameraOverride }: SceneComponentProps) {
  const quality = resolveQuality(settings.quality, tier);
  const animate = !reducedMotion && !cameraOverride;
  return (
    <>
      <ProductStage settings={settings} background={background} quality={quality} animate={animate} pedestalY={-0.55} pedestalRadius={1.9} floatIntensity={0.4}>
        <group position={[0, -0.32, 0]} rotation-y={-0.35}>
          <Sneaker upper={settings.primaryColor} accent={settings.accentColor} />
        </group>
      </ProductStage>
      <CinematicCamera keys={CAMERA_KEYS} progress={progress} motion={settings.cameraMotion} interactive={settings.interactive} reducedMotion={reducedMotion} override={cameraOverride} />
    </>
  );
}

export default function SneakerScene(props: SceneComponentProps) {
  const quality = resolveQuality(props.settings.quality, props.tier);
  return (
    <SceneCanvas visible={props.visible} quality={quality} background={props.background} onReady={props.onReady} eventSource={props.eventSource} renderOnDemand={Boolean(props.cameraOverride)} cameraPosition={[3, 1, 5]} fov={30}>
      <SceneContent {...props} />
    </SceneCanvas>
  );
}
