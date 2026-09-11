// Sincroniza a versão do package.json raiz (fonte única) para todos os
// pacotes em packages/*. Roda automaticamente no lifecycle "version"
// (ex.: `pnpm version patch`) ou manualmente via `pnpm version:sync`.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootPkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const version = rootPkg.version;

const packagesDir = path.join(rootDir, "packages");
const updated = [];

for (const name of readdirSync(packagesDir)) {
  const pkgPath = path.join(packagesDir, name, "package.json");
  if (!existsSync(pkgPath)) continue;

  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw);
  if (pkg.version === version) continue;

  const next = raw.replace(`"version": "${pkg.version}"`, `"version": "${version}"`);
  writeFileSync(pkgPath, next);
  updated.push(`${pkg.name}: ${pkg.version} -> ${version}`);
}

if (updated.length === 0) {
  console.log(`Todos os pacotes ja estao em ${version}.`);
} else {
  for (const line of updated) console.log(line);
}
