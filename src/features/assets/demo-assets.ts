import type { AssetRecord } from "@/domain/assets";

const LICENSE = "Gerado por este projeto a partir das cenas 3D procedurais — livre para uso nos sites criados na plataforma.";

function demo(id: string, kind: AssetRecord["kind"], name: string, src: string, alt: string): AssetRecord {
  return { id: `demo-${id}`, ownerId: "system", kind, name, src, mimeType: src.endsWith(".glb") ? "model/gltf-binary" : "image/jpeg", size: 0, alt, license: LICENSE, source: "demo", createdAt: "2026-01-01T00:00:00.000Z" };
}

/**
 * Recursos demonstrativos incluídos no projeto (public/assets/demo).
 * Gerados localmente por `npm run assets:demo` (imagens) — ver docs/RECURSOS.md.
 */
export const DEMO_ASSETS: AssetRecord[] = [
  demo("mech-hero", "image", "Carro em estúdio (capa)", "/assets/demo/mechanic/hero-poster.jpg", "Carro esportivo vermelho em estúdio escuro com iluminação dramática"),
  demo("mech-front", "image", "Carro — frente", "/assets/demo/mechanic/car-front.jpg", "Frente de carro esportivo vermelho com faróis acesos"),
  demo("mech-side", "image", "Carro — lateral", "/assets/demo/mechanic/car-side.jpg", "Lateral de carro esportivo vermelho em estúdio"),
  demo("mech-rear", "image", "Carro — traseira", "/assets/demo/mechanic/car-rear.jpg", "Traseira de carro esportivo com lanternas acesas"),
  demo("mech-wheel", "image", "Roda e freio", "/assets/demo/mechanic/wheel.jpg", "Close de roda esportiva e pinça de freio"),
  demo("mech-headlight", "image", "Farol", "/assets/demo/mechanic/headlight.jpg", "Close do farol de um carro esportivo"),
  demo("mech-top", "image", "Carro — vista superior", "/assets/demo/mechanic/car-top.jpg", "Carro esportivo visto do alto em estúdio"),
];
