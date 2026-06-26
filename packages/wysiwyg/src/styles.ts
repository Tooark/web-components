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

.ark-wysiwyg__toolbar {
  display: flex;
  flex-wrap: wrap;
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

.ark-wysiwyg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}
.ark-wysiwyg__btn:hover { background: rgba(100, 116, 139, 0.15); }
.ark-wysiwyg__btn:focus-visible { outline: 2px solid #6366f1; outline-offset: 1px; }
.ark-wysiwyg__btn[aria-pressed="true"] {
  background: rgba(99, 102, 241, 0.16);
  border-color: rgba(99, 102, 241, 0.5);
}

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
