import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/web-components-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  framework: getAbsolutePath("@storybook/web-components-vite"),
  core: {
    // Evita escrita concorrente no cache de sessão (dev server + vitest)
    disableTelemetry: true
  },
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  // Arquivos estaticos: a imagem que o uploader de exemplo do wysiwyg devolve, o logo da sidebar (manager.ts) e o
  // favicon.svg, que o Storybook usa no lugar do proprio por estar na raiz do diretorio.
  staticDirs: ["../public"],
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

    // Os tokens de cor são light-dark(). No `storybook build` o Vite 8 minifica o CSS com o Lightning CSS mirando
    // "baseline-widely-available" (Chrome 107, Safari 16...), que não conhece light-dark() e a troca pelo polyfill
    // `var(--lightningcss-light, a) var(--lightningcss-dark, b)`; ele só funciona onde há um `color-scheme`
    // declarado, e a lib só o declara em theme="light|dark", então todo host sem o atributo ficava sem cor.
    // Declarar os navegadores que já suportam light-dark() mantém a função nativa, como no dist/styles.css.
    viteConfig.build = {
      ...viteConfig.build,
      cssTarget: ["chrome123", "edge123", "firefox120", "safari17.5"]
    };

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
      "@tooark/code": path.resolve(rootDir, "packages/code/src/index.ts"),
      "@tooark/wysiwyg": path.resolve(rootDir, "packages/wysiwyg/src/index.ts")
    };

    return viteConfig;
  }
};

export default config;

// biome-ignore lint/suspicious/noExplicitAny: o campo framework exige o literal do nome, como no template do Storybook
function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
