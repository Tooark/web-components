// Sincroniza a versão do package.json raiz (fonte única) para todos os
// pacotes em packages/*. Roda automaticamente no lifecycle "version"
// (ex.: `pnpm version patch`) ou manualmente via `pnpm version:sync`.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Diretório raiz do monorepo e versão atual do package.json raiz.
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootPkg = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));
const version = rootPkg.version;

// Diretório dos pacotes e array para armazenar os pacotes atualizados.
const packagesDir = path.join(rootDir, "packages");
const updated = [];

// Itera sobre os pacotes em packages/* e atualiza a versão se necessário.
for (const name of readdirSync(packagesDir)) {
  const pkgPath = path.join(packagesDir, name, "package.json");

  // Pula se o package.json não existir.
  if (!existsSync(pkgPath)) {
    continue;
  }

  // Lê o conteúdo do package.json do pacote.
  const raw = readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(raw);

  // Pula se a versão do pacote já estiver sincronizada com a versão raiz.
  if (pkg.version === version) {
    continue;
  }

  // Atualiza a versão do pacote para a versão raiz.
  const next = raw.replace(`"version": "${pkg.version}"`, `"version": "${version}"`);
  writeFileSync(pkgPath, next);
  updated.push(`${pkg.name}: ${pkg.version} -> ${version}`);
}

// Verifica se houve pacotes atualizados e exibe o resultado.
if (updated.length === 0) {
  console.log(`Todos os pacotes já estão em ${version}.`);
} else {
  // Exibe os pacotes que foram atualizados.
  for (const line of updated) {
    console.log(line);
  }
}
