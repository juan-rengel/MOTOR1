import { ExtrudeGeometry, MathUtils, Shape, type BufferGeometry } from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Geometria procedural de um cupê esportivo (sem arquivos externos).
 * Frente do carro aponta para +X; o chão é y = 0; largura no eixo Z.
 */
export const CAR = {
  length: 4.6,
  width: 1.92,
  wheelBase: 1.4, // distância do centro à roda em X
  wheelY: 0.345,
  wheelZ: 0.83,
  archRadius: 0.43,
} as const;

function extrude(shape: Shape, width: number, bevel: number, segments = 8): BufferGeometry {
  const depth = Math.max(width - bevel * 2.4, 0.01);
  const extruded = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel * 1.2,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: segments,
    curveSegments: 64,
  });
  extruded.translate(0, 0, -depth / 2);
  // Subdivide as faces laterais (triângulos longos) para que possam ser curvadas sem vincos.
  const tessellated = new TessellateModifier(0.14, 8).modify(extruded);
  extruded.dispose();
  return tessellated;
}

/**
 * Deforma a extrusão para parecer carroceria: afina frente e traseira em planta,
 * arredonda os "ombros" e (na cabine) estreita em direção ao teto.
 */
function sculpt(geometry: BufferGeometry, opts: { halfWidth: number; taperStart: number; taperEnd: number; taper: number; crown: number; tumblehome?: [number, number, number]; centerX?: number }) {
  const pos = geometry.attributes.position!;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const ax = Math.abs(x - (opts.centerX ?? 0));
    z *= 1 - opts.taper * MathUtils.smoothstep(ax, opts.taperStart, opts.taperEnd);
    if (opts.tumblehome) {
      const [y0, y1, amount] = opts.tumblehome;
      z *= 1 - amount * MathUtils.smoothstep(y, y0, y1);
    }
    const nz = MathUtils.clamp(Math.abs(z) / opts.halfWidth, 0, 1);
    y -= opts.crown * nz * nz * MathUtils.smoothstep(y, 0.55, 1.0);
    pos.setXYZ(i, x, y, z);
  }
  // Solda vértices coincidentes para sombreamento suave em toda a carroceria.
  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");
  const welded = mergeVertices(geometry, 1e-4);
  geometry.dispose();
  welded.computeVertexNormals();
  return welded;
}

/** Carroceria inferior: para-choques, capô, linha de cintura e caixas de roda. */
export function createBodyGeometry() {
  const { wheelBase: wb, wheelY: wy, archRadius: ar } = CAR;
  const s = new Shape();
  s.moveTo(-2.18, 0.2);
  s.lineTo(-wb - ar, 0.2);
  s.absarc(-wb, wy, ar, Math.PI, 0, true);
  s.lineTo(wb - ar, 0.2);
  s.absarc(wb, wy, ar, Math.PI, 0, true);
  s.lineTo(2.16, 0.2);
  s.quadraticCurveTo(2.3, 0.22, 2.31, 0.45);
  s.quadraticCurveTo(2.31, 0.7, 2.06, 0.78);
  s.quadraticCurveTo(1.45, 0.9, 0.8, 0.98);
  s.lineTo(-1.45, 1.01);
  s.quadraticCurveTo(-2.02, 0.99, -2.24, 0.88);
  s.quadraticCurveTo(-2.32, 0.8, -2.3, 0.6);
  s.quadraticCurveTo(-2.28, 0.24, -2.18, 0.2);
  return sculpt(extrude(s, CAR.width, 0.13), { halfWidth: CAR.width / 2, taperStart: 1.1, taperEnd: 2.35, taper: 0.2, crown: 0.07 });
}

/** Cabine envidraçada (para-brisa, teto e vidro traseiro em fastback). */
export function createGreenhouseGeometry() {
  const g = new Shape();
  g.moveTo(0.86, 0.94);
  g.quadraticCurveTo(0.38, 1.22, -0.05, 1.34);
  g.quadraticCurveTo(-0.5, 1.41, -0.98, 1.32);
  g.quadraticCurveTo(-1.6, 1.18, -2.0, 0.96);
  g.lineTo(0.86, 0.94);
  return sculpt(extrude(g, 1.5, 0.12, 10), { halfWidth: 0.75, taperStart: 0.5, taperEnd: 1.5, taper: 0.22, crown: 0.0, tumblehome: [1.0, 1.4, 0.2], centerX: -0.55 });
}
