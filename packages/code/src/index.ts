// Custom Element
export { ArkCodeEditor } from "./components";

// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkCodeEditorInstance } from "./engine";
export { createCodeEditor, resolveCodeTheme } from "./engine";
export { registerTooarkCode } from "./register";
export type { ArkCodeEditorOptions, ArkCodeLanguage, ArkCodeTheme } from "./types";
