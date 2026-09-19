export const WYSIWYG_STYLE_ID = "ark-wysiwyg-styles";

/**
 * CSS base do editor/viewer. Plano e independente de Tailwind para que o pacote
 * funcione em qualquer projeto. Temas via atributo `data-ark-theme`.
 */
export const wysiwygCss = `
.ark-wysiwyg {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: inherit;
  color: #0f172a;
}
.ark-wysiwyg[data-ark-theme="dark"] { color: #e2e8f0; }

/* ---------- Toolbar ---------- */
.ark-wysiwyg__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__toolbar {
  border-color: #334155;
  background: #1e293b;
}
.ark-wysiwyg__group {
  display: flex;
  align-items: center;
  gap: 2px;
}
.ark-wysiwyg__item {
  display: inline-flex;
  position: relative;
}
.ark-wysiwyg__separator {
  width: 1px;
  align-self: stretch;
  margin: 4px 2px;
  background: #e2e8f0;
}
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__separator { background: #334155; }

.ark-wysiwyg__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.ark-wysiwyg__btn svg { width: 18px; height: 18px; }
.ark-wysiwyg__btn--text { padding: 0 10px; font-size: 13px; }
.ark-wysiwyg__btn:hover { background: rgba(100, 116, 139, 0.15); }
.ark-wysiwyg__btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
.ark-wysiwyg__btn[aria-pressed="true"] {
  background: rgba(99, 102, 241, 0.16);
  border-color: rgba(99, 102, 241, 0.5);
}
.ark-wysiwyg__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: transparent;
}
/* Barra com a cor atual sob o icone de cor do texto e de marca-texto. */
.ark-wysiwyg__btn--swatch::after {
  content: "";
  position: absolute;
  left: 7px;
  right: 7px;
  bottom: 4px;
  height: 3px;
  border-radius: 2px;
  background: var(--ark-wysiwyg-swatch, transparent);
}

.ark-wysiwyg__select {
  height: 32px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.ark-wysiwyg__select:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
.ark-wysiwyg__select:disabled { opacity: 0.45; cursor: not-allowed; }
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__select {
  border-color: #475569;
  background: #0f172a;
}

/* ---------- Popovers (paletas e link) ---------- */
/* Redefine o que o UA da a [popover]; left/top vem inline, calculados a partir do botao. */
.ark-wysiwyg__popover {
  position: fixed;
  inset: auto;
  margin: 0;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  font-family: inherit;
}
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__popover {
  border-color: #334155;
  background: #1e293b;
  color: #e2e8f0;
}
.ark-wysiwyg__swatches {
  display: grid;
  grid-template-columns: repeat(5, 24px);
  gap: 6px;
}
.ark-wysiwyg__swatch {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(15, 23, 42, 0.15);
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  background: transparent;
}
.ark-wysiwyg__swatch svg { width: 16px; height: 16px; }
.ark-wysiwyg__swatch:hover { transform: scale(1.1); }
.ark-wysiwyg__swatch:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
.ark-wysiwyg__link {
  display: flex;
  align-items: center;
  gap: 6px;
}
.ark-wysiwyg__input {
  width: 16rem;
  max-width: 60vw;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  font-size: 13px;
}
.ark-wysiwyg__input:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
.ark-wysiwyg__input[aria-invalid="true"] { border-color: #dc2626; }
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__input {
  border-color: #475569;
  background: #0f172a;
}
.ark-wysiwyg__error {
  margin: 6px 0 0;
  font-size: 12px;
  color: #dc2626;
}

/* ---------- Conteudo ---------- */
.ark-wysiwyg__content {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}
.ark-wysiwyg[data-ark-theme="dark"] .ark-wysiwyg__content {
  border-color: #334155;
  background: #0f172a;
}
.ark-wysiwyg--viewer .ark-wysiwyg__content {
  border: none;
  background: transparent;
}

.ark-wysiwyg .ProseMirror {
  min-height: 120px;
  padding: 12px 14px;
  outline: none;
  line-height: 1.6;
}
.ark-wysiwyg--viewer .ProseMirror { min-height: 0; padding: 0; }
.ark-wysiwyg .ProseMirror > * + * { margin-top: 0.6em; }
.ark-wysiwyg .ProseMirror h1 { font-size: 1.6em; font-weight: 700; }
.ark-wysiwyg .ProseMirror h2 { font-size: 1.35em; font-weight: 700; }
.ark-wysiwyg .ProseMirror h3 { font-size: 1.15em; font-weight: 700; }
.ark-wysiwyg .ProseMirror h4 { font-size: 1em; font-weight: 700; }
.ark-wysiwyg .ProseMirror ul,
.ark-wysiwyg .ProseMirror ol { padding-left: 1.4em; }
.ark-wysiwyg .ProseMirror ul { list-style: disc; }
.ark-wysiwyg .ProseMirror ol { list-style: decimal; }
.ark-wysiwyg .ProseMirror blockquote {
  border-left: 3px solid #cbd5e1;
  padding-left: 12px;
  color: #475569;
}
.ark-wysiwyg[data-ark-theme="dark"] .ProseMirror blockquote {
  border-left-color: #475569;
  color: #94a3b8;
}
.ark-wysiwyg .ProseMirror code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9em;
  background: rgba(100, 116, 139, 0.18);
  padding: 0.1em 0.3em;
  border-radius: 4px;
}
.ark-wysiwyg .ProseMirror hr {
  border: none;
  border-top: 1px solid #cbd5e1;
  margin: 1em 0;
}
.ark-wysiwyg[data-ark-theme="dark"] .ProseMirror hr { border-top-color: #475569; }
.ark-wysiwyg .ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ark-wysiwyg[data-ark-theme="dark"] .ProseMirror a { color: #93c5fd; }
/* Marca-texto: fundo pastel com texto escuro nos dois temas, para ler sempre. */
.ark-wysiwyg .ProseMirror mark {
  color: #0f172a;
  border-radius: 2px;
  padding: 0 0.1em;
}
.ark-wysiwyg .ProseMirror img,
.ark-wysiwyg .ProseMirror video {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}
.ark-wysiwyg .ProseMirror img.ProseMirror-selectednode,
.ark-wysiwyg .ProseMirror video.ProseMirror-selectednode {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}
.ark-wysiwyg[aria-busy="true"] .ark-wysiwyg__content { cursor: progress; }

/* Placeholder (extension-placeholder) */
.ark-wysiwyg .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: #94a3b8;
}
`;

/** Injeta o CSS base no <head> uma única vez. */
export function ensureWysiwygStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(WYSIWYG_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = WYSIWYG_STYLE_ID;
  style.textContent = wysiwygCss;
  document.head.appendChild(style);
}
