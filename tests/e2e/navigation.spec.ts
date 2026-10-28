import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, trackErrors } from "./helpers";

test.describe("navegação da plataforma", () => {
  test("página inicial carrega e leva ao Studio", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("linguagem de cinema");
    await page.getByRole("link", { name: "Abrir Studio" }).click();
    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.getByRole("heading", { name: "Seus projetos" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("áreas do Studio abrem sem erros", async ({ page }) => {
    const errors = trackErrors(page);
    for (const [path, heading] of [
      ["/studio/templates", "Modelos"],
      ["/studio/assets", "Recursos"],
      ["/studio/integrations", "Integrações"],
      ["/studio/settings", "Conta e acesso"],
      ["/studio/new", "Criar novo site"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  test("integrações mostram o estado real (sem IA, sem Firebase)", async ({ page }) => {
    await page.goto("/studio/integrations");
    await expect(page.getByText("Sem IA (regras locais)")).toBeVisible();
    await expect(page.getByText("Não configurado")).toBeVisible();
  });

  test("rota de captura não existe em produção", async ({ request }) => {
    test.skip(Boolean(process.env.E2E_DEV), "Somente na versão de produção");
    const res = await request.get("/dev/capture?shot=mech-hero");
    expect(res.status()).toBe(404);
  });

  for (const width of [390, 834, 1440]) {
    test(`página inicial sem rolagem horizontal em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expectNoHorizontalOverflow(page);
    });
  }
});
