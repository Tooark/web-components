// Imprime a seção do CHANGELOG.md de uma versão (`## [X.Y.Z] - data` até o próximo `## `), para virar as notas
// da GitHub Release. Sem seção, imprime um texto padrão. Uso: node scripts/changelog-section.mjs 1.2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const version = process.argv[2];
if (!version) {
  console.error("uso: changelog-section.mjs <versão>");
  process.exit(1);
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const changelog = readFileSync(path.join(rootDir, "CHANGELOG.md"), "utf8").replaceAll("\r\n", "\n");
const lines = changelog.split("\n");
const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));

if (start < 0) {
  console.log(`Release v${version} of the @tooark/* packages. See CHANGELOG.md for details.`);
  process.exit(0);
}

let end = lines.length;
for (let index = start + 1; index < lines.length; index++) {
  if (lines[index].startsWith("## ")) {
    end = index;
    break;
  }
}
// Os links de referência ([1.0.0]: https://...) ficam no fim do arquivo e não fazem parte da seção.
const body = lines
  .slice(start + 1, end)
  .filter((line) => !/^\[[^\]]+\]: /.test(line))
  .join("\n")
  .trim();
console.log(body || `Release v${version}.`);
