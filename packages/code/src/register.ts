import { ArkCodeEditor } from "./components";

/**
 * Registra o Custom Element `<ark-code-editor>` no navegador.
 * Chame antes de usar o componente em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkCode(): void {
  if (!customElements.get(ArkCodeEditor.tagName)) {
    customElements.define(ArkCodeEditor.tagName, ArkCodeEditor);
  }
}
