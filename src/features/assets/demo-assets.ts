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
  demo("optics-hero", "image", "Armação em vitrine (capa)", "/assets/demo/optics/hero-poster.jpg", "Armação de óculos sobre pedestal de vitrine"),
  ...(
    [
      ["square-black", "Armação quadrada preta"],
      ["round-tortoise", "Armação redonda tartaruga"],
      ["cat-burgundy", "Armação gatinho bordô"],
      ["aviator-gold", "Óculos aviador dourado com lentes escuras"],
      ["square-crystal", "Armação quadrada translúcida"],
      ["round-navy", "Armação redonda azul-marinho"],
    ] as const
  ).map(([id, alt]) => demo(`optics-${id}`, "image", alt, `/assets/demo/optics/frame-${id}.jpg`, alt)),
  demo("optics-detail-front", "image", "Armação — frente", "/assets/demo/optics/detail-front.jpg", "Armação de óculos vista de frente"),
  demo("optics-detail-lens", "image", "Armação — lentes", "/assets/demo/optics/detail-lens.jpg", "Detalhe das lentes de uma armação"),
  demo("optics-detail-hinge", "image", "Armação — dobradiça", "/assets/demo/optics/detail-hinge.jpg", "Detalhe da dobradiça de uma armação"),
  demo("silk-hero", "image", "Tecido acetinado (capa)", "/assets/demo/fashion/silk-hero.jpg", "Tecido acetinado rosa ondulando"),
  ...(["rose", "navy", "emerald", "amber", "black", "pearl"] as const).map((c) => demo(`silk-${c}`, "texture", `Tecido ${c}`, `/assets/demo/fashion/silk-${c}.jpg`, `Tecido acetinado (${c})`)),
  demo("silk-look-1", "image", "Lookbook 1", "/assets/demo/fashion/look-1.jpg", "Tecido acetinado coral em close"),
  demo("silk-look-2", "image", "Lookbook 2", "/assets/demo/fashion/look-2.jpg", "Tecido acetinado azul-noite"),
  demo("sneaker-hero", "image", "Tênis em destaque (capa)", "/assets/demo/fashion/sneaker-hero.jpg", "Tênis branco com detalhes rosa sobre pedestal"),
  ...(["white-rose", "black-cyan", "navy-orange", "sand-green", "red-white", "grey-violet"] as const).map((c) => demo(`sneaker-${c}`, "image", `Tênis ${c}`, `/assets/demo/fashion/sneaker-${c}.jpg`, `Tênis (${c.replace("-", " e ")})`)),
  demo("sneaker-detail", "image", "Tênis — bico", "/assets/demo/fashion/sneaker-detail.jpg", "Detalhe do bico de um tênis"),
  demo("sneaker-top", "image", "Tênis — vista superior", "/assets/demo/fashion/sneaker-top.jpg", "Tênis visto de cima"),
  demo("model-chair", "model", "Cadeira de design (GLB)", "/assets/demo/models/chair.glb", "Cadeira com estrutura de madeira e assento estofado"),
];
