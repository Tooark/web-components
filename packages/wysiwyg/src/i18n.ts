// Rótulos da toolbar. O pacote não depende de @tooark/core, então carrega o
// próprio dicionário; `custom` recebe um JSON parcial por cima do inglês.

import type { ArkWysiwygLabels, ArkWysiwygLang } from "./types";

const en: ArkWysiwygLabels = {
  textStyle: "Text style",
  paragraph: "Normal",
  heading: "Heading",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strikethrough",
  code: "Code",
  textColor: "Text color",
  highlight: "Highlight",
  noColor: "No color",
  alignLeft: "Align left",
  alignCenter: "Align center",
  alignRight: "Align right",
  alignJustify: "Justify",
  bulletList: "Bulleted list",
  orderedList: "Numbered list",
  indent: "Increase indent",
  outdent: "Decrease indent",
  link: "Link",
  linkUrl: "URL",
  apply: "Apply",
  remove: "Remove",
  invalidUrl: "Enter a valid http(s), mailto or tel address",
  image: "Image",
  video: "Video",
  blockquote: "Quote",
  horizontalRule: "Horizontal rule",
  clearFormat: "Clear formatting",
  undo: "Undo",
  redo: "Redo",
  uploading: "Uploading"
};

const pt: ArkWysiwygLabels = {
  textStyle: "Estilo do texto",
  paragraph: "Normal",
  heading: "Título",
  bold: "Negrito",
  italic: "Itálico",
  underline: "Sublinhado",
  strike: "Tachado",
  code: "Código",
  textColor: "Cor do texto",
  highlight: "Marca-texto",
  noColor: "Sem cor",
  alignLeft: "Alinhar à esquerda",
  alignCenter: "Centralizar",
  alignRight: "Alinhar à direita",
  alignJustify: "Justificar",
  bulletList: "Lista com marcadores",
  orderedList: "Lista numerada",
  indent: "Aumentar recuo",
  outdent: "Diminuir recuo",
  link: "Link",
  linkUrl: "URL",
  apply: "Aplicar",
  remove: "Remover",
  invalidUrl: "Informe um endereço http(s), mailto ou tel válido",
  image: "Imagem",
  video: "Vídeo",
  blockquote: "Citação",
  horizontalRule: "Linha horizontal",
  clearFormat: "Limpar formatação",
  undo: "Desfazer",
  redo: "Refazer",
  uploading: "Enviando"
};

const es: ArkWysiwygLabels = {
  textStyle: "Estilo del texto",
  paragraph: "Normal",
  heading: "Título",
  bold: "Negrita",
  italic: "Cursiva",
  underline: "Subrayado",
  strike: "Tachado",
  code: "Código",
  textColor: "Color del texto",
  highlight: "Resaltado",
  noColor: "Sin color",
  alignLeft: "Alinear a la izquierda",
  alignCenter: "Centrar",
  alignRight: "Alinear a la derecha",
  alignJustify: "Justificar",
  bulletList: "Lista con viñetas",
  orderedList: "Lista numerada",
  indent: "Aumentar sangría",
  outdent: "Reducir sangría",
  link: "Enlace",
  linkUrl: "URL",
  apply: "Aplicar",
  remove: "Quitar",
  invalidUrl: "Ingrese una dirección http(s), mailto o tel válida",
  image: "Imagen",
  video: "Vídeo",
  blockquote: "Cita",
  horizontalRule: "Línea horizontal",
  clearFormat: "Borrar formato",
  undo: "Deshacer",
  redo: "Rehacer",
  uploading: "Enviando"
};

const LOCALES: Record<Exclude<ArkWysiwygLang, "custom">, ArkWysiwygLabels> = { en, pt, es };

/**
 * Resolve os rótulos da toolbar: `en`, `pt` ou `es` (desconhecido cai em `en`); `localeJson` (objeto ou JSON)
 * sobrescreve chave a chave, e é a única fonte de `custom`. Só strings entram; JSON inválido é ignorado.
 */
export function resolveWysiwygLabels(
  lang?: string | null,
  localeJson?: string | Partial<ArkWysiwygLabels> | null
): ArkWysiwygLabels {
  const base = LOCALES[(lang || "en").toLowerCase() as Exclude<ArkWysiwygLang, "custom">] ?? en;
  let overrides: Partial<ArkWysiwygLabels> = {};
  if (typeof localeJson === "string" && localeJson.trim()) {
    try {
      overrides = JSON.parse(localeJson) as Partial<ArkWysiwygLabels>;
    } catch {
      overrides = {};
    }
  } else if (localeJson && typeof localeJson === "object") {
    overrides = localeJson;
  }
  const labels: ArkWysiwygLabels = { ...base };
  for (const key of Object.keys(labels) as Array<keyof ArkWysiwygLabels>) {
    const value = overrides[key];
    if (typeof value === "string" && value) labels[key] = value;
  }
  return labels;
}
