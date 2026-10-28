import { Shape } from "three";
import { extrudeProfile, sculpt, type SculptOptions } from "../../shared/sculpt";

/**
 * Tênis procedural. Bico aponta para +X; sola apoiada em y = 0.
 * Comprimento ~2,9 unidades. Painéis (biqueira/lateral, contraforte e faixa)
 * usam a mesma deformação do cabedal, levemente mais largos, para "assentar"
 * sobre a superfície como peças costuradas.
 */
const SOLE_SCULPT: SculptOptions = { halfWidth: 0.54, taperStart: 0.6, taperEnd: 1.5, taper: 0.35, frontTaper: 0.15, crown: 0 };
const UPPER_WIDTH = 0.96;
const upperSculpt = (scale: number): SculptOptions => ({
  halfWidth: (UPPER_WIDTH / 2) * scale,
  taperStart: 0.5,
  taperEnd: 1.45,
  taper: 0.38,
  frontTaper: 0.18,
  crown: 0.14 * scale,
  crownFrom: 0.4,
  crownTo: 0.95,
  tumblehome: [0.5, 1.05, 0.16],
});

function soleShape() {
  const s = new Shape();
  s.moveTo(-1.38, 0.0);
  s.lineTo(1.25, 0.0);
  s.quadraticCurveTo(1.5, 0.02, 1.52, 0.2);
  s.quadraticCurveTo(1.48, 0.28, 1.35, 0.27);
  s.lineTo(-1.3, 0.32);
  s.quadraticCurveTo(-1.48, 0.32, -1.5, 0.18);
  s.quadraticCurveTo(-1.5, 0.02, -1.38, 0.0);
  return s;
}

export function createSoleGeometry() {
  return sculpt(extrudeProfile(soleShape(), 1.08, 0.05, { segments: 4, maxEdge: 0.12 }), SOLE_SCULPT);
}

/** Solado de borracha: faixa fina na base da sola. */
export function createOutsoleGeometry() {
  const s = new Shape();
  s.moveTo(-1.39, -0.005);
  s.lineTo(1.26, -0.005);
  s.quadraticCurveTo(1.51, 0.015, 1.53, 0.09);
  s.lineTo(-1.51, 0.09);
  s.quadraticCurveTo(-1.51, 0.015, -1.39, -0.005);
  return sculpt(extrudeProfile(s, 1.1, 0.03, { segments: 3, maxEdge: 0.12 }), { ...SOLE_SCULPT, halfWidth: 0.55 });
}

function upperShape() {
  const s = new Shape();
  s.moveTo(1.36, 0.24);
  s.quadraticCurveTo(1.42, 0.44, 1.08, 0.52);
  s.quadraticCurveTo(0.55, 0.6, 0.15, 0.8);
  s.quadraticCurveTo(-0.25, 0.98, -0.5, 0.97);
  s.quadraticCurveTo(-0.8, 0.9, -1.05, 0.96);
  s.quadraticCurveTo(-1.3, 1.06, -1.38, 0.98);
  s.quadraticCurveTo(-1.48, 0.7, -1.4, 0.3);
  s.lineTo(1.36, 0.24);
  return s;
}

export function createUpperGeometry() {
  return sculpt(extrudeProfile(upperShape(), UPPER_WIDTH, 0.1, { segments: 6, maxEdge: 0.08 }), upperSculpt(1));
}

/** Biqueira + faixa lateral inferior (mudguard), contínua do bico ao calcanhar. */
export function createMudguardGeometry() {
  const s = new Shape();
  s.moveTo(1.4, 0.23);
  s.quadraticCurveTo(1.44, 0.44, 1.1, 0.53);
  s.quadraticCurveTo(0.85, 0.56, 0.7, 0.5);
  s.quadraticCurveTo(0.2, 0.4, -0.6, 0.42);
  s.quadraticCurveTo(-1.1, 0.44, -1.43, 0.5);
  s.lineTo(-1.42, 0.28);
  s.lineTo(1.4, 0.23);
  return sculpt(extrudeProfile(s, UPPER_WIDTH * 1.025, 0.1, { segments: 6, maxEdge: 0.08 }), upperSculpt(1.025));
}

/** Contraforte do calcanhar. */
export function createHeelCounterGeometry() {
  const s = new Shape();
  s.moveTo(-0.95, 0.3);
  s.quadraticCurveTo(-1.0, 0.75, -1.2, 0.95);
  s.quadraticCurveTo(-1.32, 1.04, -1.39, 0.97);
  s.quadraticCurveTo(-1.5, 0.66, -1.43, 0.3);
  s.lineTo(-0.95, 0.3);
  return sculpt(extrudeProfile(s, UPPER_WIDTH * 1.035, 0.1, { segments: 6, maxEdge: 0.08 }), upperSculpt(1.035));
}

/** Faixa decorativa lateral (genérica, sem referência a marcas). */
export function createStripeGeometry() {
  const s = new Shape();
  s.moveTo(0.62, 0.43);
  s.quadraticCurveTo(0.0, 0.5, -0.62, 0.86);
  s.lineTo(-0.5, 0.88);
  s.quadraticCurveTo(0.05, 0.58, 0.66, 0.5);
  s.lineTo(0.62, 0.43);
  return sculpt(extrudeProfile(s, UPPER_WIDTH * 1.03, 0.012, { segments: 2, maxEdge: 0.06 }), upperSculpt(1.03));
}

/** Altura do peito do pé (z = 0) para posicionar cadarços sobre a superfície. */
export function instepY(x: number): number {
  return x > 0.15 ? 0.52 + ((1.08 - x) / 0.93) * 0.28 : 0.8 + ((0.15 - x) / 0.65) * 0.17;
}
