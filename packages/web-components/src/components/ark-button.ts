import {
  type ArkButtonStatus,
  type ArkButtonType,
  type ArkIntent,
  type ArkRounded,
  type ArkSize,
  type ArkStyleVariant,
  announce,
  coerceBooleanAttr
} from "@tooark/core";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";

/**
 * Paleta de cores do botão Ark.
 * Define as cores para os diferentes estados e variantes do botão.
 */
type ArkButtonPalette = {
  focusRing: string;
  solid: string;
  outline: string;
  ghost: string;
};

/** SVG do spinner de carregamento: usa o preset `.ark-animate-spin` do core, isento de movimento reduzido. */
const SPINNER_SVG = `
  <svg class="ark:h-[1em] ark:w-[1em] ark-animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle class="ark:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="ark:opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>`;

/** Glifos de status: entram com o preset `.ark-animate-fade-in` do core no lugar do spinner. */
const STATUS_SVG: Record<Exclude<ArkButtonStatus, "idle">, string> = {
  success: `
  <svg class="ark:h-[1em] ark:w-[1em] ark-animate-fade-in" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 10.5l4 4 8-9"></path>
  </svg>`,
  error: `
  <svg class="ark:h-[1em] ark:w-[1em] ark-animate-fade-in" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <circle cx="10" cy="10" r="8"></circle>
    <path d="M10 6v4.5M10 13.5v.5"></path>
  </svg>`
};

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
  // `string`, e não o literal, para subclasses (ark-copy-button) redeclararem o próprio tag.
  static readonly tagName: string = "ark-button";
  static readonly formAssociated = true;

  private readonly internals: ElementInternals | null;
  private spinnerEl: HTMLSpanElement | null = null;
  /** Glifo de `status` (check ou alerta), nó próprio na frente do conteúdo; some sob `loading`. */
  private statusEl: HTMLSpanElement | null = null;
  private anchorEl: HTMLAnchorElement | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private formDisabled = false;

  /**
   * Observa os atributos do elemento para reagir a mudanças.
   * @returns Uma lista de atributos observados pelo componente.
   */
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
      "status",
      "status-label",
      "icon-only",
      "full-width",
      "href",
      "target",
      "testid"
    ];
  }

  /**
   * Inicializa uma nova instância do botão Ark.
   */
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

  /**
   * Chamado pelo navegador quando o elemento é adicionado ao DOM.
   */
  connectedCallback(): void {
    this.updateAppearance();
  }

  /**
   * Chamado pelo navegador quando um atributo observado do elemento é alterado.
   * @param name O nome do atributo que foi alterado.
   */
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    // Se o atributo alterado for "class", reaplica apenas as classes próprias do componente.
    if (name === "class") {
      // Um framework pode reescrever o atributo class inteiro (React/Vue
      // setam `class` do zero): reaplica só as classes do próprio componente.
      if (!this.syncingClass) {
        this.applyOwnClasses(this.ownClasses);
      }

      return;
    }

    // Se o elemento ainda não estiver conectado ao DOM, não atualiza a aparência.
    if (!this.isConnected) {
      return;
    }

    // Status que vira success/error é anunciado ao leitor de tela pela live region única do core.
    if (name === "status" && newValue !== oldValue) {
      this.announceStatus(newValue);
    }

    // Atualiza a aparência do botão quando qualquer outro atributo observado muda.
    this.updateAppearance();
  }

  /** Feedback do resultado: "success" ou "error" trocam o glifo; "idle" (ou ausente) não mostra nada. */
  get status(): ArkButtonStatus {
    const status = (this.getAttribute("status") || "").toLowerCase();
    return status === "success" || status === "error" ? status : "idle";
  }

  set status(value: ArkButtonStatus | null | undefined) {
    if (value === "success" || value === "error") {
      this.setAttribute("status", value);
    } else {
      this.removeAttribute("status");
    }
  }

  /** Texto anunciado ao leitor de tela quando o status vira success ou error. */
  get statusLabel(): string {
    return this.getAttribute("status-label") || "";
  }

  set statusLabel(value: string | null | undefined) {
    if (value) {
      this.setAttribute("status-label", value);
    } else {
      this.removeAttribute("status-label");
    }
  }

  // No microtask: um framework que troca `status` e `status-label` na mesma passada seta os dois antes.
  private announceStatus(next: string | null): void {
    const status = (next || "").toLowerCase();
    if (status !== "success" && status !== "error") return;
    queueMicrotask(() => {
      if (!this.isConnected || this.status !== status) return;
      const label = this.statusLabel;
      if (label) announce(label, status === "error" ? "assertive" : "polite");
    });
  }

  /**
   * Chamado pelo navegador quando um <fieldset disabled> ancestral muda.
   * @param disabled Indica se o <fieldset> ancestral está desabilitado.
   */
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
    this.updateAppearance();
  }

  /**
   * Indica se o botão está desabilitado.
   */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  /**
   * Define se o botão está desabilitado.
   */
  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /**
   * Indica se o botão está em estado de carregamento.
   */
  get loading(): boolean {
    return this.hasAttribute("loading");
  }

  /**
   * Define se o botão está em estado de carregamento.
   */
  set loading(value: boolean | string | null | undefined) {
    this.toggleAttribute("loading", coerceBooleanAttr(value));
  }

  /**
   * Indica o tipo do botão.
   */
  get type(): ArkButtonType {
    const type = this.getAttribute("type");
    return type === "submit" || type === "reset" ? type : "button";
  }

  set type(value: ArkButtonType | null | undefined) {
    reflectAttr(this, "type", value);
  }

  /**
   * Formulário ao qual o botão pertence (via ElementInternals).
   */
  get form(): HTMLFormElement | null {
    return this.internals?.form ?? this.closest("form");
  }

  // --- Interação ---

  /**
   * Manipula o clique no botão, tratando submissão e reset de formulários.
   * @param event Evento de clique no botão.
   */
  private readonly handleClick = (event: MouseEvent): void => {
    // Se o botão é um link ou do tipo "button", não faz nada.
    if (this.anchorEl || this.type === "button") {
      return;
    }

    // Obtém o formulário ao qual o botão pertence.
    const form = this.form;

    // Se não houver formulário, não faz nada.
    if (!form) {
      return;
    }

    // Submissão como ação padrão: só depois de todos os listeners (inclusive
    // os delegados na raiz, como os do React) terem tido a chance de
    // preventDefault(), igual a um <button type="submit"> nativo.
    window.setTimeout(() => {
      // Se o evento foi prevenido, não faz nada.
      if (event.defaultPrevented) {
        return;
      }

      // Executa a ação do botão com base no seu tipo.
      if (this.type === "reset") {
        form.reset();
      } else {
        form.requestSubmit();
      }
    }, 0);
  };

  /**
   * Manipula o pressionamento de tecla no botão, tratando Enter e Espaço.
   * @param event Evento de teclado no botão.
   */
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // Se o botão é um link, não é o alvo do evento ou está desabilitado, não faz nada.
    if (this.anchorEl || event.target !== this || this.isDisabled()) {
      return;
    }

    // Trata a tecla Enter: dispara o clique imediatamente.
    if (event.key === "Enter") {
      event.preventDefault();
      this.click();
    } else if (event.key === " ") {
      // Evita o scroll da página; o click acontece no keyup, como no nativo.
      event.preventDefault();
    }
  };

  /**
   * Manipula o keyup no botão, tratando a tecla Espaço.
   * @param event Evento de teclado no botão.
   * @returns void
   */
  private readonly handleKeyup = (event: KeyboardEvent): void => {
    // Se o botão é um link, não é o alvo do evento ou está desabilitado, não faz nada.
    if (this.anchorEl || event.target !== this || this.isDisabled()) {
      return;
    }

    // Trata a tecla Espaço: dispara o clique no keyup, como no nativo.
    if (event.key === " ") {
      event.preventDefault();
      this.click();
    }
  };

  // --- Estilo ---

  /**
   * Normaliza o valor do intent, garantindo que seja um dos valores válidos.
   * @param value Valor do intent.
   * @returns Intent normalizado.
   */
  private normalizeIntent(value: string | null): ArkIntent {
    const intent = (value || "").toLowerCase();

    // Verifica se o intent é válido. Se for, retorna o intent normalizado. Caso contrário, retorna "primary".
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

  /**
   * Resolve a variante e o intent do botão com base nos atributos.
   * @returns Objeto contendo a variante de estilo e o intent.
   */
  private resolveVariantAndIntent(): { styleVariant: ArkStyleVariant; intent: ArkIntent } {
    const variant = (this.getAttribute("variant") || "primary").toLowerCase();
    const attrIntent = this.getAttribute("intent");

    // Normaliza o intent antes de resolver a variante e o intent.
    if (variant === "outline" || variant === "ghost" || variant === "solid") {
      return {
        styleVariant: variant,
        intent: this.normalizeIntent(attrIntent)
      };
    }

    // Se a variante não é "outline", "ghost" ou "solid", verifica se é uma variante de estilo baseada no intent.
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

    // Se nenhuma das condições anteriores for atendida, retorna a variante sólida com o intent normalizado.
    return {
      styleVariant: "solid",
      intent: this.normalizeIntent(attrIntent)
    };
  }

  /**
   * Obtém a paleta de estilos do botão com base no intent.
   * @param intent Intent do botão.
   * @returns Paleta de estilos correspondente ao intent.
   */
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

  /** Desabilitado por atributo, por `loading` ou pelo formulário; subclasses consultam antes de agir. */
  protected isDisabled(): boolean {
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

    // A altura vem do token --ark-size-* (min-height); o padding vertical fica
    // abaixo dele para o token governar e controles do mesmo size alinharem.
    const sizes: Record<ArkSize, string> = {
      xs: "ark:min-h-(--ark-size-xs) ark:px-2 ark:py-0.5 ark:text-xs",
      sm: "ark:min-h-(--ark-size-sm) ark:px-3 ark:py-1 ark:text-xs",
      md: "ark:min-h-(--ark-size-md) ark:px-4 ark:py-1.5 ark:text-sm",
      lg: "ark:min-h-(--ark-size-lg) ark:px-5 ark:py-2 ark:text-base",
      xl: "ark:min-h-(--ark-size-xl) ark:px-6 ark:py-2.5 ark:text-lg"
    };

    // Botão só de ícone: quadrado (min-width = min-height = token); vira círculo com rounded="full".
    const iconOnlySizes: Record<ArkSize, string> = {
      xs: "ark:min-h-(--ark-size-xs) ark:min-w-(--ark-size-xs) ark:p-0.5 ark:text-xs",
      sm: "ark:min-h-(--ark-size-sm) ark:min-w-(--ark-size-sm) ark:p-1 ark:text-xs",
      md: "ark:min-h-(--ark-size-md) ark:min-w-(--ark-size-md) ark:p-1.5 ark:text-sm",
      lg: "ark:min-h-(--ark-size-lg) ark:min-w-(--ark-size-lg) ark:p-2 ark:text-base",
      xl: "ark:min-h-(--ark-size-xl) ark:min-w-(--ark-size-xl) ark:p-2.5 ark:text-lg"
    };

    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      xs: "ark:rounded-xs",
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

  /** Troca as classes do componente no host sem tocar nas classes do usuário. */
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

  // Glifo do status na frente do conteúdo, como o spinner; `loading` vence e o esconde. Trocar de success para
  // error recria o nó, para o fade-in rodar de novo.
  private syncStatus(): void {
    const status = this.status;
    const active = status !== "idle" && !this.hasAttribute("loading");

    if (!active) {
      this.statusEl?.remove();
      this.statusEl = null;
      return;
    }

    if (this.statusEl && this.statusEl.getAttribute("data-ark-status") === status) return;
    this.statusEl?.remove();

    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("data-ark-status", status);
    icon.className = "ark:inline-flex ark:items-center";
    icon.innerHTML = STATUS_SVG[status];
    this.prepend(icon);
    this.statusEl = icon;
  }

  private ensureId(): string {
    if (!this.id) this.id = `ark-button-${++arkButtonIdCounter}`;
    return this.id;
  }

  /** Modo link: cria/remove o <a> esticado conforme `href` entra/sai. */
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

  /** Ponto único de atualização; subclasses o estendem (chamando super) para o próprio chrome. */
  protected updateAppearance(): void {
    this.syncAnchor();
    this.syncHostSemantics();
    this.applyOwnClasses(this.computeClasses());
    this.applyCustomColors();
    this.syncLoading();
    this.syncStatus();

    applyTestHooks(this, "button", this);
    if (this.spinnerEl) {
      applyTestHooks(this, "button", this.spinnerEl, "spinner");
    }
    if (this.statusEl) {
      applyTestHooks(this, "button", this.statusEl, "status-icon");
    }
    if (this.anchorEl) {
      applyTestHooks(this, "button", this.anchorEl, "link");
    }
  }
}

export default ArkButton;
