// Tipos

// Custom Elements
export { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";

// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkWysiwygInstance } from "./engine";
export {
  createWysiwygEditor,
  createWysiwygViewer,
  EMPTY_DOC,
  resolveWysiwygTheme
} from "./engine";
export { registerTooarkWysiwyg } from "./register";
// Estilos
export { ensureWysiwygStyles, WYSIWYG_STYLE_ID, wysiwygCss } from "./styles";
export type {
  ArkWysiwygContent,
  ArkWysiwygEditorOptions,
  ArkWysiwygTheme,
  ArkWysiwygToolbarItem,
  ArkWysiwygViewerOptions,
  JSONContent
} from "./types";
