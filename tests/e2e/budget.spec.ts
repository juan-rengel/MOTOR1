import { expect, test, type Browser } from "@playwright/test";

/**
 * Orçamento de bytes das demonstrações (Etapa 1B), medido como um celular (390×844, tela 3×),
 * sem WebGL e com a página percorrida até o fim (todas as imagens sob demanda carregadas).
 *
 * Limites = valores medidos depois da otimização de imagens + 3% de margem. Antes da 1B
 * (f1ac997): Garagem 776/386 KB, Ótica 887/464 KB, Coleção 698/291 KB, Essencial 382/0 KB
 * (total/imagens). Aumentar um limite só com plano aprovado.
 */
const BUDGETS_KB: Record<string, { total: number; images: number }> = {
  "mechanic-cinematic": { total: 532, images: 124 },
  "optics-atelier": { total: 601, images: 159 },
  "fashion-editorial": { total: 511, images: 85 },
  "universal-essential": { total: 399, images: 0 },
};

async function measure(browser: Browser, id: string) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith("webgl")) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
    } as typeof original;
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  const urls = new Map<string, string>();
  let total = 0;
  let images = 0;
  cdp.on("Network.responseReceived", (e) => urls.set(e.requestId, e.response.url));
  cdp.on("Network.loadingFinished", (e) => {
    const url = urls.get(e.requestId) ?? "";
    total += e.encodedDataLength;
    if (url.includes("/assets/demo/") || url.includes("%2Fassets%2Fdemo%2F")) images += e.encodedDataLength;
  });
  await page.goto(`/demo/${id}`, { waitUntil: "networkidle" });
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(120);
  }
  await page.waitForLoadState("networkidle");
  await context.close();
  return { totalKB: Math.round(total / 1024), imagesKB: Math.round(images / 1024) };
}

test.describe("orçamento de bytes (celular, sem WebGL, página inteira)", () => {
  for (const [id, budget] of Object.entries(BUDGETS_KB)) {
    test(`${id}: até ${budget.total} KB no total e ${budget.images} KB de imagens`, async ({ browser }) => {
      test.setTimeout(120_000);
      const { totalKB, imagesKB } = await measure(browser, id);
      test.info().annotations.push({ type: "medição", description: `${totalKB} KB no total, ${imagesKB} KB de imagens` });
      expect(totalKB, "bytes transferidos no total").toBeLessThanOrEqual(budget.total);
      expect(imagesKB, "bytes de imagens de demonstração").toBeLessThanOrEqual(budget.images);
    });
  }
});
