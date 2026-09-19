// Regras de segurança do conteúdo: o JSON do Tiptap vem de fora (banco, API,
// outro usuário), então URLs e cores entram por lista de permissão e nós ou
// marcas fora do schema caem, em vez de derrubar o documento inteiro.

import type { JSONContent } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// Caracteres de controle e espaços no meio da URL são o truque clássico para passar `java\tscript:`.
// biome-ignore lint/suspicious/noControlCharactersInRegex: a faixa de controle é justamente o que se remove
const STRIP = /[\x00-\x1F\x7F-\x9F\s]/g;

/**
 * URL aceita em `href`/`src`/`poster`: absoluta em http(s), mailto ou tel, ou relativa (`/caminho`, `#ancora`,
 * `?busca`, `./` e `../`). Fora: `javascript:`, `data:`, `blob:`, `vbscript:` e qualquer outro esquema.
 */
export function isSafeUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const url = value.replace(STRIP, "");
  if (!url) return false;
  if (/^(\/|#|\?|\.\.?\/)/.test(url)) return true;
  try {
    return SAFE_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

/** Nome de host sem esquema ("exemplo.com/pagina"), a que o formulário de link acrescenta `https://`. */
export function looksLikeHostname(value: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#].*)?$/i.test(value.trim());
}

/** Valor de cor aceito em `color`: hex, nome CSS ou função rgb/hsl sem `;` (evita injetar outras declarações). */
export function isSafeColor(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^(#[0-9a-f]{3,8}|[a-z]{3,24}|(rgb|rgba|hsl|hsla)\([0-9.,%\s/]{1,40}\))$/i.test(value.trim())
  );
}

const ALIGNMENTS = new Set(["left", "center", "right", "justify"]);

type JSONMark = NonNullable<JSONContent["marks"]>[number];

function sanitizeMark(mark: JSONMark, schema: Schema): JSONMark | null {
  if (!mark || typeof mark.type !== "string" || !schema.marks[mark.type]) return null;
  const attrs = { ...(mark.attrs ?? {}) };
  if (mark.type === "link") {
    if (!isSafeUrl(attrs.href)) return null;
    attrs.href = (attrs.href as string).replace(STRIP, "");
  }
  if (mark.type === "textStyle" || mark.type === "highlight") {
    if (attrs.color != null && !isSafeColor(attrs.color)) delete attrs.color;
    if (attrs.backgroundColor != null && !isSafeColor(attrs.backgroundColor)) delete attrs.backgroundColor;
  }
  const next: JSONMark = { ...mark };
  if (Object.keys(attrs).length > 0) {
    next.attrs = attrs;
  } else {
    delete next.attrs;
  }
  return next;
}

function sanitizeNode(node: JSONContent, schema: Schema): JSONContent | null {
  if (!node || typeof node.type !== "string" || !schema.nodes[node.type]) return null;
  const attrs = { ...(node.attrs ?? {}) };

  if (node.type === "image" || node.type === "video") {
    if (!isSafeUrl(attrs.src)) return null;
    attrs.src = (attrs.src as string).replace(STRIP, "");
    if (attrs.poster != null && !isSafeUrl(attrs.poster)) delete attrs.poster;
  }
  if (attrs.textAlign != null && !ALIGNMENTS.has(String(attrs.textAlign))) delete attrs.textAlign;
  if (node.type === "heading") {
    const level = Number(attrs.level);
    attrs.level = Number.isInteger(level) ? Math.min(4, Math.max(1, level)) : 1;
  }

  const marks = Array.isArray(node.marks)
    ? node.marks.map((mark) => sanitizeMark(mark, schema)).filter((mark): mark is JSONMark => mark !== null)
    : undefined;
  const content = Array.isArray(node.content)
    ? node.content.map((child) => sanitizeNode(child, schema)).filter((child): child is JSONContent => child !== null)
    : undefined;

  const next: JSONContent = { ...node };
  if (Object.keys(attrs).length > 0) {
    next.attrs = attrs;
  } else {
    delete next.attrs;
  }
  if (marks) next.marks = marks;
  if (content) next.content = content;
  return next;
}

/**
 * Sanitiza um documento do Tiptap contra o schema do editor: nós e marcas desconhecidos são removidos (com os
 * filhos), links, imagens e vídeos com URL fora da lista de permissão caem, cores inválidas somem e `textAlign`
 * e `level` ficam nos valores previstos. `null` continua `null`.
 */
export function sanitizeWysiwygContent(content: JSONContent | null | undefined, schema: Schema): JSONContent | null {
  if (!content) return null;
  const doc = sanitizeNode(content, schema);
  if (!doc) return null;
  return doc;
}
