import { createWysiwygViewer, type ArkWysiwygInstance } from "../engine";
import { ensureWysiwygStyles } from "../styles";
import type { ArkWysiwygContent, ArkWysiwygTheme } from "../types";

/**
 * Viewer somente-leitura (Custom Element) que renderiza o mesmo JSON do editor.
 *
 * Usa Tiptap em modo `editable: false` — por isso renderiza o conteúdo de forma
 * segura a partir do JSON, sem injetar HTML arbitrário.
 *
 * Conteúdo via propriedade `content` (JSON do Tiptap). Atributo: `theme`.
 */
export class ArkWysiwygViewer extends HTMLElement {
  static readonly tagName = "ark-wysiwyg-viewer";

  private instance: ArkWysiwygInstance | null = null;
  private root: HTMLDivElement | null = null;
  private pendingContent: ArkWysiwygContent | null = null;

  static get observedAttributes(): string[] {
    return ["theme"];
  }

  /** Conteúdo a renderizar como JSON do Tiptap. */
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
    if (name === "theme") this.instance.setTheme(this.getTheme());
  }

  private getTheme(): ArkWysiwygTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    if (value === "light" || value === "dark") return value;
    return "auto";
  }

  private build(): void {
    this.teardown();

    if (this.pendingContent === null) {
      this.pendingContent = this.content;
    }

    const root = document.createElement("div");
    root.className = "ark-wysiwyg ark-wysiwyg--viewer";

    const mount = document.createElement("div");
    mount.className = "ark-wysiwyg__content";
    root.appendChild(mount);

    this.appendChild(root);
    this.root = root;

    this.instance = createWysiwygViewer(mount, {
      content: this.pendingContent,
      theme: this.getTheme()
    });
  }

  private teardown(): void {
    this.instance?.destroy();
    this.instance = null;
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}

export default ArkWysiwygViewer;
