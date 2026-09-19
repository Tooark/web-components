// Imprime a secao do CHANGELOG.md de uma versao (`## [X.Y.Z] - data` ate o proximo `## `), para virar as notas
// da GitHub Release. Sem secao, imprime um texto padrao. Uso: node scripts/changelog-section.mjs 1.2.0

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const version = process.argv[2];
if (!version) {
  console.error("uso: changelog-section.mjs <versao>");
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
// Os links de referencia ([1.0.0]: https://...) ficam no fim do arquivo e nao fazem parte da secao.
const body = lines
  .slice(start + 1, end)
  .filter((line) => !/^\[[^\]]+\]: /.test(line))
  .join("\n")
  .trim();
console.log(body || `Release v${version}.`);
