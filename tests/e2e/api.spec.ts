import { expect, test } from "@playwright/test";

const business = {
  name: "API Teste",
  segment: "mechanic",
  city: "",
  description: "",
  offerings: [],
  audience: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  hours: "",
  social: { instagram: "", facebook: "", tiktok: "", youtube: "", linkedin: "", website: "" },
  goal: "quote",
};

test.describe("API e segurança", () => {
  test("valida dados no servidor", async ({ request }) => {
    const res = await request.post("/api/projects", { data: { templateId: "mechanic-cinematic", style: "cinematic", business: { ...business, name: "" } } });
    expect(res.status()).toBe(422);
    const bad = await request.post("/api/projects", { data: { templateId: "nao-existe", style: "cinematic", business } });
    expect(bad.status()).toBe(422);
  });

  test("bloqueia requisições de outra origem", async ({ request }) => {
    const res = await request.post("/api/projects", {
      data: { templateId: "mechanic-cinematic", style: "cinematic", business },
      headers: { origin: "https://site-malicioso.example" },
    });
    expect(res.status()).toBe(403);
  });

  test("detecta gravação concorrente (revisão)", async ({ request }) => {
    const created = await request.post("/api/projects", { data: { templateId: "mechanic-cinematic", style: "cinematic", business } });
    expect(created.status()).toBe(201);
    const { project } = await created.json();
    const first = await request.put(`/api/projects/${project.id}`, { data: { project, expectedRevision: 0 } });
    expect(first.status()).toBe(200);
    const stale = await request.put(`/api/projects/${project.id}`, { data: { project, expectedRevision: 0 } });
    expect(stale.status()).toBe(409);
    await request.delete(`/api/projects/${project.id}`);
  });

  test("rejeita HTML/JS perigoso em links e mídia", async ({ request }) => {
    const created = await request.post("/api/projects", { data: { templateId: "mechanic-cinematic", style: "cinematic", business } });
    const { project } = await created.json();
    project.sections[0].props.image = { src: "javascript:alert(1)", alt: "" };
    project.brand.logo.src = "data:image/svg+xml,<svg onload=alert(1)>";
    const res = await request.put(`/api/projects/${project.id}`, { data: { project, expectedRevision: 0 } });
    expect(res.status()).toBe(422);
    await request.delete(`/api/projects/${project.id}`);
  });

  test("upload aceita imagem real e recusa arquivo disfarçado", async ({ request }) => {
    const fake = await request.post("/api/assets", {
      multipart: { kind: "image", name: "falso", alt: "x", license: "", file: { name: "falso.png", mimeType: "image/png", buffer: Buffer.from("<script>alert(1)</script>    ") } },
    });
    expect(fake.status()).toBe(422);

    // PNG 1x1 válido
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    const ok = await request.post("/api/assets", {
      multipart: { kind: "image", name: "pixel", alt: "Pixel de teste", license: "Gerado no teste", file: { name: "pixel.png", mimeType: "image/png", buffer: png } },
    });
    expect(ok.status()).toBe(201);
    const { asset } = await ok.json();
    const file = await request.get(asset.src);
    expect(file.status()).toBe(200);
    expect(file.headers()["content-type"]).toBe("image/png");
    expect(file.headers()["x-content-type-options"]).toBe("nosniff");
    expect(file.headers()["content-security-policy"]).toContain("sandbox");
    const del = await request.delete(`/api/assets/${asset.id}`);
    expect(del.status()).toBe(204);
  });

  test("gerador de conteúdo identifica que não é IA", async ({ request }) => {
    const res = await request.post("/api/content/generate", { data: { task: "hero", business, style: "cinematic" } });
    expect(res.status()).toBe(200);
    const { suggestion } = await res.json();
    expect(suggestion.provider.kind).toBe("rules");
    expect(suggestion.notice).toContain("não foram geradas por IA");
    expect(suggestion.variants.length).toBeGreaterThan(0);
  });
});
