// Empacota cada pacote publicável (como o `pnpm publish` faria: workspace: resolvido, publishConfig.directory
// respeitado) e confere o tarball com o publint (campos, exports, files) e o attw (tipos por condição, ESM/CJS).
// Uso: node scripts/check-publish.mjs [nome-do-pacote ...]   (sem argumentos: todos)

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(rootDir, "packages");
const filter = new Set(process.argv.slice(2));
const isWindows = process.platform === "win32";

const packages = readdirSync(packagesDir).filter((name) => {
  const manifest = path.join(packagesDir, name, "package.json");
  if (!existsSync(manifest)) return false;
  const pkg = JSON.parse(readFileSync(manifest, "utf8"));
  return !pkg.private && (filter.size === 0 || filter.has(name) || filter.has(pkg.name));
});

const out = mkdtempSync(path.join(tmpdir(), "tooark-pack-"));
let failed = false;

// Le um arquivo de dentro do .tgz sem depender do tar do sistema (o bsdtar do Windows le "C:" como host remoto).
function readFromTarball(tarball, wanted) {
  const data = gunzipSync(readFileSync(tarball));
  let offset = 0;
  while (offset + 512 <= data.length) {
    const raw = data.subarray(offset, offset + 100).toString("utf8");
    const name = raw.includes("\0") ? raw.slice(0, raw.indexOf("\0")) : raw;
    if (!name) break;
    const size =
      Number.parseInt(
        data
          .subarray(offset + 124, offset + 136)
          .toString("utf8")
          .trim(),
        8
      ) || 0;
    if (name === wanted) return data.subarray(offset + 512, offset + 512 + size).toString("utf8");
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  throw new Error(`${wanted} nao esta em ${tarball}`);
}

function run(command, args, options = {}) {
  const result = spawnSync(isWindows ? `${command}.cmd` : command, args, {
    cwd: rootDir,
    encoding: "utf8",
    shell: isWindows,
    ...options
  });
  return { code: result.status ?? 1, output: `${result.stdout ?? ""}${result.stderr ?? ""}`.trim() };
}

for (const name of packages) {
  const pkg = JSON.parse(readFileSync(path.join(packagesDir, name, "package.json"), "utf8"));
  console.log(`\n== ${pkg.name}`);
  const packed = run("pnpm", ["--filter", pkg.name, "pack", "--pack-destination", out]);
  if (packed.code !== 0) {
    failed = true;
    console.log(`pack FALHOU\n${packed.output}`);
    continue;
  }
  const tarball = readdirSync(out)
    .filter((file) => file.startsWith(`${pkg.name.replace("@", "").replace("/", "-")}-`) && file.endsWith(".tgz"))
    .map((file) => path.join(out, file))
    .sort()
    .at(-1);
  if (!tarball) {
    failed = true;
    console.log("tarball nao encontrado");
    continue;
  }

  // O manifesto dentro do tarball e o que vai para o npm: nenhum workspace: pode sobrar.
  const manifest = readFromTarball(tarball, "package/package.json");
  const leaked = Object.entries({ ...JSON.parse(manifest).dependencies, ...JSON.parse(manifest).peerDependencies })
    .filter(([, range]) => String(range).startsWith("workspace:"))
    .map(([dep]) => dep);
  if (leaked.length > 0) {
    failed = true;
    console.log(`workspace: sobrou em ${leaked.join(", ")}`);
  }

  const publint = run("pnpm", ["exec", "publint", tarball, "--strict"]);
  console.log(publint.output || "publint ok");
  if (publint.code !== 0) failed = true;

  const attw = run("pnpm", [
    "exec",
    "attw",
    tarball,
    "--format",
    "table-flipped",
    "--ignore-rules",
    "cjs-resolves-to-esm",
    "--exclude-entrypoints",
    "styles.css",
    "tokens.css"
  ]);
  console.log(attw.output);
  if (attw.code !== 0) failed = true;
}

rmSync(out, { recursive: true, force: true });
if (failed) {
  console.error("\ncheck-publish: falhou");
  process.exit(1);
}
console.log("\ncheck-publish: ok");
