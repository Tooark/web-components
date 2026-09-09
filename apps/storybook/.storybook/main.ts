import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  framework: getAbsolutePath("@storybook/web-components-vite"),
  core: {
    // Evita escrita concorrente no cache de sessão (dev server + vitest)
    disableTelemetry: true
  },
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y")
  ],
  async viteFinal(viteConfig) {
    const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

    // Tailwind v4 via plugin Vite (sem PostCSS): processa o preview.css das
    // stories e o CSS da lib importado em preview.ts. Os pacotes publicados
    // compilam o próprio CSS com o Tailwind CLI, sem depender daqui.
    viteConfig.plugins = [...(viteConfig.plugins || []), tailwindcss()];

    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
        // Subpath CSS deve vir antes do alias geral de tokens (Vite casa na ordem).
        "@tooark/tokens/tokens.css": path.resolve(rootDir, "packages/tokens/tokens.css"),
        "@tooark/tokens": path.resolve(rootDir, "packages/tokens/src/index.ts"),
        "@tooark/core": path.resolve(rootDir, "packages/core/src/index.ts"),
        "@tooark/motion": path.resolve(rootDir, "packages/motion/src/index.ts"),
        "@tooark/web-components": path.resolve(rootDir, "packages/web-components/src/index.ts"),
        "@tooark/chart": path.resolve(rootDir, "packages/chart/src/index.ts"),
        "@tooark/wysiwyg": path.resolve(rootDir, "packages/wysiwyg/src/index.ts")
    };

    return viteConfig;
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
