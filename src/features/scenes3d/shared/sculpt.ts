import { ExtrudeGeometry, MathUtils, type BufferGeometry, type Shape } from "three";
import { TessellateModifier } from "three/examples/jsm/modifiers/TessellateModifier.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Ferramentas para criar volumes orgânicos a partir de um perfil 2D:
 * extrusão com bisel → subdivisão → deformação (afinar pontas, arredondar topo)
 * → solda de vértices para sombreamento suave. Usado pelo carro e pelo tênis.
 */
export function extrudeProfile(shape: Shape, width: number, bevel: number, opts: { segments?: number; maxEdge?: number } = {}): BufferGeometry {
  const depth = Math.max(width - bevel * 2.4, 0.01);
  const extruded = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel * 1.2,
    bevelSize: bevel,
    bevelOffset: -bevel,
    bevelSegments: opts.segments ?? 8,
    curveSegments: 64,
  });
  extruded.translate(0, 0, -depth / 2);
  const tessellated = new TessellateModifier(opts.maxEdge ?? 0.14, 8).modify(extruded);
  extruded.dispose();
  return tessellated;
}

export interface SculptOptions {
  halfWidth: number;
  /** Afinamento em planta: começa em |x - centerX| = taperStart e é máximo em taperEnd. */
  taperStart: number;
  taperEnd: number;
  taper: number;
  /** Afinamento extra só na ponta frontal (x positivo). */
  frontTaper?: number;
  /** Arredondamento dos "ombros" no topo. */
  crown: number;
  crownFrom?: number;
  crownTo?: number;
  /** [y inicial, y final, quantidade]: estreita conforme sobe. */
  tumblehome?: [number, number, number];
  centerX?: number;
}

export function sculpt(geometry: BufferGeometry, opts: SculptOptions): BufferGeometry {
  const pos = geometry.attributes.position!;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    const dx = x - (opts.centerX ?? 0);
    z *= 1 - opts.taper * MathUtils.smoothstep(Math.abs(dx), opts.taperStart, opts.taperEnd);
    if (opts.frontTaper && dx > 0) z *= 1 - opts.frontTaper * MathUtils.smoothstep(dx, opts.taperStart * 0.6, opts.taperEnd);
    if (opts.tumblehome) {
      const [y0, y1, amount] = opts.tumblehome;
      z *= 1 - amount * MathUtils.smoothstep(y, y0, y1);
    }
    const nz = MathUtils.clamp(Math.abs(z) / opts.halfWidth, 0, 1);
    y -= opts.crown * nz * nz * MathUtils.smoothstep(y, opts.crownFrom ?? 0.55, opts.crownTo ?? 1.0);
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");
  const welded = mergeVertices(geometry, 1e-4);
  geometry.dispose();
  welded.computeVertexNormals();
  return welded;
}
