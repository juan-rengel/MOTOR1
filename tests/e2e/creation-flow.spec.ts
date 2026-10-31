import { expect, test, type Page } from "@playwright/test";
import { createProjectViaWizard, trackErrors } from "./helpers";

const preview = (page: Page) => page.frameLocator('iframe[title="Pré-visualização do site"]');

test.describe("fluxo de criação e edição", () => {
  // O navegador de testes não tem GPU: a cena 3D (testada em sites.spec.ts) roda em software e
  // deixaria o editor lento. Aqui simulamos navegador sem WebGL, o que também exercita o substituto.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
      } as typeof original;
    });
  });

  test("cria site, edita, visualiza, salva e recupera", async ({ page }) => {
    const errors = trackErrors(page);
    const id = await createProjectViaWizard(page, "Oficina Teste E2E", { whatsapp: "(11) 91234-5678" });

    // Pré-visualização recebe o projeto
    await expect(preview(page).getByRole("link", { name: /Oficina Teste E2E — início/ })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("Tudo salvo")).toBeVisible();

    // Edição de texto com atualização ao vivo
    const title = page.getByLabel("Título", { exact: true });
    await title.fill("Seu carro pronto para a estrada");
    await expect(preview(page).locator("h1 .sr-only").first()).toHaveText("Seu carro pronto para a estrada");
    await expect(page.getByText("Alterações não salvas")).toBeVisible();

    // Desfazer / refazer
    await page.getByRole("button", { name: "Desfazer (Ctrl+Z)" }).click();
    await expect(title).not.toHaveValue("Seu carro pronto para a estrada");
    await page.getByRole("button", { name: "Refazer (Ctrl+Shift+Z)" }).click();
    await expect(title).toHaveValue("Seu carro pronto para a estrada");

    // Salvar e recarregar
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Tudo salvo")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Título", { exact: true })).toHaveValue("Seu carro pronto para a estrada");

    // Pré-visualização em página própria (versão salva)
    await page.goto(`/preview/${id}`);
    await expect(page.locator("h1 .sr-only").first()).toHaveText("Seu carro pronto para a estrada");
    await expect(page.getByText("Pré-visualização local — este site não está publicado")).toBeVisible();
    const whatsapp = page.locator('a[data-cta-action="whatsapp"]').first();
    await expect(whatsapp).toHaveAttribute("href", /^https:\/\/wa\.me\/5511912345678\?text=/);

    expect(errors).toEqual([]);
  });

  test("gerencia seções: reordenar, adicionar, remover com confirmação", async ({ page }) => {
    await createProjectViaWizard(page, "Oficina Seções");
    const list = page.getByRole("list", { name: "Seções" });
    await expect(list.getByRole("listitem").first()).toBeVisible();
    const names = () => list.getByRole("listitem").allInnerTexts();

    const before = await names();
    expect(before[1]).toContain("Faixa animada");
    await page.getByRole("button", { name: "Mover Faixa animada para cima" }).click();
    expect((await names())[0]).toContain("Faixa animada");

    // Adicionar seção
    await page.getByRole("button", { name: "Adicionar seção" }).click();
    await page.getByRole("list", { name: "Tipos de seção" }).getByRole("button", { name: /Catálogo de produtos/ }).click();
    await expect(list.getByRole("button", { name: "Catálogo", exact: true })).toBeVisible();
    await expect(preview(page).locator('[data-section-type="catalog"]')).toHaveCount(1);

    // Remover: cancelar mantém, confirmar remove
    await page.getByRole("button", { name: "Remover Catálogo" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancelar" }).click();
    await expect(list.getByRole("button", { name: "Catálogo", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Remover Catálogo" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Remover seção" }).click();
    await expect(list.getByRole("button", { name: "Catálogo", exact: true })).toHaveCount(0);
    await expect(preview(page).locator('[data-section-type="catalog"]')).toHaveCount(0);

    // Ocultar seção
    await page.getByRole("button", { name: "Ocultar Dúvidas" }).click();
    await expect(preview(page).locator('[data-section-type="faq"]')).toHaveCount(0);

    // Persistência da ordem
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Tudo salvo")).toBeVisible();
    await page.reload();
    await expect(list.getByRole("listitem").first()).toContainText("Faixa animada");
  });

  test("altera cores e visualiza em larguras diferentes", async ({ page }) => {
    await createProjectViaWizard(page, "Oficina Cores");
    await page.getByRole("tab", { name: "Identidade" }).click();
    const primary = page.getByRole("textbox", { name: "Cor principal", exact: true });
    await primary.fill("#22aa55");
    const root = preview(page).locator(".site-root");
    await expect(root).toHaveAttribute("style", /--site-primary:\s*#22aa55/);

    for (const [label, width] of [
      ["Celular (390 px)", "390px"],
      ["Tablet (834 px)", "834px"],
      ["Computador (1440 px)", "1440px"],
    ] as const) {
      await page.getByRole("button", { name: label }).click();
      await expect(page.locator("[data-viewport]")).toHaveCSS("width", width);
    }
  });

  test("lista e exclui projetos com confirmação", async ({ page }) => {
    await createProjectViaWizard(page, "Projeto Para Excluir");
    await page.goto("/studio");
    const card = page.getByRole("listitem").filter({ hasText: "Projeto Para Excluir" });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: "Excluir Projeto Para Excluir" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Excluir projeto" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "Projeto Para Excluir" })).toHaveCount(0);
  });

  test("segmento sem modelo dedicado usa o Essencial, sem conteúdo de outro segmento", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/studio/new");
    await page.getByRole("radio", { name: /Advocacia/ }).click();
    await page.getByLabel("Nome comercial").fill("Escritório Teste");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("heading", { name: "Modelo inicial" })).toBeVisible();

    // Só o Essencial é oferecido; modelos de outros segmentos não aparecem.
    const choices = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio");
    await expect(choices).toHaveCount(1);
    await expect(choices.first()).toContainText("Essencial");
    await expect(choices.first()).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("Ainda não há modelo exclusivo para este segmento")).toBeVisible();
    await expect(page.getByText(/Outros modelos/)).toHaveCount(0);

    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Criar site" }).click();
    await page.waitForURL(/\/studio\/projects\/[0-9a-f-]{36}$/, { timeout: 30_000 });

    const site = preview(page).locator(".site-root");
    await expect(site).toContainText("Advocacia", { timeout: 30_000 });
    const text = (await site.innerText()).toLowerCase();
    for (const term of ["oficina", "carro", "armaç", "ótica", "coleção", "tênis"]) expect(text).not.toContain(term);
    await expect(preview(page).locator('[data-section-type="sceneStory"]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("segmento com modelo dedicado oferece o dedicado e o Essencial, nunca de outro segmento", async ({ page }) => {
    await page.goto("/studio/new");
    await page.getByRole("radio", { name: /Ótica/ }).click();
    await page.getByLabel("Nome comercial").fill("Ótica Teste");
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    const choices = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio");
    await expect(choices).toHaveCount(2);
    await expect(choices.nth(0)).toContainText("Ótica Atelier");
    await expect(choices.nth(0)).toHaveAttribute("aria-checked", "true");
    await expect(choices.nth(1)).toContainText("Essencial");
    await expect(page.getByRole("radiogroup", { name: "Modelo inicial" })).not.toContainText("Garagem");
  });

  test("assistente mostra os seis segmentos prioritários primeiro, na ordem oficial", async ({ page }) => {
    await page.goto("/studio/new");
    const radios = page.getByRole("radiogroup", { name: "Segmento" }).getByRole("radio");
    await expect(radios).toHaveCount(14);
    const labels = await radios.evaluateAll((els) => els.slice(0, 6).map((el) => el.querySelector("span span")?.textContent ?? ""));
    expect(labels).toEqual(["Oficina mecânica", "Barbearia", "Beleza", "Loja de roupas", "Loja de calçados", "Loja de variedades"]);
    await expect(radios.first()).toHaveAttribute("aria-checked", "true");
  });

  for (const { radio, name, label, title } of [
    { radio: /^Barbearia/, name: "Barbearia Teste", label: "Barbearia", title: "Corte na medida do seu estilo." },
    { radio: /^Loja de variedades/, name: "Variedades Teste", label: "Loja de variedades", title: "Tudo o que você procura em um só lugar." },
  ]) {
    test(`${label}: cria o site com o Essencial e os textos do segmento`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto("/studio/new");
      await page.getByRole("radio", { name: radio }).click();
      await page.getByLabel("Nome comercial").fill(name);
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Continuar" }).click();
      const choices = page.getByRole("radiogroup", { name: "Modelo inicial" }).getByRole("radio");
      await expect(choices).toHaveCount(1);
      await expect(choices.first()).toContainText("Essencial");
      await page.getByRole("button", { name: "Continuar" }).click();
      await page.getByRole("button", { name: "Criar site" }).click();
      await page.waitForURL(/\/studio\/projects\/[0-9a-f-]{36}$/, { timeout: 30_000 });

      const site = preview(page).locator(".site-root");
      await expect(site).toContainText(title, { timeout: 30_000 });
      await expect(site).toContainText(label);
      const text = (await site.innerText()).toLowerCase();
      for (const term of ["oficina", "carro", "armaç", "ótica", "coleção", "tênis"]) expect(text).not.toContain(term);
      await expect(preview(page).locator('[data-section-type="sceneStory"]')).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }

  test("valida campos obrigatórios e telefone no assistente", async ({ page }) => {
    await page.goto("/studio/new");
    await page.getByLabel("WhatsApp").fill("123");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Informe o nome comercial.")).toBeVisible();
    await expect(page.getByText("Número com quantidade de dígitos inválida.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Estilo visual" })).toHaveCount(0);
  });
});
