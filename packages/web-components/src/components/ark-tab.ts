import {
  type ArkIntent,
  type ArkLocale,
  type ArkRounded,
  type ArkSize,
  type ArkTabsFill,
  type ArkTabsVariant,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";

/** Ícone do botão de fechar (chrome próprio do componente). */
const CLOSE_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <path d="M6 6l8 8M14 6l-8 8"></path>
  </svg>`;

type ArkTabPalette = {
  ring: string;
  underline: string;
  editorTop: string;
  soft: string;
  solid: string;
};

/**
 * Aba de um ark-tabs. O PRÓPRIO host é o controle (`role="tab"`, foco,
 * teclado): os filhos do usuário — ícone, texto, badge — ficam onde estão.
 * Na variante `editor` pode ser fechável (`closable`, com botão próprio,
 * clique do meio e tecla Delete) e marcar alterações não salvas (`dirty`).
 * Seleção e roving tabindex são coordenados pelo ark-tabs; `variant`,
 * `size`, `intent`, `theme` e idioma chegam propagados dele.
 */
export class ArkTab extends HTMLElement {
  static readonly tagName = "ark-tab";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private closeEl: HTMLButtonElement | null = null;
  private dirtyEl: HTMLSpanElement | null = null;

  static get observedAttributes(): string[] {
    return [
      "value",
      "selected",
      "disabled",
      "controls",
      "closable",
      "dirty",
      "variant",
      "size",
      "intent",
      "rounded",
      "fill",
      "theme",
      "lang",
      "locale-json",
      "data-ark-tabstop",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("auxclick", this.handleAuxClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  connectedCallback(): void {
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value);
  }

  /** Aba ativa; o ark-tabs reflete aqui o seu `value`. */
  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean | string | null | undefined) {
    this.toggleAttribute("selected", coerceBooleanAttr(value));
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  get dirty(): boolean {
    return this.hasAttribute("dirty");
  }

  set dirty(value: boolean | string | null | undefined) {
    this.toggleAttribute("dirty", coerceBooleanAttr(value));
  }

  /** Fechável só na variante `editor`; nas outras o atributo é ignorado. */
  get closable(): boolean {
    return this.hasAttribute("closable") && this.getVariant() === "editor";
  }

  set closable(value: boolean | string | null | undefined) {
    this.toggleAttribute("closable", coerceBooleanAttr(value));
  }

  /** Pede a seleção desta aba: emite `change` com o valor, que o ark-tabs consolida. */
  select(): void {
    if (this.disabled || this.selected) return;
    this.dispatchEvent(new CustomEvent("change", { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  /** Pede o fechamento: emite `ark-close`; remover a aba do DOM é do app. */
  close(): void {
    if (!this.closable || this.disabled) return;
    this.dispatchEvent(new CustomEvent("ark-close", { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.closeEl && event.composedPath().includes(this.closeEl)) {
      event.stopPropagation();
      this.close();
      return;
    }
    this.select();
  };

  // Clique do meio fecha, como nas abas do navegador.
  private readonly handleAuxClick = (event: MouseEvent): void => {
    if (event.button !== 1 || !this.closable || this.disabled) return;
    event.preventDefault();
    this.close();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.target !== this || this.disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select();
    } else if (event.key === "Delete") {
      event.preventDefault();
      this.close();
    }
  };

  private getVariant(): ArkTabsVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "chips" || variant === "editor" ? variant : "underline";
  }

  private getFill(variant: ArkTabsVariant): ArkTabsFill {
    const fill = (this.getAttribute("fill") || "").toLowerCase();
    if (fill === "none" || fill === "soft" || fill === "solid") return fill;
    return variant === "chips" ? "soft" : "none";
  }

  private getLocale(): ArkLocale {
    const tabs = this.closest("ark-tabs");
    const lang = this.getAttribute("lang") || tabs?.getAttribute("lang") || "en";
    const customJson = this.getAttribute("locale-json") || tabs?.getAttribute("locale-json") || undefined;
    return resolveLocale(lang, customJson);
  }

  private getPalette(intent: ArkIntent): ArkTabPalette {
    const palettes: Record<ArkIntent, ArkTabPalette> = {
      primary: {
        ring: "ark:ring-primary-ring",
        underline: "ark:border-primary",
        editorTop: "ark:border-t-primary",
        soft: "ark:bg-primary-soft ark:text-primary-soft-fg",
        solid: "ark:bg-primary ark:text-primary-fg"
      },
      secondary: {
        ring: "ark:ring-secondary-ring",
        underline: "ark:border-secondary",
        editorTop: "ark:border-t-secondary",
        soft: "ark:bg-secondary-soft ark:text-secondary-soft-fg",
        solid: "ark:bg-secondary ark:text-secondary-fg"
      },
      success: {
        ring: "ark:ring-success-ring",
        underline: "ark:border-success",
        editorTop: "ark:border-t-success",
        soft: "ark:bg-success-soft ark:text-success-soft-fg",
        solid: "ark:bg-success ark:text-success-fg"
      },
      warning: {
        ring: "ark:ring-warning-ring",
        underline: "ark:border-warning",
        editorTop: "ark:border-t-warning",
        soft: "ark:bg-warning-soft ark:text-warning-soft-fg",
        solid: "ark:bg-warning ark:text-warning-fg"
      },
      danger: {
        ring: "ark:ring-danger-ring",
        underline: "ark:border-danger",
        editorTop: "ark:border-t-danger",
        soft: "ark:bg-danger-soft ark:text-danger-soft-fg",
        solid: "ark:bg-danger ark:text-danger-fg"
      },
      info: {
        ring: "ark:ring-info-ring",
        underline: "ark:border-info",
        editorTop: "ark:border-t-info",
        soft: "ark:bg-info-soft ark:text-info-soft-fg",
        solid: "ark:bg-info ark:text-info-fg"
      },
      neutral: {
        ring: "ark:ring-neutral-ring",
        underline: "ark:border-neutral",
        editorTop: "ark:border-t-neutral",
        soft: "ark:bg-neutral-soft ark:text-neutral-soft-fg",
        solid: "ark:bg-neutral ark:text-neutral-fg"
      }
    };

    return palettes[intent];
  }

  private computeClasses(): { host: string[]; close: string } {
    const base =
      "ark:relative ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:select-none ark:items-center ark:gap-2 ark:whitespace-nowrap ark:font-medium ark:transition ark:outline-none ark:ring-inset ark:focus-visible:ring-2 ark:aria-disabled:cursor-not-allowed ark:aria-disabled:opacity-50 ark:aria-disabled:pointer-events-none";

    // Altura pelo token --ark-size-* (min-height): chips alinham com botões e toggles da mesma toolbar.
    const sizes: Record<ArkSize, { host: string; close: string }> = {
      xs: { host: "ark:min-h-(--ark-size-xs) ark:px-2 ark:text-xs", close: "ark:h-3.5 ark:w-3.5" },
      sm: { host: "ark:min-h-(--ark-size-sm) ark:px-2.5 ark:text-xs", close: "ark:h-4 ark:w-4" },
      md: { host: "ark:min-h-(--ark-size-md) ark:px-3 ark:text-sm", close: "ark:h-4 ark:w-4" },
      lg: { host: "ark:min-h-(--ark-size-lg) ark:px-4 ark:text-base", close: "ark:h-5 ark:w-5" },
      xl: { host: "ark:min-h-(--ark-size-xl) ark:px-5 ark:text-lg", close: "ark:h-5 ark:w-5" }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    const palette = this.getPalette(normalizeIntent(this.getAttribute("intent"), "primary"));
    const selected = this.selected;

    // Cantos: chips são pílulas por padrão; editor arredonda só o topo, porque a aba senta na linha de base.
    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      xs: "ark:rounded-xs",
      sm: "ark:rounded-sm",
      md: "ark:rounded-md",
      lg: "ark:rounded-lg",
      xl: "ark:rounded-xl",
      full: "ark:rounded-full"
    };
    const roundedTopMap: Record<ArkRounded, string> = {
      none: "ark:rounded-t-none",
      xs: "ark:rounded-t-xs",
      sm: "ark:rounded-t-sm",
      md: "ark:rounded-t-md",
      lg: "ark:rounded-t-lg",
      xl: "ark:rounded-t-xl",
      full: "ark:rounded-t-full"
    };
    const roundedAttr = (this.getAttribute("rounded") || "").toLowerCase() as ArkRounded;
    const rounded = (target: ArkTabsVariant): string => {
      const map = target === "editor" ? roundedTopMap : roundedMap;
      return map[roundedAttr] ?? map[target === "chips" ? "full" : "none"];
    };

    // Pintura da aba ativa: chips vêm suaves por padrão; nas outras variantes é opt-in (soft ou solid).
    const variant = this.getVariant();
    const fill = this.getFill(variant);
    const fillClasses = fill === "solid" ? palette.solid : fill === "soft" ? palette.soft : "";

    // Sem transição de seleção: trocar de aba é interação de alta frequência. A linha de base da faixa é um
    // box-shadow interno do ark-tabs, então a borda inferior (underline) ou o fundo (editor) da aba ativa a cobre.
    const variants: Record<ArkTabsVariant, string> = {
      underline: [
        "ark:border-b-2 ark:border-transparent",
        rounded("underline"),
        selected ? `${palette.underline} ${fillClasses || "ark:text-fg"}` : "ark:text-fg-muted ark:hover:text-fg"
      ].join(" "),
      chips: [
        rounded("chips"),
        selected
          ? fillClasses || "ark:bg-surface-muted ark:text-fg"
          : "ark:text-fg-muted ark:hover:bg-surface-muted ark:hover:text-fg"
      ].join(" "),
      editor: [
        "ark:border-t-2 ark:border-r ark:border-r-border",
        rounded("editor"),
        selected
          ? `${palette.editorTop} ${fillClasses || "ark:bg-surface ark:text-fg"}`
          : "ark:border-t-transparent ark:text-fg-muted ark:hover:bg-surface ark:hover:text-fg"
      ].join(" ")
    };

    return {
      host: [base, size.host, palette.ring, variants[variant]].join(" ").split(/\s+/).filter(Boolean),
      close: size.close
    };
  }

  // Botão de fechar: nó próprio, fora da ordem de tabulação (Delete fecha pelo teclado), só na variante editor.
  private syncClose(active: boolean, sizeClasses: string): void {
    if (!active) {
      this.closeEl?.remove();
      this.closeEl = null;
      return;
    }

    if (!this.closeEl) {
      const button = document.createElement("button");
      button.type = "button";
      button.tabIndex = -1;
      button.innerHTML = CLOSE_SVG;
      this.appendChild(button);
      this.closeEl = button;
    }

    const label = this.getLocale().closeTab;
    this.closeEl.className = [
      "ark:-mr-1 ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-sm ark:p-0.5 ark:text-fg-muted ark:transition ark:hover:bg-surface-muted ark:hover:text-fg",
      sizeClasses
    ].join(" ");
    this.closeEl.disabled = this.disabled;
    this.closeEl.setAttribute("aria-label", label);
    this.closeEl.title = label;
  }

  // Ponto de "não salvo": estático (D-056) e nomeado para o leitor de tela.
  private syncDirty(active: boolean): void {
    if (!active) {
      this.dirtyEl?.remove();
      this.dirtyEl = null;
      return;
    }

    if (!this.dirtyEl) {
      const dot = document.createElement("span");
      // Antes do botão de fechar, quando ele existir.
      this.insertBefore(dot, this.closeEl);
      this.dirtyEl = dot;
    }

    this.dirtyEl.className = "ark:inline-block ark:h-2 ark:w-2 ark:shrink-0 ark:rounded-full ark:bg-current";
    this.dirtyEl.setAttribute("role", "img");
    this.dirtyEl.setAttribute("aria-label", this.getLocale().unsaved);
  }

  private applyOwnClasses(next: string[]): void {
    this.syncingClass = true;
    for (const cls of this.ownClasses) {
      if (!next.includes(cls)) this.classList.remove(cls);
    }
    for (const cls of next) {
      if (!this.classList.contains(cls)) this.classList.add(cls);
    }
    this.ownClasses = next;
    this.syncingClass = false;
  }

  private updateAppearance(): void {
    const disabled = this.disabled;
    const selected = this.selected;

    this.setAttribute("role", "tab");
    this.setAttribute("aria-selected", selected ? "true" : "false");
    // Roving tabindex: a aba ativa é a parada de Tab; sem aba ativa o ark-tabs elege uma via data-ark-tabstop.
    this.setAttribute("tabindex", !disabled && (selected || this.hasAttribute("data-ark-tabstop")) ? "0" : "-1");
    if (disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
    const controls = this.getAttribute("controls");
    if (controls) {
      this.setAttribute("aria-controls", controls);
    } else {
      this.removeAttribute("aria-controls");
    }

    const classes = this.computeClasses();
    this.applyOwnClasses(classes.host);
    this.syncClose(this.closable, classes.close);
    this.syncDirty(this.dirty);

    applyTestHooks(this, "tab", this);
    if (this.closeEl) applyTestHooks(this, "tab", this.closeEl, "close");
    if (this.dirtyEl) applyTestHooks(this, "tab", this.dirtyEl, "dirty");
  }
}

export default ArkTab;
