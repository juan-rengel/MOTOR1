"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import type { SceneSettings } from "@/domain/scene";

/** Um "momento" de câmera em coordenadas esféricas ao redor de um alvo. */
export interface CameraKey {
  azimuth: number; // graus; 0 = eixo +X (frente do objeto), 90 = +Z
  elevation: number; // graus
  radius: number;
  target: [number, number, number];
  fov: number;
  /** Deslocamento lateral da lente (enquadra o objeto fora do centro, deixando espaço ao texto). */
  shift?: number;
}

type Sample = { azimuth: number; elevation: number; radius: number; tx: number; ty: number; tz: number; fov: number; shift: number };

const smooth = (t: number) => t * t * (3 - 2 * t);

export function sampleCameraPath(keys: CameraKey[], t: number): Sample {
  const clamped = MathUtils.clamp(t, 0, 1);
  const scaled = clamped * (keys.length - 1);
  const i = Math.min(Math.floor(scaled), keys.length - 2);
  const a = keys[Math.max(i, 0)]!;
  const b = keys[Math.min(i + 1, keys.length - 1)]!;
  const f = keys.length > 1 ? smooth(scaled - i) : 0;
  const lerp = (x: number, y: number) => x + (y - x) * f;
  return {
    azimuth: lerp(a.azimuth, b.azimuth),
    elevation: lerp(a.elevation, b.elevation),
    radius: lerp(a.radius, b.radius),
    tx: lerp(a.target[0], b.target[0]),
    ty: lerp(a.target[1], b.target[1]),
    tz: lerp(a.target[2], b.target[2]),
    fov: lerp(a.fov, b.fov),
    shift: lerp(a.shift ?? 0, b.shift ?? 0),
  };
}

/**
 * Câmera cinematográfica:
 * - scroll: percorre os momentos conforme o progresso da rolagem;
 * - orbit: giro lento contínuo ao redor do primeiro momento;
 * - static: primeiro momento fixo.
 * Movimento amortecido (sem trancos) e leve paralaxe com o mouse quando interativo.
 * Em telas verticais, afasta a câmera e centraliza o objeto.
 */
export function CinematicCamera({
  keys,
  progress,
  motion,
  interactive,
  reducedMotion,
  override,
}: {
  override?: CameraKey;
  keys: CameraKey[];
  progress: RefObject<number>;
  motion: SceneSettings["cameraMotion"];
  interactive: boolean;
  reducedMotion: boolean;
}) {
  const current = useRef<Sample | null>(null);
  const target = useRef(new Vector3());

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const dt = Math.min(delta, 0.1);
    let goal: Sample;
    if (override) {
      goal = sampleCameraPath([override], 0);
    } else if (motion === "scroll" && !reducedMotion) {
      goal = sampleCameraPath(keys, progress.current ?? 0);
    } else {
      goal = sampleCameraPath(keys, 0);
      if (motion === "orbit" && !reducedMotion) goal.azimuth += state.clock.elapsedTime * 7;
    }
    if (interactive && !reducedMotion && !override) {
      goal.azimuth += state.pointer.x * 7;
      goal.elevation += state.pointer.y * 3;
    }
    const aspect = state.size.width / Math.max(state.size.height, 1);
    if (aspect < 1 && !override) {
      goal.radius *= MathUtils.clamp(1.15 / aspect, 1, 2.1);
      goal.shift = 0;
    }

    if (!current.current) current.current = { ...goal };
    const c = current.current;
    const lambda = reducedMotion || override ? 1000 : 3.2;
    (Object.keys(goal) as Array<keyof Sample>).forEach((k) => {
      c[k] = MathUtils.damp(c[k], goal[k], lambda, dt);
    });

    const az = MathUtils.degToRad(c.azimuth);
    const el = MathUtils.degToRad(c.elevation);
    target.current.set(c.tx, c.ty, c.tz);
    camera.position.set(
      c.tx + c.radius * Math.cos(el) * Math.cos(az),
      c.ty + c.radius * Math.sin(el),
      c.tz + c.radius * Math.cos(el) * Math.sin(az),
    );
    camera.lookAt(target.current);
    if (Math.abs(camera.fov - c.fov) > 0.01 || Math.abs(camera.filmOffset - c.shift) > 0.01) {
      camera.fov = c.fov;
      camera.filmOffset = c.shift;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
