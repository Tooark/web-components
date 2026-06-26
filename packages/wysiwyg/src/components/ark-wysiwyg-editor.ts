import type { Editor } from "@tiptap/core";
import { createWysiwygEditor, type ArkWysiwygInstance } from "../engine";
import { ensureWysiwygStyles } from "../styles";
import type { ArkWysiwygContent, ArkWysiwygTheme, ArkWysiwygToolbarItem } from "../types";

type ToolbarAction = {
  label: string;
  title: string;
  run: (editor: Editor) => void;
  active?: (editor: Editor) => boolean;
};

const TOOLBAR_ACTIONS: Record<ArkWysiwygToolbarItem, ToolbarAction> = {
  bold: { label: "B", title: "Negrito", run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive("bold") },
  italic: { label: "I", title: "Itálico", run: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive("italic") },
  strike: { label: "S", title: "Tachado", run: (e) => e.chain().focus().toggleStrike().run(), active: (e) => e.isActive("strike") },
  code: { label: "</>", title: "Código", run: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive("code") },
  "heading-1": { label: "H1", title: "Título 1", run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e) => e.isActive("heading", { level: 1 }) },
  "heading-2": { label: "H2", title: "Título 2", run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive("heading", { level: 2 }) },
  "heading-3": { label: "H3", title: "Título 3", run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive("heading", { level: 3 }) },
  "bullet-list": { label: "• Lista", title: "Lista", run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive("bulletList") },
  "ordered-list": { label: "1. Lista", title: "Lista numerada", run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive("orderedList") },
  blockquote: { label: "❝", title: "Citação", run: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive("blockquote") },
  "horizontal-rule": { label: "―", title: "Linha", run: (e) => e.chain().focus().setHorizontalRule().run() },
  undo: { label: "↶", title: "Desfazer", run: (e) => e.chain().focus().undo().run() },
  redo: { label: "↷", title: "Refazer", run: (e) => e.chain().focus().redo().run() }
};

const DEFAULT_TOOLBAR: ArkWysiwygToolbarItem[] = [
  "bold",
  "italic",
  "strike",
  "code",
  "heading-1",
  "heading-2",
  "bullet-list",
  "ordered-list",
  "blockquote",
  "horizontal-rule",
  "undo",
  "redo"
];

/**
 * Editor WYSIWYG (Custom Element) baseado em Tiptap.
 *
 * O conteúdo é trocado pela propriedade `content` (JSON do Tiptap), não por atributo.
 * Dispara `ark-wysiwyg-change` (bubbles/composed) com `detail` = JSON a cada edição.
 *
 * Atributos: `theme`, `placeholder`, `editable` ("false" desabilita) e
 * `toolbar` (lista separada por vírgula, ou "none"/"false" para ocultar).
 */
export class ArkWysiwygEditor extends HTMLElement {
  static readonly tagName = "ark-wysiwyg-editor";

  private instance: ArkWysiwygInstance | null = null;
  private root: HTMLDivElement | null = null;
  private toolbarButtons: Array<{ item: ArkWysiwygToolbarItem; button: HTMLButtonElement }> = [];
  private pendingContent: ArkWysiwygContent | null = null;

  static get observedAttributes(): string[] {
    return ["theme", "placeholder", "editable", "toolbar"];
  }

  /** Conteúdo do editor como JSON do Tiptap. */
  get content(): ArkWysiwygContent | null {
    return this.instance ? this.instance.getJSON() : this.pendingContent;
  }

  set content(value: ArkWysiwygContent | null) {
    this.pendingContent = value;
    this.instance?.setContent(value);
  }

  connectedCallback(): void {
    ensureWysiwygStyles();
    this.build();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.instance) return;

    if (name === "theme") {
      this.instance.setTheme(this.getTheme());
      return;
    }
    if (name === "editable") {
      this.instance.setEditable(this.isEditable());
      return;
    }
    // placeholder / toolbar exigem reconstrução.
    this.build();
  }

  private getTheme(): ArkWysiwygTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    if (value === "light" || value === "dark") return value;
    return "auto";
  }

  private isEditable(): boolean {
    return this.getAttribute("editable") !== "false";
  }

  private getToolbarItems(): ArkWysiwygToolbarItem[] | false {
    const raw = this.getAttribute("toolbar");
    if (raw === null) return DEFAULT_TOOLBAR;
    if (raw === "none" || raw === "false" || raw.trim() === "") return false;

    const items = raw
      .split(",")
      .map((token) => token.trim())
      .filter((token): token is ArkWysiwygToolbarItem => token in TOOLBAR_ACTIONS);

    return items.length > 0 ? items : false;
  }

  private build(): void {
    this.teardown();

    if (this.pendingContent === null) {
      this.pendingContent = this.content;
    }

    const root = document.createElement("div");
    root.className = "ark-wysiwyg";

    const toolbarItems = this.getToolbarItems();
    if (toolbarItems) {
      root.appendChild(this.buildToolbar(toolbarItems));
    }

    const mount = document.createElement("div");
    mount.className = "ark-wysiwyg__content";
    root.appendChild(mount);

    this.appendChild(root);
    this.root = root;

    this.instance = createWysiwygEditor(mount, {
      content: this.pendingContent,
      theme: this.getTheme(),
      placeholder: this.getAttribute("placeholder") || undefined,
      editable: this.isEditable(),
      onChange: (content) => {
        this.dispatchEvent(
          new CustomEvent("ark-wysiwyg-change", {
            detail: content,
            bubbles: true,
            composed: true
          })
        );
        this.syncToolbar();
      }
    });

    this.instance.editor.on("selectionUpdate", this.syncToolbar);
    this.syncToolbar();
  }

  private buildToolbar(items: ArkWysiwygToolbarItem[]): HTMLDivElement {
    const toolbar = document.createElement("div");
    toolbar.className = "ark-wysiwyg__toolbar";
    toolbar.setAttribute("part", "toolbar");
    this.toolbarButtons = [];

    for (const item of items) {
      const action = TOOLBAR_ACTIONS[item];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ark-wysiwyg__btn";
      button.textContent = action.label;
      button.title = action.title;
      button.setAttribute("aria-label", action.title);
      button.addEventListener("click", () => {
        if (!this.instance) return;
        action.run(this.instance.editor);
        this.syncToolbar();
      });
      toolbar.appendChild(button);
      this.toolbarButtons.push({ item, button });
    }

    return toolbar;
  }

  private readonly syncToolbar = (): void => {
    if (!this.instance) return;
    for (const { item, button } of this.toolbarButtons) {
      const active = TOOLBAR_ACTIONS[item].active?.(this.instance.editor) ?? false;
      button.setAttribute("aria-pressed", String(active));
    }
  };

  private teardown(): void {
    if (this.instance) {
      this.instance.editor.off("selectionUpdate", this.syncToolbar);
      this.instance.destroy();
      this.instance = null;
    }
    this.toolbarButtons = [];
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}

export default ArkWysiwygEditor;
