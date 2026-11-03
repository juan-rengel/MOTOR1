import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { trackErrors } from "./helpers";

/**
 * Testes ponta a ponta do modelo Oficina Real (`mechanic-real`, Etapa 1C.2).
 *
 * Dados comerciais: a demonstração não tem telefone, endereço nem e-mail; o único número
 * usado aqui é o de teste já adotado nos demais testes, (11) 91234-5678.
 * Projetos criados são sempre excluídos (try/finally) e a exclusão é conferida.
 */

const DEMO = "/demo/mechanic-real";
const TEST_WHATSAPP = "(11) 91234-5678";
const TEST_WHATSAPP_DIGITS = "5511912345678";
const preview = (page: Page) => page.frameLocator('iframe[title="Pré-visualização do site"]');

/** Exclui todos os projetos com o nome informado e confere que não existem mais. */
async function deleteProjectsNamed(request: APIRequestContext, name: string) {
  const list = await request.get("/api/projects");
  const { projects } = (await list.json()) as { projects: Array<{ id: string; name: string }> };
  for (const project of projects.filter((p) => p.name === name)) {
    expect((await request.delete(`/api/projects/${project.id}`)).status()).toBe(204);
    expect((await request.get(`/api/projects/${project.id}`)).status()).toBe(404);
  }
  const after = (await (await request.get("/api/projects")).json()) as { projects: Array<{ name: string }> };
  expect(after.projects.filter((p) => p.name === name)).toEqual([]);
}

test.describe("Oficina Real — demonstração", () => {
  test("B1: seções na ordem, galeria oculta e navegação pelo menu", async ({ page }) => {
    const errors = trackErrors(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(DEMO);
    await expect(page.locator(".site-root")).toHaveAttribute("data-template", "mechanic-real");

    const types = await page.locator("[data-section-type]").evaluateAll((els) => els.map((el) => el.getAttribute("data-section-type")));
    expect(types).toEqual(["hero", "services", "about", "steps", "faq", "cta", "contact"]);
    await expect(page.locator('[data-section-type="gallery"]')).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(nav.getByRole("link")).toHaveText(["Serviços", "Diferenciais", "Como funciona", "Dúvidas", "Contato"]);
    await expect(nav.getByRole("link", { name: "Estrutura" })).toHaveCount(0);

    await nav.getByRole("link", { name: "Diferenciais" }).click();
    await expect(page).toHaveURL(/#diferenciais$/);
    await expect(page.locator("#diferenciais")).toBeInViewport();
    expect(errors).toEqual([]);
  });

  test("B2: leve — sem cena 3D e sem carregar o three.js (com controle positivo na Garagem)", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(DEMO, { waitUntil: "networkidle" });
    for (let y = 0; y < 15; y++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(80);
    }
    await page.waitForLoadState("networkidle");
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.locator("[data-scene]")).toHaveCount(0);
    // three.js registra window.__THREE__ ao ser carregado.
    expect(await page.evaluate(() => (window as unknown as { __THREE__?: string }).__THREE__ ?? null)).toBeNull();

    // Controle positivo: na Garagem (com cena 3D) o mesmo indicador aparece, provando que a verificação funciona.
    await page.goto("/demo/mechanic-cinematic");
    await expect.poll(() => page.evaluate(() => (window as unknown as { __THREE__?: string }).__THREE__ ?? null), { timeout: 90_000 }).not.toBeNull();
  });

  test("B3: WhatsApp na demonstração não usa nenhum contato inventado", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(DEMO);
    await expect(page.locator('a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: /WhatsApp/i })).toHaveCount(0);

    // Botão principal da capa: na demonstração explica o que faria num site real.
    const heroCta = page.locator('[data-section-type="hero"]').getByRole("button", { name: /Pedir orçamento/ });
    await heroCta.click();
    await expect(page.locator('[data-section-type="hero"]').getByRole("status")).toContainText("Demonstração: em um site real");

    // Formulário de contato: valida, mas não envia nada.
    const form = page.locator("form").filter({ hasText: "Mensagem" });
    await form.getByLabel("Nome").fill("Maria");
    await form.getByLabel("Mensagem").fill("Gostaria de um orçamento.");
    await form.getByRole("button", { name: /Enviar/ }).click();
    await expect(page.getByText(/Nada foi enviado/)).toBeVisible();
  });

  test("B4: celular — menu, alvos de toque e botão principal na primeira tela", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      const errors = trackErrors(page);
      await page.goto(DEMO);
      const menuButton = page.getByRole("button", { name: "Abrir menu" });
      const menuBox = await menuButton.boundingBox();
      expect(menuBox!.width).toBeGreaterThanOrEqual(44);
      expect(menuBox!.height).toBeGreaterThanOrEqual(44);

      const heroButtons = page.locator('[data-section-type="hero"] .site-button');
      expect(await heroButtons.count()).toBeGreaterThanOrEqual(2);
      for (const box of await heroButtons.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect))) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      const primary = await heroButtons.first().boundingBox();
      expect(primary!.y + primary!.height).toBeLessThanOrEqual(844);

      await menuButton.tap();
      const menu = page.getByRole("navigation", { name: "Menu" });
      await expect(menu).toBeVisible();
      // Lista de seções do menu; abaixo dela fica o botão de contato do cabeçalho (comum a todos os modelos).
      await expect(menu.getByRole("list").first().getByRole("link")).toHaveText(["Serviços", "Diferenciais", "Como funciona", "Dúvidas", "Contato"]);
      await expect(menu.getByRole("link")).toHaveCount(6);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});

test.describe("Oficina Real — cartões, assistente e criação", () => {
  test("B5: cartões com a prévia carregada (página inicial, Studio e assistente)", async ({ page }) => {
    const previewLoaded = (scope: ReturnType<Page["locator"]>) =>
      scope.locator('img[src*="mechanic-real/preview.jpg"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth);

    await page.goto("/#modelos", { waitUntil: "networkidle" });
    const homeCard = page.locator("#modelos li").filter({ hasText: "Oficina Real" });
    await homeCard.scrollIntoViewIfNeeded();
    await expect.poll(() => previewLoaded(homeCard)).toBe(1600);
    await expect(homeCard.getByRole("link")).toHaveAttribute("href", DEMO);

    await page.goto("/studio/templates", { waitUntil: "networkidle" });
    const studioCard = page.getByRole("listitem").filter({ hasText: "Oficina Real" }).first();
    await expect.poll(() => previewLoaded(studioCard)).toBe(1600);
    await expect(studioCard.getByRole("link", { name: /Ver demonstração/ })).toHaveAttribute("href", DEMO);

    await page.goto("/studio/new");
    await page.getByLabel("Nome comercial").fill("Cartões Teste");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    const wizardCard = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio").filter({ hasText: "Oficina Real" });
    await expect.poll(() => previewLoaded(wizardCard)).toBe(1600);

    const demo = await page.request.get(DEMO);
    expect(demo.status()).toBe(200);
  });

  test("B6: assistente da mecânica — Garagem pré-selecionada, depois Oficina Real e Essencial", async ({ page }) => {
    await page.goto("/studio/new");
    await expect(page.getByRole("radio", { name: /Oficina mecânica/ })).toHaveAttribute("aria-checked", "true");
    await page.getByLabel("Nome comercial").fill("Ordem Teste");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    const choices = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio");
    await expect(choices).toHaveCount(3);
    await expect(choices.nth(0)).toContainText("Garagem Cinematográfica");
    await expect(choices.nth(0)).toHaveAttribute("aria-checked", "true");
    await expect(choices.nth(1)).toContainText("Oficina Real");
    await expect(choices.nth(1)).toHaveAttribute("aria-checked", "false");
    await expect(choices.nth(2)).toContainText("Essencial");
  });

  test("B7: cria um site com a Oficina Real e o WhatsApp de teste", async ({ page, request }) => {
    test.setTimeout(120_000);
    const name = `Oficina Real E2E ${Date.now()}`;
    try {
      const errors = trackErrors(page);
      // Navegador sem WebGL, como nos demais testes do editor (o modelo não usa 3D).
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
          if (type.startsWith("webgl")) return null;
          return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
        } as typeof original;
      });
      await page.goto("/studio/new");
      await page.getByLabel("Nome comercial").fill(name);
      await page.getByLabel("WhatsApp").fill(TEST_WHATSAPP);
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      const oficina = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio").filter({ hasText: "Oficina Real" });
      await oficina.click();
      await expect(oficina).toHaveAttribute("aria-checked", "true");
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Criar site" }).click();
      await page.waitForURL(/\/studio\/projects\/[0-9a-f-]{36}$/, { timeout: 30_000 });
      const id = page.url().split("/").pop()!;

      // Editor: a prévia usa o modelo Oficina Real.
      const root = preview(page).locator(".site-root");
      await expect(root).toHaveAttribute("data-template", "mechanic-real", { timeout: 30_000 });
      await expect(preview(page).locator("h1 .sr-only").first()).toHaveText("Seu carro em mãos que entendem de motor.");

      // Página de pré-visualização (versão salva): links de WhatsApp só com o número de teste.
      await page.goto(`/preview/${id}`);
      const heroCta = page.locator('[data-section-type="hero"] a[data-cta-action="whatsapp"]').first();
      await expect(heroCta).toHaveAttribute("href", new RegExp(`^https://wa\\.me/${TEST_WHATSAPP_DIGITS}\\?text=`));
      expect(decodeURIComponent((await heroCta.getAttribute("href"))!)).toContain("orçamento");
      const contactLinks = await page.locator('a[href^="https://wa.me"], a[href^="tel:"]').evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
      expect(contactLinks.length).toBeGreaterThanOrEqual(3); // capa, chamada e botão flutuante
      for (const href of contactLinks) {
        const digits = href.startsWith("tel:") ? href.replace(/\D/g, "") : href.match(/^https:\/\/wa\.me\/(\d+)/)?.[1];
        expect(digits, href).toBe(TEST_WHATSAPP_DIGITS);
      }
      expect(errors).toEqual([]);
    } finally {
      await deleteProjectsNamed(request, name);
    }
  });

  test("B8: API — Oficina Real só no segmento mecânica", async ({ request }) => {
    const name = `Oficina Real API ${Date.now()}`;
    const business = {
      name,
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
    try {
      const refused = await request.post("/api/projects", { data: { templateId: "mechanic-real", style: "industrial", business: { ...business, segment: "dental" } } });
      expect(refused.status()).toBe(422);
      expect(JSON.stringify(await refused.json())).toContain("não foi feito para o segmento");
      const created = await request.post("/api/projects", { data: { templateId: "mechanic-real", style: "industrial", business } });
      expect(created.status()).toBe(201);
      const { project } = await created.json();
      expect(project.templateId).toBe("mechanic-real");
    } finally {
      await deleteProjectsNamed(request, name);
    }
  });
});
