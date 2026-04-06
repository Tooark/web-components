import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  framework: getAbsolutePath("@storybook/web-components-vite"),
  stories: ["../stories/**/*.stories.@(ts|mdx)"],
  addons: [],
  async viteFinal(viteConfig) {
    const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

    viteConfig.resolve = viteConfig.resolve || {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias || {}),
      "@tooark/core": path.resolve(rootDir, "packages/core/src/index.ts")
    };

    return viteConfig;
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
