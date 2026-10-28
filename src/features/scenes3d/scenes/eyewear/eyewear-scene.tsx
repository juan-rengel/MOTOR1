"use client";

import { useEffect, useMemo } from "react";
import { CinematicCamera, type CameraKey } from "../../shared/camera-rig";
import { ProductStage } from "../../shared/product-stage";
import { resolveQuality, SceneCanvas } from "../../scene-canvas";
import type { SceneComponentProps } from "../../types";
import { createBridgeGeometry, createBrowBarGeometry, createLensGeometry, createRimGeometry, createTempleGeometry, parseFrameStyle } from "./glasses-geometry";

/** Momentos: três-quartos → frontal → detalhe da dobradiça → traseira. A frente da armação aponta para +Z. */
const CAMERA_KEYS: CameraKey[] = [
  { azimuth: 62, elevation: 10, radius: 4.6, target: [0, -0.15, -0.3], fov: 30, shift: -5 },
  { azimuth: 90, elevation: 3, radius: 3.1, target: [0, 0, 0], fov: 28, shift: -4 },
  { azimuth: 28, elevation: 8, radius: 2.3, target: [0.62, 0.08, -0.25], fov: 28, shift: -3 },
  { azimuth: 150, elevation: 20, radius: 4.2, target: [0, -0.1, -0.5], fov: 30, shift: -4 },
];

function Glasses({ variant, frameColor, quality }: { variant: string; frameColor: string; quality: ReturnType<typeof resolveQuality> }) {
  const style = parseFrameStyle(variant);
  const geo = useMemo(
    () => ({
      rim: createRimGeometry(style),
      lens: createLensGeometry(style),
      bridge: createBridgeGeometry(style),
      brow: style === "aviator" ? createBrowBarGeometry() : null,
      templeR: createTempleGeometry(1),
      templeL: createTempleGeometry(-1),
    }),
    [style],
  );
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g?.dispose());
    },
    [geo],
  );

  const metal = style === "aviator";
  const sun = style === "aviator";
  const lensTint = sun ? "#2b2f36" : "#eef6ff";
  const frameMaterial = metal ? (
    <meshStandardMaterial color="#d8c08a" roughness={0.18} metalness={1} />
  ) : (
    <meshPhysicalMaterial color={frameColor} roughness={0.14} metalness={0.05} clearcoat={1} clearcoatRoughness={0.04} />
  );
  const lensMaterial = quality.reflections ? (
    <meshPhysicalMaterial color={lensTint} transmission={sun ? 0.55 : 1} thickness={0.05} roughness={0.02} ior={1.5} transparent opacity={sun ? 0.9 : 1} envMapIntensity={1.5} />
  ) : (
    <meshPhysicalMaterial color={lensTint} transparent opacity={sun ? 0.82 : 0.22} roughness={0.05} metalness={0.2} envMapIntensity={1.5} />
  );

  return (
    <group rotation-x={-0.06}>
      {([1, -1] as const).map((side) => (
        <group key={side} position={[side * 0.36, 0, 0]} rotation-y={side * -0.06}>
          <mesh geometry={geo.rim} castShadow scale={[side, 1, 1]}>
            {frameMaterial}
          </mesh>
          <mesh geometry={geo.lens} position-z={0.004} scale={[side, 1, 1]}>
            {lensMaterial}
          </mesh>
          <mesh position={[side * 0.31, 0.12, -0.02]} castShadow>
            <boxGeometry args={[0.07, 0.09, 0.07]} />
            {frameMaterial}
          </mesh>
          <mesh position={[-side * 0.25, -0.07, -0.06]} scale={[0.6, 1, 0.45]}>
            <sphereGeometry args={[0.035, 16, 12]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.5} roughness={0.1} />
          </mesh>
        </group>
      ))}
      <mesh geometry={geo.bridge} castShadow>
        {frameMaterial}
      </mesh>
      {geo.brow && (
        <mesh geometry={geo.brow} castShadow>
          {frameMaterial}
        </mesh>
      )}
      <mesh geometry={geo.templeR} castShadow>
        {frameMaterial}
      </mesh>
      <mesh geometry={geo.templeL} castShadow>
        {frameMaterial}
      </mesh>
    </group>
  );
}

function SceneContent({ settings, progress, background, tier, reducedMotion, cameraOverride }: SceneComponentProps) {
  const quality = resolveQuality(settings.quality, tier);
  const animate = !reducedMotion && !cameraOverride;
  return (
    <>
      <ProductStage settings={settings} background={background} quality={quality} animate={animate} pedestalY={-0.62} pedestalRadius={1.15} floatIntensity={0.6}>
        <group position={[0, 0.12, 0.35]}>
          <Glasses variant={settings.variant} frameColor={settings.primaryColor} quality={quality} />
        </group>
      </ProductStage>
      <CinematicCamera keys={CAMERA_KEYS} progress={progress} motion={settings.cameraMotion} interactive={settings.interactive} reducedMotion={reducedMotion} override={cameraOverride} />
    </>
  );
}

export default function EyewearScene(props: SceneComponentProps) {
  const quality = resolveQuality(props.settings.quality, props.tier);
  return (
    <SceneCanvas visible={props.visible} quality={quality} background={props.background} onReady={props.onReady} eventSource={props.eventSource} renderOnDemand={Boolean(props.cameraOverride)} cameraPosition={[2, 0.5, 4]} fov={30}>
      <SceneContent {...props} />
    </SceneCanvas>
  );
}
