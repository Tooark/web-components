// Smoke test do CSS gerado: garante que o arquivo publicado foi de fato
// compilado pelo Tailwind (nada de @import/@source crus) e que contém o que
// os componentes precisam. Falha o build quando algo está errado.
//
// Uso: node scripts/check-css.mjs <arquivo.css> [--min-bytes N] [--expect texto ...]

import fs from "node:fs";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));
if (!file) {
  console.error("check-css: informe o caminho do CSS");
  process.exit(2);
}

const minBytesIndex = args.indexOf("--min-bytes");
const minBytes = minBytesIndex !== -1 ? Number(args[minBytesIndex + 1]) : 1024;

// --expect: substrings literais; --expect-class: nomes de classe (escapados
// como o Tailwind escreve no seletor, ex.: "ark:inline-flex" → ".ark\:inline-flex").
function collect (flag) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== flag) continue;
    for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) out.push(args[j]);
  }
  return out;
}
const escapeClass = (name) => "." + name.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
const expected = [...collect("--expect"), ...collect("--expect-class").map(escapeClass)];

const css = fs.readFileSync(file, "utf8");
const errors = [];

if (Buffer.byteLength(css) < minBytes) {
  errors.push(`tem só ${Buffer.byteLength(css)} bytes (mínimo ${minBytes})`);
}
if (/@import\s+["']tailwindcss/.test(css)) {
  errors.push('ainda contém @import "tailwindcss" — o Tailwind não processou o arquivo');
}
if (/@source\b/.test(css)) {
  errors.push("ainda contém @source — o Tailwind não processou o arquivo");
}
if (/@theme\b/.test(css)) {
  errors.push("ainda contém @theme — o Tailwind não processou o arquivo");
}
for (const text of expected) {
  if (!css.includes(text)) {
    errors.push(`não contém "${text}"`);
  }
}

if (errors.length) {
  console.error(`check-css: ${file} inválido:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`check-css: ${file} ok (${(Buffer.byteLength(css) / 1024).toFixed(1)} KB)`);
