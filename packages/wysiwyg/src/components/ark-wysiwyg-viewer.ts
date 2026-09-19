import { type ArkThemeSelected, observeColorScheme } from "@tooark/tokens";
import { type ArkWysiwygInstance, createWysiwygViewer } from "../engine";
import { ensureWysiwygStyles } from "../styles";
import type { ArkWysiwygContent, ArkWysiwygTheme } from "../types";

/**
 * Viewer somente-leitura (Custom Element) que renderiza o mesmo JSON do editor.
 *
 * Usa Tiptap em modo `editable: false` com o mesmo schema do editor (links,
 * cores, alinhamento, imagens e vídeos externos): renderiza a partir do JSON,
 * sanitizado ao entrar (`sanitizeWysiwygContent`), sem injetar HTML
 * arbitrário; links abrem em nova aba com `rel="noopener noreferrer nofollow"`.
 *
 * Conteúdo via propriedade `content` (JSON do Tiptap). Atributo: `theme`.
 */
export class ArkWysiwygViewer extends HTMLElement {
  static readonly tagName = "ark-wysiwyg-viewer";

  private instance: ArkWysiwygInstance | null = null;
  private root: HTMLDivElement | null = null;
  private pendingContent: ArkWysiwygContent | null = null;
  /** Para de observar o tema da página; só existe com `theme="auto"`. */
  private disposeTheme: (() => void) | null = null;

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

  /** Tema efetivamente aplicado (depois de resolver `auto`); `null` antes de renderizar. */
  get resolvedTheme(): ArkThemeSelected | null {
    return this.instance?.resolvedTheme() ?? null;
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
      this.applyTheme(this.getTheme());
      this.syncThemeObserver();
    }
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
    this.root.setAttribute("data-ark-theme", this.instance.resolvedTheme());
    this.syncThemeObserver();
  }

  // Em `auto`, a troca de tema da página re-resolve o tema do viewer; com tema fixo não há o que observar.
  private syncThemeObserver(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.getTheme() !== "auto") return;
    this.disposeTheme = observeColorScheme(this, () => this.applyTheme("auto"));
  }

  // O engine marca o mount com data-ark-theme; o CSS do tema lê a raiz .ark-wysiwyg, então ela recebe o mesmo.
  private applyTheme(theme: ArkWysiwygTheme): void {
    if (!this.instance) return;
    this.instance.setTheme(theme);
    this.root?.setAttribute("data-ark-theme", this.instance.resolvedTheme());
  }

  private teardown(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    this.instance?.destroy();
    this.instance = null;
    if (this.root) {
      this.root.remove();
      this.root = null;
    }
  }
}

export default ArkWysiwygViewer;
