// Entry point for the wysiwyg package
import "./tag-map";

// Custom Elements
export { ArkWysiwygEditor, ArkWysiwygViewer } from "./components";

// Tipos
// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkWysiwygInstance } from "./engine";
export {
  createWysiwygEditor,
  createWysiwygExtensions,
  createWysiwygViewer,
  DEFAULT_MAX_FILE_SIZE,
  EMPTY_DOC,
  HEADING_LEVELS,
  resolveWysiwygTheme,
  Video
} from "./engine";
export { resolveWysiwygLabels } from "./i18n";
export { registerTooarkWysiwyg } from "./register";
// Seguranca do conteudo
export { isSafeColor, isSafeUrl, sanitizeWysiwygContent } from "./security";
// Estilos
export { ensureWysiwygStyles, WYSIWYG_STYLE_ID, wysiwygCss } from "./styles";
export type {
  ArkWysiwygContent,
  ArkWysiwygEditorOptions,
  ArkWysiwygLabels,
  ArkWysiwygLang,
  ArkWysiwygTheme,
  ArkWysiwygToolbarGroup,
  ArkWysiwygToolbarItem,
  ArkWysiwygUploadError,
  ArkWysiwygUploadErrorReason,
  ArkWysiwygUploader,
  ArkWysiwygUploadKind,
  ArkWysiwygUploadResult,
  ArkWysiwygViewerOptions,
  JSONContent
} from "./types";
export { ARK_WYSIWYG_DEFAULT_TOOLBAR, ARK_WYSIWYG_TOOLBAR_GROUPS } from "./types";
