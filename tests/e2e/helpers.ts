import { expect, type Page } from "@playwright/test";

/** Coleta erros de console/página para garantir que nenhuma tela quebra silenciosamente. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const text = m.text();
    // Recursos ausentes são verificados separadamente; erros de WebGL do navegador de teste (sem GPU) são ignorados.
    if (/Failed to load resource|WebGL|GPU stall/i.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "a página não deve ter rolagem horizontal").toBeLessThanOrEqual(1);
}

/** Cria um projeto pelo assistente e retorna o id. */
export async function createProjectViaWizard(page: Page, name: string, options: { segment?: string; whatsapp?: string } = {}) {
  await page.goto("/studio/new");
  if (options.segment) await page.getByRole("radio", { name: new RegExp(options.segment) }).click();
  await page.getByLabel("Nome comercial").fill(name);
  if (options.whatsapp) await page.getByLabel("WhatsApp").fill(options.whatsapp);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Estilo visual" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Modelo inicial" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByRole("heading", { name: "Revisão" })).toBeVisible();
  await page.getByRole("button", { name: "Criar site" }).click();
  await page.waitForURL(/\/studio\/projects\/[0-9a-f-]{36}$/, { timeout: 30_000 });
  return page.url().split("/").pop()!;
}
