import { CatmullRomCurve3, ExtrudeGeometry, Path, QuadraticBezierCurve3, Shape, ShapeGeometry, TubeGeometry, Vector3 } from "three";

export type FrameStyle = "square" | "round" | "cat" | "aviator";

export const FRAME_STYLES: FrameStyle[] = ["square", "round", "cat", "aviator"];

export function parseFrameStyle(variant: string): FrameStyle {
  return (FRAME_STYLES as string[]).includes(variant) ? (variant as FrameStyle) : "square";
}

/**
 * Contorno de um aro (lado direito, centrado na origem). `inset` encolhe o
 * contorno para formar o furo da lente. Coordenadas em "unidades de cena"
 * (a armação inteira tem ~1,45 de largura).
 */
function outline(target: Shape | Path, style: FrameStyle, inset: number) {
  const w = (style === "round" ? 0.56 : 0.62) / 2 - inset;
  const h = (style === "round" ? 0.56 : style === "aviator" ? 0.52 : 0.44) / 2 - inset;
  if (style === "round") {
    target.absellipse(0, 0, w, h, 0, Math.PI * 2, false, 0);
    return;
  }
  if (style === "aviator") {
    // Gota: topo reto e largo, base arredondada estreitando para o nariz.
    target.moveTo(-w, h * 0.7);
    target.quadraticCurveTo(-w, h, -w * 0.6, h);
    target.lineTo(w * 0.7, h);
    target.quadraticCurveTo(w * 1.05, h, w, h * 0.35);
    target.bezierCurveTo(w * 0.98, -h * 0.9, w * 0.3, -h * 1.05, -w * 0.15, -h * 0.95);
    target.bezierCurveTo(-w * 0.75, -h * 0.85, -w, -h * 0.2, -w, h * 0.7);
    return;
  }
  const r = style === "cat" ? 0.1 : 0.12;
  const lift = style === "cat" ? 0.045 : 0; // canto externo superior levemente elevado (gatinho)
  target.moveTo(-w + r, -h);
  target.lineTo(w - r, -h);
  target.quadraticCurveTo(w, -h, w, -h + r);
  target.lineTo(w, h - r + lift);
  target.quadraticCurveTo(w, h + lift, w - r, h + lift);
  target.quadraticCurveTo(0, h + lift * 0.2, -w + r, h);
  target.quadraticCurveTo(-w, h, -w, h - r);
  target.lineTo(-w, -h + r);
  target.quadraticCurveTo(-w, -h, -w + r, -h);
}

export function createRimGeometry(style: FrameStyle) {
  const shape = new Shape();
  outline(shape, style, 0);
  const hole = new Path();
  outline(hole, style, style === "aviator" ? 0.022 : 0.055);
  shape.holes.push(hole);
  const geometry = new ExtrudeGeometry(shape, {
    depth: style === "aviator" ? 0.025 : 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 48,
  });
  geometry.translate(0, 0, -0.022);
  return geometry;
}

export function createLensGeometry(style: FrameStyle) {
  const shape = new Shape();
  outline(shape, style, style === "aviator" ? 0.018 : 0.05);
  return new ShapeGeometry(shape, 48);
}

export function createBridgeGeometry(style: FrameStyle) {
  const curve = new QuadraticBezierCurve3(new Vector3(-0.1, 0.09, 0), new Vector3(0, style === "aviator" ? 0.15 : 0.17, 0.03), new Vector3(0.1, 0.09, 0));
  return new TubeGeometry(curve, 24, style === "aviator" ? 0.012 : 0.024, 10, false);
}

/** Barra superior (duplo aro) dos óculos aviador. */
export function createBrowBarGeometry() {
  const curve = new QuadraticBezierCurve3(new Vector3(-0.22, 0.25, 0.005), new Vector3(0, 0.27, 0.03), new Vector3(0.22, 0.25, 0.005));
  return new TubeGeometry(curve, 24, 0.011, 8, false);
}

export function createTempleGeometry(side: 1 | -1) {
  const x = side * 0.69;
  const curve = new CatmullRomCurve3([
    new Vector3(x, 0.12, -0.02),
    new Vector3(x + side * 0.02, 0.12, -0.5),
    new Vector3(x + side * 0.015, 0.1, -1.15),
    new Vector3(x, -0.02, -1.38),
    new Vector3(x - side * 0.01, -0.12, -1.42),
  ]);
  return new TubeGeometry(curve, 80, 0.02, 10, false);
}
