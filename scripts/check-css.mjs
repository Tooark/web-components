// Smoke test do CSS gerado: garante que o arquivo publicado foi de fato
// compilado pelo Tailwind (nada de @import/@source crus) e que contém o que
// os componentes precisam. Falha o build quando algo está errado.
//
// Uso: node scripts/check-css.mjs <arquivo.css> [--min-bytes N] [--expect texto ...]

import fs from "node:fs";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));

// Verifica se o arquivo CSS existe e é válido antes de prosseguir.
if (!file) {
  console.error("check-css: informe o caminho do CSS");
  process.exit(2);
}

const minBytesIndex = args.indexOf("--min-bytes");
const minBytes = minBytesIndex !== -1 ? Number(args[minBytesIndex + 1]) : 1024;

// --expect: substrings literais;
// --expect-class: nomes de classe (escapados como o Tailwind escreve no seletor, ex.: "ark:inline-flex" → ".ark\:inline-flex").
function collect(flag) {
  const out = [];

  // Itera sobre os argumentos para coletar os valores associados à flag fornecida.
  for (let i = 0; i < args.length; i++) {
    // Se o argumento atual não corresponde à flag, pula para o próximo.
    if (args[i] !== flag) {
      continue;
    }

    // Coleta todos os valores que seguem a flag até encontrar outra flag ou o fim dos argumentos.
    for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) {
      out.push(args[j]);
    }
  }

  return out;
}

// Função para escapar nomes de classe para uso em seletores CSS.
const escapeClass = (name) => `.${name.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`)}`;

// Coleta as classes esperadas e as substrings literais a partir dos argumentos da linha de comando.
const expected = [...collect("--expect"), ...collect("--expect-class").map(escapeClass)];

const css = fs.readFileSync(file, "utf8");
const errors = [];

// Verifica se o CSS atende aos critérios mínimos de tamanho.
if (Buffer.byteLength(css) < minBytes) {
  errors.push(`tem só ${Buffer.byteLength(css)} bytes (mínimo ${minBytes})`);
}

// Verifica se o CSS ainda contém diretivas do Tailwind que não foram processadas.
if (/@import\s+["']tailwindcss/.test(css)) {
  errors.push('ainda contém @import "tailwindcss" — o Tailwind não processou o arquivo');
}

// Verifica se o CSS ainda contém diretivas @source do Tailwind que não foram processadas.
if (/@source\b/.test(css)) {
  errors.push("ainda contém @source — o Tailwind não processou o arquivo");
}

// Verifica se o CSS ainda contém diretivas @theme do Tailwind que não foram processadas.
if (/@theme\b/.test(css)) {
  errors.push("ainda contém @theme — o Tailwind não processou o arquivo");
}

// Itera sobre as classes e substrings esperadas para verificar se estão presentes no CSS.
for (const text of expected) {
  // Verifica se o CSS contém a classe ou substring esperada.
  if (!css.includes(text)) {
    errors.push(`não contém "${text}"`);
  }
}

// Verifica se houve algum erro durante a verificação do CSS.
if (errors.length) {
  console.error(`check-css: ${file} inválido:`);

  // Imprime cada erro encontrado durante a verificação do CSS.
  for (const error of errors) {
    console.error(`  - ${error}`);
  }

  process.exit(1);
}

console.log(`check-css: ${file} ok (${(Buffer.byteLength(css) / 1024).toFixed(1)} KB)`);
