import { ArkCodeEditor } from "./components";

/**
 * Registra o Custom Element `<ark-code-editor>` no navegador.
 * Chame antes de usar o componente em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkCode(): void {
  // Fora do navegador (SSR) não há registro de elementos: no-op, e o cliente registra na hidratação.
  if (typeof customElements === "undefined") return;
  if (!customElements.get(ArkCodeEditor.tagName)) {
    customElements.define(ArkCodeEditor.tagName, ArkCodeEditor);
  }
}
