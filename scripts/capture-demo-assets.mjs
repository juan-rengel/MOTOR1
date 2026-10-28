/**
 * Gera as imagens de demonstração a partir das cenas 3D do projeto.
 *
 * Pré-requisitos:
 *   1. Servidor de desenvolvimento rodando:  npm run dev
 *   2. Navegador do Playwright instalado:    npx playwright install chromium
 *
 * Uso:  npm run assets:demo            (todas as imagens)
 *       npm run assets:demo -- mech-hero mech-side   (apenas algumas)
 *
 * Variável opcional: CAPTURE_URL (padrão http://127.0.0.1:3000)
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = process.env.CAPTURE_URL ?? "http://127.0.0.1:3000";

// Lista de enquadramentos servida pelo próprio app em desenvolvimento (fonte única: demo-shots.ts).
const response = await fetch(`${baseUrl}/dev/capture/shots`).catch(() => null);
if (!response?.ok) {
  console.error(`Não foi possível obter a lista em ${baseUrl}/dev/capture/shots. O servidor de desenvolvimento está rodando (npm run dev)?`);
  process.exit(1);
}
const shots = await response.json();
const only = process.argv.slice(2);
const selected = only.length ? shots.filter((s) => only.includes(s.id)) : shots;
if (selected.length === 0) {
  console.error("Nenhum enquadramento encontrado.");
  process.exit(1);
}

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
try {
  for (const shot of selected) {
    const page = await browser.newPage({ viewport: { width: shot.width, height: shot.height }, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/dev/capture?shot=${shot.id}`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-scene-ready]", { timeout: 120_000 });
    await page.waitForTimeout(2500);
    // Remove o indicador de desenvolvimento do Next.js da imagem.
    await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove()));
    const out = path.join(root, "public", shot.file);
    await mkdir(path.dirname(out), { recursive: true });
    await page.screenshot({ path: out, type: "jpeg", quality: 86, timeout: 120_000 });
    console.log(`✓ ${shot.id} → public/${shot.file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
