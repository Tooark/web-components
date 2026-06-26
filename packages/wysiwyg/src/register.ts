import { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";

/**
 * Registra os Custom Elements `<ark-wysiwyg-editor>` e `<ark-wysiwyg-viewer>`.
 * Chame antes de usar em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkWysiwyg(): void {
  if (!customElements.get(ArkWysiwygEditor.tagName)) {
    customElements.define(ArkWysiwygEditor.tagName, ArkWysiwygEditor);
  }
  if (!customElements.get(ArkWysiwygViewer.tagName)) {
    customElements.define(ArkWysiwygViewer.tagName, ArkWysiwygViewer);
  }
}
