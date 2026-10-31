import { expect, test, type Page } from "@playwright/test";

/**
 * Imagens dos sites (Etapa 1B):
 * - demonstrações passam pelo otimizador do Next (srcset, WebP); a capa tem prioridade alta;
 * - uploads e URLs externas NÃO passam pelo otimizador (uploads reavaliados na Fase 9);
 * - imagem que falha mostra o substituto.
 */

async function withoutWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
}

async function scrollToEnd(page: Page) {
  for (let i = 0; i < 25; i++) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(80);
  }
  await page.waitForLoadState("networkidle");
}

test.describe("imagens otimizadas das demonstrações", () => {
  test("capa: imagem substituta da cena com prioridade alta, srcset e WebP", async ({ page }) => {
    await withoutWebGL(page);
    const webp: string[] = [];
    page.on("response", (r) => {
      if (r.url().includes("/_next/image") && r.headers()["content-type"] === "image/webp") webp.push(r.url());
    });
    await page.goto("/demo/mechanic-cinematic", { waitUntil: "networkidle" });
    const hero = page.locator('[data-scene="garage-car"] img');
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("srcset", /\/_next\/image\?url=%2Fassets%2Fdemo%2Fmechanic%2Fhero-poster\.jpg&w=\d+&q=75/);
    await expect(hero).toHaveAttribute("sizes", "100vw");
    expect(await hero.evaluate((img: HTMLImageElement) => img.naturalWidth > 0)).toBe(true);
    expect(webp.some((u) => u.includes("hero-poster"))).toBe(true);
  });

  test("imagens fora da capa: sob demanda, sem prioridade, com sizes da seção", async ({ page }) => {
    await withoutWebGL(page);
    await page.goto("/demo/optics-atelier", { waitUntil: "networkidle" });
    const card = page.locator('[data-section-type="catalog"] img').first();
    await expect(card).toHaveAttribute("loading", "lazy");
    expect(await card.getAttribute("fetchpriority")).toBeNull();
    await expect(card).toHaveAttribute("sizes", "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw");
  });

  test("no celular, a imagem entregue é menor que a original", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await withoutWebGL(page);
    await page.goto("/demo/optics-atelier", { waitUntil: "networkidle" });
    const card = page.locator('[data-section-type="catalog"] img').first();
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => card.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
    // Original: 900 px de largura. A 390 px (tela 1×), o navegador escolhe uma versão menor.
    expect(await card.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeLessThan(900);
    await context.close();
  });
});

test.describe("uploads e URLs externas continuam fora do otimizador", () => {
  test("upload direto, URL externa direta e substituto quando a imagem falha", async ({ page, request }) => {
    test.setTimeout(120_000);
    // Upload de um PNG válido (1×1).
    const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    const uploaded = await request.post("/api/assets", {
      multipart: { kind: "image", name: "pixel", alt: "Pixel de teste", license: "Gerado no teste", file: { name: "pixel.png", mimeType: "image/png", buffer: png } },
    });
    expect(uploaded.status()).toBe(201);
    const { asset } = await uploaded.json();

    // Projeto da Garagem com: foto do "Sobre" = upload; chamada = URL externa; 1ª imagem da galeria = demo inexistente.
    const created = await request.post("/api/projects", {
      data: {
        templateId: "mechanic-cinematic",
        style: "cinematic",
        business: { name: "Imagens Teste", segment: "mechanic", city: "", description: "", offerings: [], audience: "", phone: "", whatsapp: "", email: "", address: "", hours: "", social: { instagram: "", facebook: "", tiktok: "", youtube: "", linkedin: "", website: "" }, goal: "quote" },
      },
    });
    const { project } = await created.json();
    const external = "https://example.invalid/foto-externa.jpg";
    const missing = "/assets/demo/mechanic/imagem-que-nao-existe.jpg";
    for (const section of project.sections) {
      if (section.type === "about") section.props.image = { src: asset.src, alt: "Foto enviada" };
      if (section.type === "cta") section.props.image = { src: external, alt: "" };
      if (section.type === "gallery") section.props.images[0].image = { src: missing, alt: "Imagem que não existe" };
    }
    const saved = await request.put(`/api/projects/${project.id}`, { data: { project, expectedRevision: 0 } });
    expect(saved.status()).toBe(200);

    const requested: string[] = [];
    page.on("request", (r) => requested.push(r.url()));
    await withoutWebGL(page);
    await page.goto(`/preview/${project.id}`, { waitUntil: "networkidle" });
    await scrollToEnd(page);

    // Upload: <img> direto na rota do arquivo, sem srcset e sem passar pelo otimizador.
    const about = page.locator('[data-section-type="about"] img');
    await expect(about).toHaveAttribute("src", asset.src);
    expect(await about.getAttribute("srcset")).toBeNull();
    expect(await about.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1);
    expect(requested.filter((u) => u.includes("/_next/image") && u.includes("api%2Fassets"))).toEqual([]);

    // URL externa: pedida diretamente (falha de rede neste ambiente → substituto), nunca pelo otimizador.
    expect(requested).toContain(external);
    expect(requested.filter((u) => u.includes("/_next/image") && u.includes("example.invalid"))).toEqual([]);

    // Imagem de demonstração inexistente: o otimizador recusa e o substituto aparece.
    await expect(page.locator('[data-section-type="gallery"]').getByText("Imagem indisponível").first()).toBeVisible();

    // O arquivo enviado continua idêntico e a exclusão funciona como antes.
    const file = await request.get(asset.src);
    expect(file.status()).toBe(200);
    expect(Buffer.compare(await file.body(), png)).toBe(0);
    expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(204);
    expect((await request.delete(`/api/assets/${asset.id}`)).status()).toBe(204);
    expect((await request.get(asset.src)).status()).toBe(404);
  });
});
