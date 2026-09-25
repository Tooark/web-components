import { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";

/**
 * Registra os Custom Elements `<ark-wysiwyg-editor>` e `<ark-wysiwyg-viewer>`.
 * Chame antes de usar em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkWysiwyg(): void {
  // Fora do navegador (SSR) não há registro de elementos: no-op, e o cliente registra na hidratação.
  if (typeof customElements === "undefined") return;
  if (!customElements.get(ArkWysiwygEditor.tagName)) {
    customElements.define(ArkWysiwygEditor.tagName, ArkWysiwygEditor);
  }
  if (!customElements.get(ArkWysiwygViewer.tagName)) {
    customElements.define(ArkWysiwygViewer.tagName, ArkWysiwygViewer);
  }
}
