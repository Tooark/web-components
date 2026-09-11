import type { ArkButtonType, ArkIntent, ArkRounded, ArkSize, ArkStyleVariant } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkButtonPalette = {
  focusRing: string;
  solid: string;
  outline: string;
  ghost: string;
};

const SPINNER_SVG =
  '<svg class="ark:h-[1em] ark:w-[1em] ark:animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle class="ark:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="ark:opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>';

let arkButtonIdCounter = 0;

/**
 * Botão da família Ark.
 *
 * O PRÓPRIO host é o controle: recebe as classes, `role="button"`, foco,
 * teclado (Enter/Espaço) e participa de formulários via ElementInternals
 * (`type="submit"`/`"reset"`). Nenhum filho do usuário é movido ou envolvido,
 * então frameworks que gerenciam os filhos (React, Vue, Angular) continuam
 * donos deles. Com `href`, um `<a>` "esticado" cobre o host, recebe o foco e
 * é nomeado pelo conteúdo do host (`aria-labelledby`).
 */
export class ArkButton extends HTMLElement {
  static readonly tagName = "ark-button";
  static readonly formAssociated = true;

  private readonly internals: ElementInternals | null;
  private spinnerEl: HTMLSpanElement | null = null;
  private anchorEl: HTMLAnchorElement | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private formDisabled = false;

  static get observedAttributes(): string[] {
    return [
      "disabled",
      "type",
      "variant",
      "size",
      "intent",
      "theme",
      "color",
      "text-color",
      "class",
      "rounded",
      "loading",
      "icon-only",
      "full-width",
      "href",
      "target",
      "testid"
    ];
  }

  constructor() {
    super();
    this.internals = typeof this.attachInternals === "function" ? this.attachInternals() : null;

    // Desabilitado/carregando: bloqueia o click na captura para listeners
    // externos no host não vazarem (o host não tem "disabled" nativo).
    this.addEventListener(
      "click",
      (event) => {
        if (this.isDisabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true }
    );
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("keyup", this.handleKeyup);
  }

  connectedCallback(): void {
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      // Um framework pode reescrever o atributo class inteiro (React/Vue
      // setam `class` do zero): reaplica só as classes do próprio componente.
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  /** Chamado pelo navegador quando um <fieldset disabled> ancestral muda. */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.updateAppearance();
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", Boolean(value));
  }

  get loading(): boolean {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean) {
    this.toggleAttribute("loading", Boolean(value));
  }

  get type(): ArkButtonType {
    const type = this.getAttribute("type");
    return type === "submit" || type === "reset" ? type : "button";
  }

  /** Formulário ao qual o botão pertence (via ElementInternals). */
  get form(): HTMLFormElement | null {
    return this.internals?.form ?? this.closest("form");
  }

  // --- Interação ---

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.anchorEl || this.type === "button") return;
    const form = this.form;
    if (!form) return;
    // Submissão como ação padrão: só depois de todos os listeners (inclusive
    // os delegados na raiz, como os do React) terem tido a chance de
    // preventDefault(), igual a um <button type="submit"> nativo.
    window.setTimeout(() => {
      if (event.defaultPrevented) return;
      if (this.type === "reset") {
        form.reset();
      } else {
        form.requestSubmit();
      }
    }, 0);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.anchorEl || event.target !== this || this.isDisabled()) return;
    if (event.key === "Enter") {
      event.preventDefault();
      this.click();
    } else if (event.key === " ") {
      // Evita o scroll da página; o click acontece no keyup, como no nativo.
      event.preventDefault();
    }
  };

  private readonly handleKeyup = (event: KeyboardEvent): void => {
    if (this.anchorEl || event.target !== this || this.isDisabled()) return;
    if (event.key === " ") {
      event.preventDefault();
      this.click();
    }
  };

  // --- Estilo ---

  private normalizeIntent(value: string | null): ArkIntent {
    const intent = (value || "").toLowerCase();
    if (
      intent === "primary" ||
      intent === "secondary" ||
      intent === "success" ||
      intent === "warning" ||
      intent === "danger" ||
      intent === "info" ||
      intent === "neutral"
    ) {
      return intent;
    }
    return "primary";
  }

  private resolveVariantAndIntent(): { styleVariant: ArkStyleVariant; intent: ArkIntent } {
    const variant = (this.getAttribute("variant") || "primary").toLowerCase();
    const attrIntent = this.getAttribute("intent");

    if (variant === "outline" || variant === "ghost" || variant === "solid") {
      return {
        styleVariant: variant,
        intent: this.normalizeIntent(attrIntent)
      };
    }

    if (
      variant === "primary" ||
      variant === "secondary" ||
      variant === "success" ||
      variant === "warning" ||
      variant === "danger" ||
      variant === "info"
    ) {
      return {
        styleVariant: "solid",
        intent: this.normalizeIntent(attrIntent || variant)
      };
    }

    return {
      styleVariant: "solid",
      intent: this.normalizeIntent(attrIntent)
    };
  }

  private getPalette(intent: ArkIntent): ArkButtonPalette {
    // Tokens semânticos (light-dark nos tokens): uma paleta única serve claro e escuro.
    const palettes: Record<ArkIntent, ArkButtonPalette> = {
      primary: {
        focusRing: "ark:ring-primary-ring",
        solid: "ark:bg-primary ark:text-primary-fg ark:border-transparent ark:hover:bg-primary-hover",
        outline: "ark:bg-transparent ark:text-primary-soft-fg ark:border-primary-border ark:hover:bg-primary-soft",
        ghost: "ark:bg-transparent ark:text-primary-soft-fg ark:border-transparent ark:hover:bg-primary-soft"
      },
      secondary: {
        focusRing: "ark:ring-secondary-ring",
        // "Solid" secundário é a superfície com borda (botão neutro de apoio).
        solid: "ark:bg-surface ark:text-fg ark:border-border-strong ark:hover:bg-surface-muted",
        outline:
          "ark:bg-transparent ark:text-secondary-soft-fg ark:border-secondary-border ark:hover:bg-secondary-soft",
        ghost: "ark:bg-transparent ark:text-secondary-soft-fg ark:border-transparent ark:hover:bg-secondary-soft"
      },
      success: {
        focusRing: "ark:ring-success-ring",
        solid: "ark:bg-success ark:text-success-fg ark:border-transparent ark:hover:bg-success-hover",
        outline: "ark:bg-transparent ark:text-success-soft-fg ark:border-success-border ark:hover:bg-success-soft",
        ghost: "ark:bg-transparent ark:text-success-soft-fg ark:border-transparent ark:hover:bg-success-soft"
      },
      warning: {
        focusRing: "ark:ring-warning-ring",
        solid: "ark:bg-warning ark:text-warning-fg ark:border-transparent ark:hover:bg-warning-hover",
        outline: "ark:bg-transparent ark:text-warning-soft-fg ark:border-warning-border ark:hover:bg-warning-soft",
        ghost: "ark:bg-transparent ark:text-warning-soft-fg ark:border-transparent ark:hover:bg-warning-soft"
      },
      danger: {
        focusRing: "ark:ring-danger-ring",
        solid: "ark:bg-danger ark:text-danger-fg ark:border-transparent ark:hover:bg-danger-hover",
        outline: "ark:bg-transparent ark:text-danger-soft-fg ark:border-danger-border ark:hover:bg-danger-soft",
        ghost: "ark:bg-transparent ark:text-danger-soft-fg ark:border-transparent ark:hover:bg-danger-soft"
      },
      info: {
        focusRing: "ark:ring-info-ring",
        solid: "ark:bg-info ark:text-info-fg ark:border-transparent ark:hover:bg-info-hover",
        outline: "ark:bg-transparent ark:text-info-soft-fg ark:border-info-border ark:hover:bg-info-soft",
        ghost: "ark:bg-transparent ark:text-info-soft-fg ark:border-transparent ark:hover:bg-info-soft"
      },
      neutral: {
        focusRing: "ark:ring-neutral-ring",
        solid: "ark:bg-neutral ark:text-neutral-fg ark:border-transparent ark:hover:bg-neutral-hover",
        outline: "ark:bg-transparent ark:text-neutral-soft-fg ark:border-neutral-border ark:hover:bg-neutral-soft",
        ghost: "ark:bg-transparent ark:text-neutral-soft-fg ark:border-transparent ark:hover:bg-neutral-soft"
      }
    };

    return palettes[intent];
  }

  private isDisabled(): boolean {
    return this.formDisabled || this.hasAttribute("disabled") || this.hasAttribute("loading");
  }

  private computeClasses(): string[] {
    const isLink = this.anchorEl !== null;
    const base = [
      this.hasAttribute("full-width") ? "ark:flex ark:w-full" : "ark:inline-flex",
      "ark:relative ark:items-center ark:justify-center ark:gap-2 ark:border ark:font-semibold ark:transition ark:select-none ark:cursor-pointer ark:outline-none ark:ring-offset-0",
      // Botão: anel no próprio host quando focado via teclado. Link: o foco
      // está no <a> esticado, então o anel vem de focus-within.
      isLink ? "ark:focus-within:ring-2" : "ark:focus-visible:ring-2",
      "ark:aria-disabled:cursor-not-allowed ark:aria-disabled:opacity-50 ark:aria-disabled:pointer-events-none"
    ].join(" ");
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const { styleVariant, intent } = this.resolveVariantAndIntent();
    const palette = this.getPalette(intent);

    const variantClasses: Record<ArkStyleVariant, string> = {
      solid: palette.solid,
      outline: palette.outline,
      ghost: palette.ghost
    };

    const sizes: Record<ArkSize, string> = {
      sm: "ark:px-3 ark:py-1.5 ark:text-xs",
      md: "ark:px-4 ark:py-2 ark:text-sm",
      lg: "ark:px-5 ark:py-3 ark:text-base",
      xl: "ark:px-6 ark:py-4 ark:text-lg"
    };

    // Padding simétrico para botão só de ícone (quadrado; vira círculo com rounded="full").
    const iconOnlySizes: Record<ArkSize, string> = {
      sm: "ark:p-1.5 ark:text-xs",
      md: "ark:p-2 ark:text-sm",
      lg: "ark:p-3 ark:text-base",
      xl: "ark:p-4 ark:text-lg"
    };

    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      sm: "ark:rounded-sm",
      md: "ark:rounded-md",
      lg: "ark:rounded-lg",
      xl: "ark:rounded-xl",
      full: "ark:rounded-full"
    };
    const rounded = (this.getAttribute("rounded") || "md").toLowerCase() as ArkRounded;

    const iconOnly = this.hasAttribute("icon-only");
    const sizeClasses = iconOnly ? (iconOnlySizes[size] ?? iconOnlySizes.md) : (sizes[size] ?? sizes.md);

    return [base, roundedMap[rounded] ?? roundedMap.md, palette.focusRing, variantClasses[styleVariant], sizeClasses]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean);
  }

  // Troca as classes do componente no host sem tocar nas classes do usuário.
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

  private applyCustomColors(): void {
    this.style.backgroundColor = "";
    this.style.borderColor = "";
    this.style.color = "";

    const color = this.getAttribute("color")?.trim();
    if (!color) return;

    const textColor = this.getAttribute("text-color")?.trim();
    const { styleVariant } = this.resolveVariantAndIntent();

    if (styleVariant === "solid") {
      this.style.backgroundColor = color;
      this.style.borderColor = color;
      this.style.color = textColor || "#ffffff";
      return;
    }

    this.style.borderColor = color;
    this.style.color = textColor || color;
  }

  private syncLoading(): void {
    const loading = this.hasAttribute("loading");

    if (loading && !this.spinnerEl) {
      const spinner = document.createElement("span");
      spinner.setAttribute("aria-hidden", "true");
      spinner.className = "ark:inline-flex ark:items-center";
      spinner.innerHTML = SPINNER_SVG;
      // Vai na frente do conteúdo do usuário, sem tocar nele.
      this.prepend(spinner);
      this.spinnerEl = spinner;
      return;
    }

    if (!loading && this.spinnerEl) {
      this.spinnerEl.remove();
      this.spinnerEl = null;
    }
  }

  private ensureId(): string {
    if (!this.id) this.id = `ark-button-${++arkButtonIdCounter}`;
    return this.id;
  }

  // Modo link: cria/remove o <a> esticado conforme `href` entra/sai.
  private syncAnchor(): void {
    const wantsAnchor = this.getAttribute("href") !== null;

    if (wantsAnchor && !this.anchorEl) {
      const anchor = document.createElement("a");
      anchor.className = "ark:absolute ark:inset-0 ark:rounded-[inherit] ark:outline-none";
      this.appendChild(anchor);
      this.anchorEl = anchor;
    } else if (!wantsAnchor && this.anchorEl) {
      this.anchorEl.remove();
      this.anchorEl = null;
    }

    if (!this.anchorEl) return;

    const anchor = this.anchorEl;
    const disabled = this.isDisabled();
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

    // Âncora não tem "disabled": remove o href e sinaliza via aria.
    if (disabled) {
      anchor.removeAttribute("href");
      anchor.setAttribute("aria-disabled", "true");
      anchor.setAttribute("tabindex", "-1");
    } else {
      anchor.setAttribute("href", this.getAttribute("href") || "");
      anchor.removeAttribute("aria-disabled");
      anchor.removeAttribute("tabindex");
    }
  }

  private syncHostSemantics(): void {
    const disabled = this.isDisabled();

    if (this.anchorEl) {
      // O <a> é o controle acessível; o host vira só o "corpo" visual.
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
    } else {
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", disabled ? "-1" : "0");
    }

    if (disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }

    if (this.hasAttribute("loading")) {
      this.setAttribute("aria-busy", "true");
    } else {
      this.removeAttribute("aria-busy");
    }
  }

  private updateAppearance(): void {
    this.syncAnchor();
    this.syncHostSemantics();
    this.applyOwnClasses(this.computeClasses());
    this.applyCustomColors();
    this.syncLoading();

    applyTestHooks(this, "button", this);
    if (this.spinnerEl) {
      applyTestHooks(this, "button", this.spinnerEl, "spinner");
    }
    if (this.anchorEl) {
      applyTestHooks(this, "button", this.anchorEl, "link");
    }
  }
}

export default ArkButton;
