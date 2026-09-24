// Tipa document.createElement, querySelector e closest com a classe do elemento (sem cast no consumidor).
import type { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";

declare global {
  interface HTMLElementTagNameMap {
    "ark-wysiwyg-editor": ArkWysiwygEditor;
    "ark-wysiwyg-viewer": ArkWysiwygViewer;
  }
}
