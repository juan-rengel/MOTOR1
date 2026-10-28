"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { CinematicCamera, type CameraKey } from "../../shared/camera-rig";
import { ProductStage } from "../../shared/product-stage";
import { resolveQuality, SceneCanvas } from "../../scene-canvas";
import type { SceneComponentProps } from "../../types";

const CAMERA_KEYS: CameraKey[] = [
  { azimuth: 55, elevation: 12, radius: 6.2, target: [0, 0.1, 0], fov: 30, shift: -5 },
  { azimuth: 90, elevation: 4, radius: 5, target: [0, 0.1, 0], fov: 30, shift: -4 },
  { azimuth: 160, elevation: 10, radius: 5.4, target: [0, 0.1, 0], fov: 30, shift: -4 },
  { azimuth: 230, elevation: 45, radius: 6.5, target: [0, 0, 0], fov: 30, shift: 0 },
];

/** Tamanho máximo (em unidades de cena) ao qual o modelo é ajustado. */
const FIT_SIZE = 2.4;

/**
 * Modelo GLB do usuário, centralizado e ajustado em escala automaticamente.
 * Compressão Draco não é suportada nesta fase (exigiria baixar o decodificador
 * de um servidor externo); modelos assim exibem a imagem substituta.
 */
function Model({ src }: { src: string }) {
  const gltf = useGLTF(src, false, true);
  const { object, scale, offset } = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child) => {
      if ("castShadow" in child) child.castShadow = true;
    });
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const s = FIT_SIZE / Math.max(size.x, size.y, size.z, 1e-6);
    // Centraliza em X/Z e apoia a base em y = 0.
    return { object: clone, scale: s, offset: new Vector3(-center.x, -box.min.y, -center.z) };
  }, [gltf.scene]);
  return (
    <group scale={scale}>
      <primitive object={object} position={offset} />
    </group>
  );
}

function SceneContent({ settings, progress, background, tier, reducedMotion, cameraOverride }: SceneComponentProps) {
  const quality = resolveQuality(settings.quality, tier);
  return (
    <>
      <ProductStage settings={settings} background={background} quality={quality} animate={!reducedMotion && !cameraOverride} pedestalY={-1.2} pedestalRadius={1.8} floatIntensity={0.2}>
        <group position={[0, -1.2, 0]}>{settings.modelSrc && <Model src={settings.modelSrc} />}</group>
      </ProductStage>
      <CinematicCamera keys={CAMERA_KEYS} progress={progress} motion={settings.cameraMotion} interactive={settings.interactive} reducedMotion={reducedMotion} override={cameraOverride} />
    </>
  );
}

export default function CustomModelScene(props: SceneComponentProps) {
  const quality = resolveQuality(props.settings.quality, props.tier);
  return (
    <SceneCanvas visible={props.visible} quality={quality} background={props.background} onReady={props.onReady} eventSource={props.eventSource} renderOnDemand={Boolean(props.cameraOverride)} cameraPosition={[4, 1, 5]} fov={30}>
      <SceneContent {...props} />
    </SceneCanvas>
  );
}
