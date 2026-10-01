// Troca o <title> estatico do Storybook gerado ("<pacote> - Storybook" no index.html, "Storybook" no iframe.html)
// pela marca: o template do manager nao tem opcao para isso e quem nao roda JS (previa de link, buscador) le o
// HTML como veio. A troca em tempo de execucao fica em apps/storybook/.storybook/manager-head.html.
// Uso: node scripts/storybook-title.mjs (depois do `storybook build`)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BRAND = "Tooark Web Components";
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "apps/storybook/storybook-static");

for (const file of ["index.html", "iframe.html"]) {
  const target = path.join(outDir, file);
  const html = readFileSync(target, "utf8");
  const next = html.replace(/<title>[^<]*<\/title>/, `<title>${BRAND}</title>`);
  // Sem <title> o template mudou: falha o build em vez de publicar o titulo antigo em silencio.
  if (!next.includes(`<title>${BRAND}</title>`)) {
    console.error(`storybook-title: <title> nao encontrado em ${file}`);
    process.exit(1);
  }
  writeFileSync(target, next);
}
console.log(`storybook-title: <title> = "${BRAND}"`);
