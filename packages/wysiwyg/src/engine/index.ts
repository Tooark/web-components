import type { Extensions, JSONContent } from "@tiptap/core";
import { Editor } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import type { ArkThemeSelected } from "@tooark/tokens";
import type { ArkWysiwygEditorOptions, ArkWysiwygTheme, ArkWysiwygViewerOptions } from "../types";

/** Documento vazio do ProseMirror (um parágrafo). */
export const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export type ArkWysiwygInstance = {
  /** Instância nativa do Tiptap (uso avançado: comandos, eventos, etc.). */
  readonly editor: Editor;
  /** Conteúdo atual como JSON do Tiptap. */
  getJSON(): JSONContent;
  /** Substitui o conteúdo. `null` limpa para um documento vazio. */
  setContent(content: JSONContent | null): void;
  /** Indica se uma mark/node está ativo na seleção (ex.: "bold", "heading"). */
  isActive(name: string, attrs?: Record<string, unknown>): boolean;
  /** Habilita/desabilita a edição. */
  setEditable(editable: boolean): void;
  /** Troca o tema (aplica data-attribute no elemento host). */
  setTheme(theme: ArkWysiwygTheme): void;
  /** Tema efetivamente aplicado (após resolver "auto"). */
  resolvedTheme(): ArkThemeSelected;
  /** Libera a instância do Tiptap. */
  destroy(): void;
};

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Resolve "auto" para "light"/"dark" conforme a preferência do sistema. */
export function resolveWysiwygTheme(theme: ArkWysiwygTheme | undefined): ArkThemeSelected {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return prefersDark() ? "dark" : "light";
}

function applyTheme(element: HTMLElement, theme: ArkThemeSelected): void {
  element.setAttribute("data-ark-theme", theme);
}

type InternalOptions = {
  content?: JSONContent | null;
  theme?: ArkWysiwygTheme;
  placeholder?: string;
  editable: boolean;
  onChange?: (content: JSONContent) => void;
};

function createInstance(element: HTMLElement, options: InternalOptions): ArkWysiwygInstance {
  let resolved = resolveWysiwygTheme(options.theme);

  const extensions: Extensions = [StarterKit];
  if (options.placeholder) {
    extensions.push(Placeholder.configure({ placeholder: options.placeholder }));
  }

  const editor = new Editor({
    element,
    editable: options.editable,
    extensions,
    content: options.content ?? EMPTY_DOC
  });

  if (options.onChange) {
    editor.on("update", () => options.onChange?.(editor.getJSON()));
  }

  applyTheme(element, resolved);

  return {
    editor,
    getJSON: () => editor.getJSON(),
    setContent: (content) => {
      editor.commands.setContent(content ?? EMPTY_DOC);
    },
    isActive: (name, attrs) => editor.isActive(name, attrs),
    setEditable: (editable) => editor.setEditable(editable),
    setTheme: (theme) => {
      resolved = resolveWysiwygTheme(theme);
      applyTheme(element, resolved);
    },
    resolvedTheme: () => resolved,
    destroy: () => editor.destroy()
  };
}

/** Cria um editor WYSIWYG (editável) dentro de `element`. */
export function createWysiwygEditor(element: HTMLElement, options: ArkWysiwygEditorOptions = {}): ArkWysiwygInstance {
  return createInstance(element, {
    content: options.content,
    theme: options.theme,
    placeholder: options.placeholder,
    editable: options.editable ?? true,
    onChange: options.onChange
  });
}

/** Cria um viewer (somente leitura) que renderiza o mesmo JSON do editor. */
export function createWysiwygViewer(element: HTMLElement, options: ArkWysiwygViewerOptions = {}): ArkWysiwygInstance {
  return createInstance(element, {
    content: options.content,
    theme: options.theme,
    editable: false
  });
}
