import path from "node:path";
import { expect, test } from "@playwright/test";

/**
 * Regressão visual das demonstrações dos modelos protegidos (Etapa 1B).
 *
 * Condições determinísticas: movimento reduzido, sem WebGL (imagem substituta no lugar
 * da cena 3D), fontes carregadas, animações e cursor desativados, página inteira.
 *
 * - Garagem, Ótica Atelier e Coleção Editorial: o conteúdo das imagens é mascarado (a
 *   otimização de imagens muda os pixels das fotos) com `visual-mask.css`: cada imagem vira
 *   um retângulo preto na própria camada, com o mesmo tamanho e posição. Mudanças de
 *   dimensão, proporção ou posição continuam aparecendo, e textos/botões sobre as imagens
 *   seguem comparados; layout, textos e cores são comparados integralmente.
 *   (A opção `mask` do Playwright não serve: ela pinta por cima de tudo, inclusive textos.)
 * - Essencial: sem máscara, comparação integral.
 * - Em todos: a textura de granulação de filme (ruído decorativo aleatório, só no estilo
 *   Cinematográfico) é ocultada durante a captura (`visual-no-grain.css`). A existência e as
 *   propriedades da granulação são verificadas à parte, no fim deste arquivo.
 *
 * As referências ficam em `visual.spec.ts-snapshots/` e foram geradas no Linux: em outros
 * sistemas as fontes são renderizadas de outro jeito, então o teste é pulado. Atualizar as
 * referências (`--update-snapshots`) só com plano aprovado.
 */

const TEMPLATES = [
  { id: "mechanic-cinematic", mask: true, grain: true },
  { id: "optics-atelier", mask: true, grain: false },
  { id: "fashion-editorial", mask: true, grain: false },
  { id: "universal-essential", mask: false, grain: false },
];
const MASK_CSS = path.join(__dirname, "visual-mask.css");
const NO_GRAIN_CSS = path.join(__dirname, "visual-no-grain.css");
const WIDTHS = [
  [390, 844],
  [834, 1112],
  [1440, 900],
] as const;

test.describe("regressão visual (demonstrações)", () => {
  test.skip(process.platform !== "linux", "Referências visuais geradas no Linux; em outros sistemas as fontes são renderizadas de outro jeito.");

  for (const { id, mask } of TEMPLATES) {
    for (const [width, height] of WIDTHS) {
      test(`${id} em ${width}px`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.setViewportSize({ width, height });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.addInitScript(() => {
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
            if (type.startsWith("webgl")) return null;
            return (original as (...a: unknown[]) => unknown).call(this, type, ...args);
          } as typeof original;
        });
        const broken: string[] = [];
        page.on("response", (r) => {
          if (r.status() >= 400) broken.push(`${r.status()} ${decodeURIComponent(r.url())}`);
        });

        await page.goto(`/demo/${id}`, { waitUntil: "networkidle" });
        // Percorre a página para carregar imagens sob demanda; depois volta ao topo.
        for (let y = 0; y < 25; y++) {
          await page.mouse.wheel(0, 900);
          await page.waitForTimeout(60);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);

        // Imagens sob demanda fora da tela na horizontal (faixas com rolagem lateral) não carregam com a
        // rolagem vertical: força o carregamento de todas para a captura ser sempre a mesma.
        await page.locator("img").evaluateAll(async (imgs) => {
          for (const img of imgs as HTMLImageElement[]) if (img.loading === "lazy") img.loading = "eager";
          await Promise.all(
            (imgs as HTMLImageElement[]).map((img) =>
              img.complete
                ? null
                : new Promise((done) => {
                    img.addEventListener("load", done, { once: true });
                    img.addEventListener("error", done, { once: true });
                  }),
            ),
          );
        });

        // A máscara esconde o conteúdo das imagens, não a falha delas: toda imagem precisa ter carregado.
        const notLoaded = await page.locator("img").evaluateAll((imgs) =>
          (imgs as HTMLImageElement[]).filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
        );
        expect(notLoaded, "imagens que não carregaram").toEqual([]);
        expect(broken, "respostas com erro").toEqual([]);

        await expect(page).toHaveScreenshot(`${id}-${width}.png`, {
          fullPage: true,
          animations: "disabled",
          caret: "hide",
          // Máscara das imagens (ver visual-mask.css): na própria camada, sem esconder o que fica por cima.
          // Granulação oculta só na captura (ver visual-no-grain.css e a verificação própria abaixo).
          stylePath: mask ? [NO_GRAIN_CSS, MASK_CSS] : [NO_GRAIN_CSS],
          // Nenhum pixel pode mudar além de 1% de distância de cor. A tolerância absorve só o ruído de
          // pontilhado dos degradês grandes (medido: até 2 níveis em 255), invisível a olho nu.
          maxDiffPixels: 0,
          threshold: 0.01,
          timeout: 30_000,
        });
      });
    }
  }
});

/** Valores calculados pelo navegador para a granulação (src/features/site-renderer/site.css), a 1440×900. */
const GRAIN = {
  content: '""',
  position: "fixed",
  top: "-450px",
  left: "-720px",
  zIndex: "60",
  pointerEvents: "none",
  opacity: "0.06",
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
};

test.describe("granulação de filme (oculta nas capturas, verificada aqui)", () => {
  for (const { id, grain } of TEMPLATES) {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      test(`${id}: granulação ${grain ? "presente e inalterada" : "ausente"} (movimento ${reducedMotion === "reduce" ? "reduzido" : "normal"})`, async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.emulateMedia({ reducedMotion });
        await page.goto(`/demo/${id}`);
        const root = page.locator(".site-root");
        expect(await root.evaluate((el) => el.classList.contains("site-grain"))).toBe(grain);
        const { animation, ...props } = await root.evaluate((el) => {
          const s = getComputedStyle(el, "::after");
          return {
            content: s.content,
            position: s.position,
            top: s.top,
            left: s.left,
            zIndex: s.zIndex,
            pointerEvents: s.pointerEvents,
            opacity: s.opacity,
            backgroundImage: s.backgroundImage,
            animation: [s.animationName, s.animationDuration, s.animationTimingFunction, s.animationIterationCount].join(" "),
          };
        });
        if (!grain) {
          expect(props.content).toBe("none");
          return;
        }
        expect(props).toEqual(GRAIN);
        // Animada normalmente; parada com movimento reduzido.
        expect(animation).toBe(reducedMotion === "reduce" ? "none 0s ease 1" : "site-grain 0.9s steps(4) infinite");
      });
    }
  }
});
