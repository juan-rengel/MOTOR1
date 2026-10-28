"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, type MeshStandardMaterial } from "three";
import { CAR, createBodyGeometry, createGreenhouseGeometry } from "./car-geometry";

function Wheel({ side, x, accent, spin }: { side: 1 | -1; x: number; accent: string; spin: RefObject<number> }) {
  const rotor = useRef<Group>(null);
  useFrame(() => {
    if (rotor.current) rotor.current.rotation.z = -(spin.current ?? 0);
  });
  return (
    <group position={[x, CAR.wheelY, side * CAR.wheelZ]} rotation-y={side === 1 ? 0 : Math.PI}>
      <group ref={rotor}>
        <mesh castShadow>
          <torusGeometry args={[0.255, 0.09, 24, 64]} />
          <meshStandardMaterial color="#0d0d0e" roughness={0.85} metalness={0.05} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} position-z={0.0}>
          <cylinderGeometry args={[0.236, 0.236, 0.14, 48]} />
          <meshStandardMaterial color="#2b2e33" roughness={0.3} metalness={0.95} />
        </mesh>
        <mesh position-z={0.07}>
          <torusGeometry args={[0.232, 0.014, 12, 64]} />
          <meshStandardMaterial color="#e6e8eb" roughness={0.12} metalness={1} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation-z={(i / 5) * Math.PI * 2} position={[0, 0, 0.09]}>
            <boxGeometry args={[0.44, 0.07, 0.04]} />
            <meshStandardMaterial color="#d7dade" roughness={0.16} metalness={1} />
          </mesh>
        ))}
        <mesh rotation-x={Math.PI / 2} position-z={0.105}>
          <cylinderGeometry args={[0.055, 0.055, 0.03, 24]} />
          <meshStandardMaterial color="#d7dade" roughness={0.2} metalness={1} />
        </mesh>
      </group>
      <mesh rotation-x={Math.PI / 2} position-z={0.04}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 48]} />
        <meshStandardMaterial color="#7a7d82" roughness={0.4} metalness={0.95} />
      </mesh>
      <mesh position={[-0.14, 0.11, 0.045]} rotation-z={0.75}>
        <boxGeometry args={[0.1, 0.19, 0.05]} />
        <meshStandardMaterial color={accent} roughness={0.35} metalness={0.3} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

/**
 * Carro esportivo procedural. `lights` (0..1) controla faróis e lanternas;
 * `spin` é a rotação acumulada das rodas.
 */
export function CarModel({
  paint,
  accent,
  lights,
  spin,
}: {
  paint: string;
  accent: string;
  lights: RefObject<number>;
  spin: RefObject<number>;
}) {
  const body = useMemo(() => createBodyGeometry(), []);
  const greenhouse = useMemo(() => createGreenhouseGeometry(), []);
  // Materiais das luzes, ajustados a cada quadro conforme `lights`.
  const headRight = useRef<MeshStandardMaterial>(null);
  const headLeft = useRef<MeshStandardMaterial>(null);
  const tail = useRef<MeshStandardMaterial>(null);

  // Libera memória de GPU ao desmontar (objetos criados fora do JSX).
  useEffect(
    () => () => {
      body.dispose();
      greenhouse.dispose();
    },
    [body, greenhouse],
  );

  useFrame(() => {
    const l = lights.current ?? 1;
    for (const ref of [headRight, headLeft]) if (ref.current) ref.current.emissiveIntensity = MathUtils.lerp(0.4, 6, l);
    if (tail.current) tail.current.emissiveIntensity = MathUtils.lerp(0.8, 4, l);
  });

  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial color={paint} metalness={0.55} roughness={0.26} clearcoat={1} clearcoatRoughness={0.05} envMapIntensity={1.4} />
      </mesh>
      <mesh geometry={greenhouse} castShadow>
        <meshPhysicalMaterial color="#07080a" metalness={0.85} roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} envMapIntensity={1.8} />
      </mesh>

      {/* Faróis (frente, +X) */}
      {[1, -1].map((side) => (
        <mesh key={`h${side}`} position={[2.27, 0.6, side * 0.46]} rotation-y={side * 0.32}>
          <boxGeometry args={[0.07, 0.04, 0.4]} />
          <meshStandardMaterial ref={side === 1 ? headRight : headLeft} color="#fff6e6" emissive="#fff1d6" />
        </mesh>
      ))}
      {/* Grade inferior */}
      <mesh position={[2.28, 0.36, 0]}>
        <boxGeometry args={[0.06, 0.12, 0.95]} />
        <meshStandardMaterial color="#060607" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Lanterna traseira contínua */}
      <mesh position={[-2.28, 0.76, 0]}>
        <boxGeometry args={[0.05, 0.045, 1.3]} />
        <meshStandardMaterial ref={tail} color="#3a0000" emissive="#ff1a1a" />
      </mesh>
      {/* Difusor traseiro */}
      <mesh position={[-2.24, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 1.1]} />
        <meshStandardMaterial color="#08090a" roughness={0.5} metalness={0.6} />
      </mesh>
      {[CAR.wheelBase, -CAR.wheelBase].map((x) =>
        ([1, -1] as const).map((side) => <Wheel key={`${x}${side}`} x={x} side={side} accent={accent} spin={spin} />),
      )}
    </group>
  );
}
