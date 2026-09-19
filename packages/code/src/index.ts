// Custom Element
export { ArkCodeEditor } from "./components";

// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkCodeEditorInstance } from "./engine";
export { createCodeEditor, resolveCodeTheme } from "./engine";
export { registerTooarkCode } from "./register";
export type {
  ArkCodeCompletion,
  ArkCodeCompletionSource,
  ArkCodeEditorOptions,
  ArkCodeFormatter,
  ArkCodeIndentStyle,
  ArkCodeLanguage,
  ArkCodeLineEnding,
  ArkCodeTheme
} from "./types";
