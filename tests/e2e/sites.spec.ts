import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackErrors } from "./helpers";

/** Modelos disponíveis (manter em sincronia com src/features/templates/registry.ts). */
const TEMPLATE_IDS = ["mechanic-cinematic", "optics-atelier", "fashion-editorial", "universal-essential"];

test.describe("sites gerados (demonstrações)", () => {
  for (const id of TEMPLATE_IDS) {
    test(`${id}: carrega sem erros e mostra seções`, async ({ page }) => {
      // Sem GPU, a cena 3D roda em software e deixa a rolagem lenta neste ambiente de teste.
      test.setTimeout(120_000);
      const errors = trackErrors(page);
      const missing: string[] = [];
      page.on("response", (r) => {
        if (r.status() === 404 && r.url().includes("/assets/")) missing.push(r.url());
      });
      await page.goto(`/demo/${id}`);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(await page.locator("[data-section-id]").count()).toBeGreaterThan(4);
      await expect(page.getByText(/empresa fictícia/)).toBeVisible();
      // Percorre a página para carregar imagens sob demanda.
      for (let y = 0; y < 12; y++) {
        await page.mouse.wheel(0, 900);
        await page.waitForTimeout(120);
      }
      expect(missing, "imagens de demonstração devem existir").toEqual([]);
      expect(errors).toEqual([]);
    });

    for (const width of [390, 834, 1440]) {
      test(`${id}: sem rolagem horizontal em ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/demo/${id}`);
        await expectNoHorizontalOverflow(page);
      });
    }

    test(`${id}: acessibilidade básica (axe, sem violações sérias)`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/demo/${id}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        // Elementos sobre a cena 3D/imagens têm fundo dinâmico; contraste é verificado no editor a partir do tema.
        .exclude("canvas")
        .analyze();
      const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} — ${v.help}`)).toEqual([]);
    });
  }

  test("movimento reduzido: conteúdo visível e sem animações pendentes", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/demo/${TEMPLATE_IDS[0]}`);
    await expect(page.locator("html")).not.toHaveClass(/cws-js/);
    const hidden = await page.locator("[data-reveal]").evaluateAll((els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
    expect(hidden).toBe(0);
  });

  test("cena 3D carrega sob demanda e fica pronta", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`/demo/${TEMPLATE_IDS[0]}`);
    const host = page.locator('[data-scene="garage-car"]');
    await expect(host).toBeVisible();
    await expect(host.locator("canvas")).toHaveCount(1, { timeout: 60_000 });
    await expect(host).toHaveAttribute("data-scene-ready", "true", { timeout: 90_000 });
  });

  test("sem WebGL: mostra imagem substituta e não cria canvas", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      // Simula navegador sem WebGL.
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
      } as typeof original;
    });
    await page.goto(`/demo/${TEMPLATE_IDS[0]}`);
    const host = page.locator('[data-scene="garage-car"]');
    await expect(host.locator("img")).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(host.locator("canvas")).toHaveCount(0);
  });

  test("formulário de contato na demonstração não envia nada", async ({ page }) => {
    await page.goto(`/demo/${TEMPLATE_IDS[0]}#contato`);
    const form = page.locator("form").filter({ hasText: "Mensagem" });
    await form.getByRole("button", { name: /Enviar/ }).click();
    await expect(form.getByText("Informe seu nome.")).toBeVisible();
    await form.getByLabel("Nome").fill("Maria");
    await form.getByLabel("Mensagem").fill("Gostaria de um orçamento.");
    await form.getByRole("button", { name: /Enviar/ }).click();
    await expect(page.getByText(/Nada foi enviado/)).toBeVisible();
  });
});

test.describe("cena de modelo próprio (GLB)", () => {
  test("carrega o modelo demonstrativo da biblioteca", async ({ page, request }) => {
    test.setTimeout(150_000);
    const created = await request.post("/api/projects", {
      data: {
        templateId: "mechanic-cinematic",
        style: "minimal",
        business: { name: "Loja de Móveis Teste", segment: "mechanic", city: "", description: "", offerings: [], audience: "", phone: "", whatsapp: "", email: "", address: "", hours: "", social: { instagram: "", facebook: "", tiktok: "", youtube: "", linkedin: "", website: "" }, goal: "catalog" },
      },
    });
    const { project } = await created.json();
    project.scene = { ...project.scene, sceneId: "custom-model", modelSrc: "/assets/demo/models/chair.glb", quality: "low" };
    const saved = await request.put(`/api/projects/${project.id}`, { data: { project, expectedRevision: 0 } });
    expect(saved.status()).toBe(200);

    const errors = trackErrors(page);
    await page.goto(`/preview/${project.id}`);
    const host = page.locator('[data-scene="custom-model"]');
    await expect(host).toHaveAttribute("data-scene-ready", "true", { timeout: 120_000 });
    expect(errors).toEqual([]);
    await request.delete(`/api/projects/${project.id}`);
  });
});
