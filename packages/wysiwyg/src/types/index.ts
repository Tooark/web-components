import type { JSONContent } from "@tiptap/core";
import type { ArkThemeSelected } from "@tooark/tokens";

/** Tema do editor/viewer. "auto" segue o color-scheme do host, ou a preferência do sistema sem lado fixo. */
export type ArkWysiwygTheme = "auto" | ArkThemeSelected;

/**
 * Conteúdo armazenado: JSON do Tiptap/ProseMirror.
 *
 * Optamos por JSON (e não HTML cru) por segurança — é o formato nativo do
 * ProseMirror e evita a superfície de XSS associada a importar HTML arbitrário.
 */
export type ArkWysiwygContent = JSONContent;

/** Itens disponíveis na toolbar do editor. */
export type ArkWysiwygToolbarItem =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "ordered-list"
  | "blockquote"
  | "horizontal-rule"
  | "undo"
  | "redo";

export type ArkWysiwygEditorOptions = {
  /** Conteúdo inicial (JSON do Tiptap). */
  content?: ArkWysiwygContent | null;
  /** Tema visual. Default: "auto". */
  theme?: ArkWysiwygTheme;
  /** Texto exibido quando o editor está vazio. */
  placeholder?: string;
  /** Se o conteúdo é editável. Default: true. */
  editable?: boolean;
  /** Itens da toolbar; `false` oculta a toolbar. */
  toolbar?: ArkWysiwygToolbarItem[] | false;
  /** Callback disparado a cada alteração de conteúdo. */
  onChange?: (content: ArkWysiwygContent) => void;
};

export type ArkWysiwygViewerOptions = {
  /** Conteúdo a renderizar (JSON do Tiptap). */
  content?: ArkWysiwygContent | null;
  /** Tema visual. Default: "auto". */
  theme?: ArkWysiwygTheme;
};

/** Re-export do tipo nativo do Tiptap para conveniência. */
export type { JSONContent };
