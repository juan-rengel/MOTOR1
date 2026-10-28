"use client";

import { useRef } from "react";
import type { SceneSettings } from "@/domain/scene";
import { MotionProvider } from "@/features/animations/motion-context";
import { SceneHost } from "@/features/scenes3d/scene-host";
import { getDemoShot } from "@/features/scenes3d/demo-shots";

const BASE: SceneSettings = {
  enabled: true,
  sceneId: "garage-car",
  cameraMotion: "static",
  interactive: false,
  quality: "high",
  primaryColor: "#b3121b",
  accentColor: "#ffb547",
  environment: "studio",
  fallbackImage: { src: "", alt: "" },
  modelSrc: "",
};

export function CaptureView({ shotId }: { shotId: string }) {
  const progress = useRef(0.3);
  const shot = getDemoShot(shotId);
  if (!shot) return <p className="p-8 text-white">Enquadramento desconhecido: {shotId}</p>;
  return (
    <MotionProvider settings={{ level: "none", textReveal: false, imageReveal: false, parallax: false, sectionTransitions: false }}>
      <div style={{ width: "100vw", height: "100vh", background: shot.background }}>
        <SceneHost settings={{ ...BASE, ...shot.scene }} progress={progress} background={shot.background} cameraOverride={shot.camera} />
      </div>
    </MotionProvider>
  );
}
