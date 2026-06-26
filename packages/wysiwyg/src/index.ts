// Tipos
export type {
  ArkWysiwygTheme,
  ArkWysiwygContent,
  ArkWysiwygToolbarItem,
  ArkWysiwygEditorOptions,
  ArkWysiwygViewerOptions,
  JSONContent
} from "./types";

// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkWysiwygInstance } from "./engine";
export {
  createWysiwygEditor,
  createWysiwygViewer,
  resolveWysiwygTheme,
  EMPTY_DOC
} from "./engine";

// Estilos
export { ensureWysiwygStyles, wysiwygCss, WYSIWYG_STYLE_ID } from "./styles";

// Custom Elements
export { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";
export { registerTooarkWysiwyg } from "./register";
