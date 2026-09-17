import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Transforma cada story em um teste Vitest (smoke test + play function),
// executado em browser real via Playwright/Chromium.
export default defineConfig({
  plugins: [
    storybookTest({
      configDir: path.join(dirname, ".storybook")
    })
  ],
  test: {
    name: "storybook",
    // Máquina/CI lentos com browser mode + coverage: folga acima do padrão de 5s
    testTimeout: 30000,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
      // Porta da API do browser mode (padrão 63315). No Windows uma faixa dinâmica reservada pelo sistema
      // (netsh interface ipv4 show excludedportrange protocol=tcp) pode engolir a padrão com EACCES;
      // VITEST_BROWSER_PORT troca a porta sem editar este arquivo.
      api: process.env.VITEST_BROWSER_PORT ? { port: Number(process.env.VITEST_BROWSER_PORT) } : undefined
    },
    coverage: {
      provider: "v8",
      // O código coberto vive nos pacotes do monorepo (resolvidos por alias),
      // fora do root deste app — allowExternal permite medi-los.
      allowExternal: true,
      exclude: [
        "**/*.d.ts",
        "**/dist/**",
        "**/*.stories.ts",
        "**/.storybook/**",
        "**/vitest.config.ts",
        // Módulos virtuais do Vite (ex.: setup injetado pelo addon-vitest):
        // o nome contém \x00 e ":", inválidos como pasta no Windows
        "**/@id/**",
        "**/__x00__*/**",
        "**/*virtual:*/**"
      ]
    }
  }
});
