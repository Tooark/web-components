import { type ArkIntent, type ArkNavVariant, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Contador para o id do host, que o `aria-labelledby` do link referencia. */
let navItemSeq = 0;

type ArkNavItemPalette = { ring: string; soft: string; text: string };

/**
 * Item de um ark-nav. O PRÓPRIO host é a linha (classes, cores do item atual);
 * o texto vem de `label` num nó próprio, o ícone do usuário fica em
 * `slot="icon"` e um badge ou atalho em `slot="trailing"`, todos onde estão.
 * Com `href`, um `<a>` "esticado" cobre o host, recebe o foco e é nomeado pelo
 * conteúdo do host (`aria-labelledby`), como no ark-button: Ctrl/Cmd+clique,
 * clique do meio e "abrir em nova aba" funcionam como num link. Sem `href` o
 * host é um `role="button"`. O clique emite `ark-navigate` cancelável antes de
 * o navegador seguir o link: um app SPA chama `preventDefault()` e roteia por
 * conta própria. `current` marca a página atual (`aria-current="page"`).
 * `divider` vira `role="separator"`. Tamanho, intent, apresentação e o estado
 * de trilho (sidebar ou navbar recolhidas: só o ícone, rótulo sr-only e
 * `title` no host) chegam propagados do ark-nav.
 */
export class ArkNavItem extends HTMLElementBase {
  static readonly tagName = "ark-nav-item";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private anchorEl: HTMLAnchorElement | null = null;
  private labelEl: HTMLSpanElement | null = null;
  /** `title` que o próprio componente escreveu no trilho, para não apagar um do usuário. */
  private appliedTitle: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "href",
      "target",
      "label",
      "value",
      "current",
      "disabled",
      "divider",
      "variant",
      "size",
      "intent",
      "theme",
      "data-ark-rail",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
  }

  connectedCallback(): void {
    upgradeProperties(this);
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

  /** Destino do link; sem ele o item é um botão. */
  get href(): string | null {
    return this.getAttribute("href");
  }

  set href(value: string | null | undefined) {
    reflectAttr(this, "href", value);
  }

  /** `target` do link (`_blank` ganha `rel="noopener noreferrer"`). */
  get target(): string | null {
    return this.getAttribute("target");
  }

  set target(value: string | null | undefined) {
    reflectAttr(this, "target", value);
  }

  /** Texto do item, desenhado num nó próprio (oculto no trilho, pequeno sob o ícone no tabbar). */
  get label(): string | null {
    return this.getAttribute("label");
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value);
  }

  /** Identificador publicado em `ark-navigate` e comparado com o `value` do ark-nav. Padrão: o `href`. */
  get value(): string {
    return this.getAttribute("value") ?? this.getAttribute("href") ?? "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value);
  }

  /** Página atual (`aria-current="page"`); o ark-nav o escreve a partir do próprio `value` quando tem um. */
  get current(): boolean {
    return this.hasAttribute("current");
  }

  set current(value: boolean | string | null | undefined) {
    this.toggleAttribute("current", coerceBooleanAttr(value));
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Linha separadora (`role="separator"`), sem link nem texto. */
  get divider(): boolean {
    return this.hasAttribute("divider");
  }

  set divider(value: boolean | string | null | undefined) {
    this.toggleAttribute("divider", coerceBooleanAttr(value));
  }

  // --- Interação ---

  /** Emite `ark-navigate` (cancelável) com `href` e `value`; devolve false quando o app cancelou. */
  private emitNavigate(): boolean {
    return this.dispatchEvent(
      new CustomEvent("ark-navigate", {
        detail: { href: this.href, value: this.value },
        bubbles: true,
        composed: true,
        cancelable: true
      })
    );
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled || this.divider) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (!this.anchorEl) {
      this.emitNavigate();
      return;
    }
    // Modificadores e target de nova aba são do navegador (nova aba, janela, download): sem ark-navigate, como os
    // routers de SPA fazem, senão o app cancelaria uma abertura em nova aba.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = this.anchorEl.getAttribute("target");
    if (target && target !== "_self") return;
    if (!this.emitNavigate()) event.preventDefault();
  };

  // Só no item sem link, em que o host é o botão; o <a> já responde a Enter sozinho.
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.target !== this || this.anchorEl || this.disabled || this.divider) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.emitNavigate();
    }
  };

  // --- Aparência ---

  private getVariant(): ArkNavVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "navbar" || variant === "tabbar" ? variant : "sidebar";
  }

  /** Trilho: só o ícone (o ark-nav propaga `data-ark-rail` na sidebar e na navbar recolhidas). */
  private isRail(): boolean {
    return this.hasAttribute("data-ark-rail") && this.getVariant() !== "tabbar";
  }

  private ensureId(): string {
    if (!this.id) this.id = `ark-nav-item-${++navItemSeq}`;
    return this.id;
  }

  private getPalette(intent: ArkIntent): ArkNavItemPalette {
    const palettes: Record<ArkIntent, ArkNavItemPalette> = {
      primary: {
        ring: "ark:ring-primary-ring",
        soft: "ark:bg-primary-soft ark:text-primary-soft-fg",
        text: "ark:text-primary"
      },
      secondary: {
        ring: "ark:ring-secondary-ring",
        soft: "ark:bg-secondary-soft ark:text-secondary-soft-fg",
        text: "ark:text-secondary"
      },
      success: {
        ring: "ark:ring-success-ring",
        soft: "ark:bg-success-soft ark:text-success-soft-fg",
        text: "ark:text-success"
      },
      warning: {
        ring: "ark:ring-warning-ring",
        soft: "ark:bg-warning-soft ark:text-warning-soft-fg",
        text: "ark:text-warning"
      },
      danger: {
        ring: "ark:ring-danger-ring",
        soft: "ark:bg-danger-soft ark:text-danger-soft-fg",
        text: "ark:text-danger"
      },
      info: { ring: "ark:ring-info-ring", soft: "ark:bg-info-soft ark:text-info-soft-fg", text: "ark:text-info" },
      neutral: {
        ring: "ark:ring-neutral-ring",
        soft: "ark:bg-neutral-soft ark:text-neutral-soft-fg",
        text: "ark:text-fg"
      }
    };
    return palettes[intent];
  }

  private computeClasses(): { host: string[]; label: string } {
    const variant = this.getVariant();
    const horizontal = variant !== "sidebar";

    if (this.divider) {
      return {
        host: (horizontal
          ? "ark:mx-1 ark:h-5 ark:w-px ark:shrink-0 ark:self-center ark:bg-border"
          : "ark:my-1 ark:h-px ark:w-full ark:shrink-0 ark:bg-border"
        ).split(" "),
        label: ""
      };
    }

    const palette = this.getPalette(normalizeIntent(this.getAttribute("intent"), "primary"));
    const current = this.current;
    // O anel vale para o host focado (item botão) e para o <a> esticado focado dentro dele (item link).
    const focus = `ark:outline-none ark:ring-inset ark:focus-visible:ring-2 ark:has-focus-visible:ring-2 ${palette.ring}`;
    const disabled = this.disabled ? "ark:cursor-not-allowed ark:opacity-50 ark:pointer-events-none" : "";

    if (variant === "tabbar") {
      // Aba de rodapé: ícone sobre o rótulo, largura igual entre os itens, só a cor marca a atual.
      return {
        host: [
          "ark:relative ark:flex ark:min-w-0 ark:flex-1 ark:cursor-pointer ark:select-none ark:flex-col ark:items-center ark:justify-center ark:gap-0.5 ark:px-1 ark:py-1.5 ark:text-2xs ark:font-medium ark:transition-colors",
          focus,
          current ? palette.text : "ark:text-fg-muted ark:hover:text-fg",
          disabled
        ]
          .join(" ")
          .split(/\s+/)
          .filter(Boolean),
        label: "ark:max-w-full ark:truncate"
      };
    }

    // Altura pelo token --ark-size-* (min-height), como os demais controles do mesmo size.
    // No trilho o item vira um quadrado do tamanho do token (a navbar recolhida precisa da largura mínima).
    const sizes: Record<ArkSize, { host: string; rail: string }> = {
      xs: { host: "ark:min-h-(--ark-size-xs) ark:gap-2 ark:px-2 ark:text-xs", rail: "ark:min-w-(--ark-size-xs)" },
      sm: { host: "ark:min-h-(--ark-size-sm) ark:gap-2 ark:px-2.5 ark:text-xs", rail: "ark:min-w-(--ark-size-sm)" },
      md: { host: "ark:min-h-(--ark-size-md) ark:gap-3 ark:px-3 ark:text-sm", rail: "ark:min-w-(--ark-size-md)" },
      lg: { host: "ark:min-h-(--ark-size-lg) ark:gap-3 ark:px-3.5 ark:text-base", rail: "ark:min-w-(--ark-size-lg)" },
      xl: { host: "ark:min-h-(--ark-size-xl) ark:gap-3 ark:px-4 ark:text-lg", rail: "ark:min-w-(--ark-size-xl)" }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;
    const rail = this.isRail();

    return {
      host: [
        "ark:relative ark:flex ark:shrink-0 ark:cursor-pointer ark:select-none ark:items-center ark:rounded-md ark:font-medium ark:whitespace-nowrap ark:transition-colors",
        size.host,
        // No trilho o ícone fica centrado e o rótulo some (sr-only, para o nome do link continuar).
        rail ? `ark:justify-center ark:gap-0 ark:px-0 ${size.rail}` : "",
        focus,
        current ? palette.soft : "ark:text-fg-muted ark:hover:bg-surface-muted ark:hover:text-fg",
        disabled
      ]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean),
      label: rail ? "ark:sr-only" : "ark:min-w-0 ark:flex-1 ark:truncate"
    };
  }

  // Rótulo: nó próprio no início do host (o ícone do usuário vem antes por `order`), só enquanto `label` existir.
  private syncLabel(label: string | null, classes: string): void {
    if (label === null || this.divider) {
      this.labelEl?.remove();
      this.labelEl = null;
      return;
    }
    if (!this.labelEl) {
      const span = document.createElement("span");
      span.setAttribute("data-ark-chrome", "label");
      this.prepend(span);
      this.labelEl = span;
    }
    this.labelEl.textContent = label;
    this.labelEl.className = classes;
  }

  /** Modo link: cria/remove o <a> esticado conforme `href` entra/sai. */
  private syncAnchor(): void {
    const wantsAnchor = this.getAttribute("href") !== null && !this.divider;

    if (wantsAnchor && !this.anchorEl) {
      const anchor = document.createElement("a");
      // Marcado como chrome: as regras do trilho escondem os filhos do usuário fora do ícone, e o link tem de ficar.
      anchor.setAttribute("data-ark-chrome", "link");
      anchor.className = "ark:absolute ark:inset-0 ark:rounded-[inherit] ark:outline-none";
      this.appendChild(anchor);
      this.anchorEl = anchor;
    } else if (!wantsAnchor && this.anchorEl) {
      this.anchorEl.remove();
      this.anchorEl = null;
    }
    if (!this.anchorEl) return;

    const anchor = this.anchorEl;
    anchor.setAttribute("aria-labelledby", this.ensureId());

    const target = this.getAttribute("target");
    if (target) {
      anchor.target = target;
      if (target === "_blank") {
        anchor.rel = "noopener noreferrer";
      } else {
        anchor.removeAttribute("rel");
      }
    } else {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    }

    if (this.current) {
      anchor.setAttribute("aria-current", "page");
    } else {
      anchor.removeAttribute("aria-current");
    }

    // Âncora não tem "disabled": remove o href e sinaliza via aria.
    if (this.disabled) {
      anchor.removeAttribute("href");
      anchor.setAttribute("aria-disabled", "true");
      anchor.setAttribute("tabindex", "-1");
    } else {
      anchor.setAttribute("href", this.getAttribute("href") || "");
      anchor.removeAttribute("aria-disabled");
      anchor.removeAttribute("tabindex");
    }
  }

  // No trilho o rótulo está oculto: um title no host mostra o nome ao passar o ponteiro. Fica no host, e não no <a>,
  // porque o nome do link vem do conteúdo do host e o Chromium somaria o title do <a> a ele ("Requisições Requisições").
  private syncTitle(): void {
    const label = this.getAttribute("label");
    if (this.isRail() && label && !this.divider) {
      if (this.getAttribute("title") !== label) this.setAttribute("title", label);
      this.appliedTitle = label;
    } else if (this.appliedTitle !== null && this.getAttribute("title") === this.appliedTitle) {
      this.removeAttribute("title");
      this.appliedTitle = null;
    }
  }

  private syncHostSemantics(): void {
    if (this.divider) {
      this.setAttribute("role", "separator");
      this.setAttribute("aria-orientation", this.getVariant() === "sidebar" ? "horizontal" : "vertical");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-disabled");
      this.removeAttribute("aria-current");
      return;
    }
    this.removeAttribute("aria-orientation");

    if (this.anchorEl) {
      // O <a> é o controle acessível; o host vira só o "corpo" visual.
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
      this.removeAttribute("aria-disabled");
      this.removeAttribute("aria-current");
      return;
    }

    this.setAttribute("role", "button");
    this.setAttribute("tabindex", this.disabled ? "-1" : "0");
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
    if (this.current) {
      this.setAttribute("aria-current", "page");
    } else {
      this.removeAttribute("aria-current");
    }
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
    const classes = this.computeClasses();
    this.syncLabel(this.getAttribute("label"), classes.label);
    this.syncAnchor();
    this.syncTitle();
    this.syncHostSemantics();
    this.applyOwnClasses(classes.host);

    // Hook principal no host (testid sem sufixo): nav-item ou nav-divider.
    applyTestHooks(this, this.divider ? "nav-divider" : "nav-item", this);
    if (this.anchorEl) applyTestHooks(this, "nav-item", this.anchorEl, "link");
    if (this.labelEl) applyTestHooks(this, "nav-item", this.labelEl, "label");
    const icon = this.querySelector<HTMLElement>(':scope > [slot="icon"]');
    if (icon) applyTestHooks(this, "nav-item", icon, "icon");
    const trailing = this.querySelector<HTMLElement>(':scope > [slot="trailing"]');
    if (trailing) applyTestHooks(this, "nav-item", trailing, "trailing");
  }
}

export default ArkNavItem;
