// Tipa document.createElement, querySelector e closest com a classe do elemento (sem cast no consumidor).
import type { ArkCodeEditor } from "./components";

declare global {
  interface HTMLElementTagNameMap {
    "ark-code-editor": ArkCodeEditor;
  }
}
