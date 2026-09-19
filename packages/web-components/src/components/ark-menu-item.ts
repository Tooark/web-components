import { type ArkIntent, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

/** Ícone do item marcado (chrome próprio do componente). */
const CHECK_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9"></path>
  </svg>`;

type ArkMenuItemKind = "item" | "divider" | "static";

/**
 * Item de um ark-menu. O PRÓPRIO host é o item (`role="menuitem"`, foco,
 * teclado): ícone e texto são filhos livres e um filho `slot="trailing"`
 * (atalho, badge) vai para o fim por CSS. `checked` faz dele um
 * `menuitemcheckbox` com o check ao fim; `divider` vira `role="separator"`;
 * `static` é conteúdo não interativo (nome e e-mail do usuário) sem role de
 * item. Seleção, foco e teclado são coordenados pelo ark-menu; `size` e
 * `theme` chegam propagados dele.
 */
export class ArkMenuItem extends HTMLElement {
  static readonly tagName = "ark-menu-item";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private checkEl: HTMLSpanElement | null = null;

  static get observedAttributes(): string[] {
    return ["value", "disabled", "intent", "divider", "checked", "static", "size", "theme", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
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

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Marcado; só faz sentido num item checkbox (atributo `checked` presente, `"false"` é desmarcado). */
  get checked(): boolean {
    return this.hasAttribute("checked") && this.getAttribute("checked") !== "false";
  }

  set checked(value: boolean | string | null | undefined) {
    this.setAttribute("checked", coerceBooleanAttr(value) ? "" : "false");
  }

  /** Item selecionável (não é divisor nem conteúdo estático). */
  get interactive(): boolean {
    return this.kind() === "item";
  }

  /** Seleciona o item: emite `ark-select` com o value, que o ark-menu consolida e fecha em seguida. */
  select(): void {
    if (this.disabled || !this.interactive) return;
    this.dispatchEvent(new CustomEvent("ark-select", { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private kind(): ArkMenuItemKind {
    if (this.hasAttribute("divider")) return "divider";
    if (this.hasAttribute("static")) return "static";
    return "item";
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.select();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.target !== this) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select();
    }
  };

  private getPalette(): string {
    const attr = this.getAttribute("intent");
    if (!attr) return "ark:text-fg ark:hover:bg-surface-muted ark:focus:bg-surface-muted";

    const palettes: Record<ArkIntent, string> = {
      primary: "ark:text-primary ark:hover:bg-primary-soft ark:focus:bg-primary-soft",
      secondary: "ark:text-secondary ark:hover:bg-secondary-soft ark:focus:bg-secondary-soft",
      success: "ark:text-success ark:hover:bg-success-soft ark:focus:bg-success-soft",
      warning: "ark:text-warning ark:hover:bg-warning-soft ark:focus:bg-warning-soft",
      danger: "ark:text-danger ark:hover:bg-danger-soft ark:focus:bg-danger-soft",
      info: "ark:text-info ark:hover:bg-info-soft ark:focus:bg-info-soft",
      neutral: "ark:text-fg ark:hover:bg-neutral-soft ark:focus:bg-neutral-soft"
    };
    return palettes[normalizeIntent(attr, "neutral")];
  }

  private computeClasses(kind: ArkMenuItemKind): { host: string[]; check: string } {
    // Altura pelo token --ark-size-* (min-height), como os demais controles do mesmo size.
    const sizes: Record<ArkSize, { item: string; static: string; check: string }> = {
      xs: {
        item: "ark:min-h-(--ark-size-xs) ark:px-2 ark:text-xs",
        static: "ark:px-2 ark:py-1 ark:text-xs",
        check: "ark:h-3.5 ark:w-3.5"
      },
      sm: {
        item: "ark:min-h-(--ark-size-sm) ark:px-2.5 ark:text-xs",
        static: "ark:px-2.5 ark:py-1 ark:text-xs",
        check: "ark:h-4 ark:w-4"
      },
      md: {
        item: "ark:min-h-(--ark-size-md) ark:px-3 ark:text-sm",
        static: "ark:px-3 ark:py-1.5 ark:text-xs",
        check: "ark:h-4 ark:w-4"
      },
      lg: {
        item: "ark:min-h-(--ark-size-lg) ark:px-3.5 ark:text-base",
        static: "ark:px-3.5 ark:py-2 ark:text-sm",
        check: "ark:h-5 ark:w-5"
      },
      xl: {
        item: "ark:min-h-(--ark-size-xl) ark:px-4 ark:text-lg",
        static: "ark:px-4 ark:py-2 ark:text-base",
        check: "ark:h-5 ark:w-5"
      }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    let host: string;
    if (kind === "divider") {
      host = "ark:my-1 ark:h-px ark:w-full ark:shrink-0 ark:bg-border";
    } else if (kind === "static") {
      host = `ark:flex ark:w-full ark:shrink-0 ark:cursor-default ark:select-none ark:flex-col ark:justify-center ark:text-fg-muted ${size.static}`;
    } else {
      // O foco (não só focus-visible) destaca o item: as setas movem o foco por script.
      host = [
        "ark:flex ark:w-full ark:shrink-0 ark:cursor-pointer ark:select-none ark:items-center ark:gap-2 ark:rounded-md ark:text-left ark:outline-none ark:aria-disabled:cursor-not-allowed ark:aria-disabled:opacity-50 ark:aria-disabled:pointer-events-none",
        size.item,
        this.getPalette()
      ].join(" ");
    }

    return { host: host.split(/\s+/).filter(Boolean), check: size.check };
  }

  // Check ao fim do item marcado: nó próprio, decorativo (o estado vai em aria-checked).
  private syncCheck(active: boolean, sizeClasses: string): void {
    if (!active) {
      this.checkEl?.remove();
      this.checkEl = null;
      return;
    }

    if (!this.checkEl) {
      const check = document.createElement("span");
      check.setAttribute("data-ark-chrome", "check");
      check.setAttribute("aria-hidden", "true");
      check.innerHTML = CHECK_SVG;
      this.appendChild(check);
      this.checkEl = check;
    }
    this.checkEl.className = `ark:ml-auto ark:inline-flex ark:shrink-0 ark:items-center ark:justify-center ark:pl-3 ${sizeClasses}`;
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
    const kind = this.kind();
    const checkbox = kind === "item" && this.hasAttribute("checked");

    if (kind === "divider") {
      this.setAttribute("role", "separator");
      this.setAttribute("aria-orientation", "horizontal");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-disabled");
      this.removeAttribute("aria-checked");
    } else if (kind === "static") {
      // Conteúdo livre dentro do menu: sem semântica de item, fora da navegação por setas.
      this.setAttribute("role", "presentation");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-disabled");
      this.removeAttribute("aria-checked");
    } else {
      this.setAttribute("role", checkbox ? "menuitemcheckbox" : "menuitem");
      // Fora da ordem de Tab: o ark-menu move o foco por setas.
      this.setAttribute("tabindex", "-1");
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
      if (checkbox) {
        this.setAttribute("aria-checked", this.checked ? "true" : "false");
      } else {
        this.removeAttribute("aria-checked");
      }
    }

    const classes = this.computeClasses(kind);
    this.applyOwnClasses(classes.host);
    this.syncCheck(checkbox && this.checked, classes.check);

    // Hook principal no host (testid sem sufixo): menu-item, menu-divider ou menu-static.
    applyTestHooks(this, kind === "item" ? "menu-item" : `menu-${kind}`, this);
    if (this.checkEl) applyTestHooks(this, "menu-item", this.checkEl, "check");
  }
}

export default ArkMenuItem;
