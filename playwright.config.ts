import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Testes de navegação ponta a ponta.
 * Usam um diretório de dados isolado (.data-test) para não tocar nos seus projetos.
 * Por padrão, sobem a versão de produção (build + start) para medir o
 * comportamento real; use E2E_DEV=1 para testar contra o servidor de desenvolvimento.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: process.env.E2E_DEV
      ? `npx next dev --hostname 127.0.0.1 --port ${PORT}`
      : `npx next start --hostname 127.0.0.1 --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { CWS_DATA_DIR: ".data-test" },
  },
});
