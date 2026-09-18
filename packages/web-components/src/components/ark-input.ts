import { type ArkIntent, type ArkLocale, type ArkRounded, type ArkSize, resolveLocale } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

const INPUT_TYPES = ["text", "password", "email", "number", "tel", "url", "search", "date", "time", "datetime-local"];

/** Atributos do host espelhados no <input> nativo sem interpretação. */
const PASS_THROUGH_ATTRS = [
  "autocomplete",
  "autofocus",
  "inputmode",
  "maxlength",
  "minlength",
  "pattern",
  "min",
  "max",
  "step",
  "spellcheck",
  "aria-label"
];

/** Ícones do botão de revelar senha (chrome próprio do componente). */
const EYE_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`;
const EYE_OFF_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 3l18 18"></path>
    <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2"></path>
    <path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2"></path>
    <path d="M6.6 6.6C3.8 8.5 2 12 2 12s3.5 7 10 7c1.5 0 2.9-.3 4.2-.9"></path>
  </svg>`;

let arkInputIdCounter = 0;

/**
 * Campo de texto padronizado da família Ark. Serve tanto de componente público
 * quanto de base visual para orquestradores (ark-datepicker etc.), que colocam
 * seus botões na área de sufixo (`slot="suffix"`) e acessam o campo nativo via
 * `inputElement`/`focus()`.
 *
 * Layout em grid no PRÓPRIO host (ver components.css): label, campo e mensagem
 * são criados pelo componente; os filhos `slot="prefix"` e `slot="suffix"` do
 * usuário ficam onde estão e são posicionados por CSS sobre as pontas do
 * campo — nada é movido. Com `reveal` num campo de senha, o componente cria
 * um botão de mostrar/ocultar na ponta direita. Atributos nativos como
 * `maxlength` ou `inputmode` são espelhados no <input> sem interpretação.
 */
export class ArkInput extends HTMLElement {
  static readonly tagName = "ark-input";

  private inputEl: HTMLInputElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  private revealEl: HTMLButtonElement | null = null;
  private observer: MutationObserver | null = null;
  /** Senha visível no momento (só com `reveal`). */
  private revealed = false;

  static get observedAttributes(): string[] {
    return [
      "type",
      "label",
      "placeholder",
      "value",
      "name",
      "size",
      "intent",
      "theme",
      "rounded",
      "helper",
      "error",
      "error-message",
      "disabled",
      "required",
      "readonly",
      "reveal",
      "lang",
      "locale-json",
      "testid",
      ...PASS_THROUGH_ATTRS
    ];
  }

  connectedCallback(): void {
    if (!this.inputEl) {
      this.render();
    }
    if (!this.observer) {
      // Prefixo/sufixo adicionado ou removido depois da montagem: recalcula o padding.
      this.observer = new MutationObserver(() => this.updateAppearance());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
    // O autofocus nativo só vale no parse inicial da página; elementos criados depois precisam do focus().
    if (this.hasAttribute("autofocus")) this.inputEl?.focus();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.inputEl) return;

    if (name === "value") {
      this.inputEl.value = newValue ?? "";
      return;
    }

    this.updateAppearance();
  }

  /** O <input> nativo interno, para composição por outros componentes. */
  get inputElement(): HTMLInputElement | null {
    return this.inputEl;
  }

  get value(): string {
    return this.inputEl?.value ?? this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    if (this.inputEl) {
      this.inputEl.value = next;
    } else {
      this.setAttribute("value", next);
    }
  }

  focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "").toLowerCase();
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

  private getSlotEl(name: "prefix" | "suffix"): HTMLElement | null {
    return this.querySelector<HTMLElement>(`:scope > [slot="${name}"]`);
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private render(): void {
    const id = this.getAttribute("id") ? `${this.getAttribute("id")}-input` : `ark-input-${++arkInputIdCounter}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const input = document.createElement("input");
    input.id = id;
    input.value = this.getAttribute("value") ?? "";

    const message = document.createElement("p");

    // Ordem visual (label, campo, mensagem) vem das grid-areas em components.css;
    // por isso podem ir no fim, depois dos filhos do usuário, sem movê-los.
    this.appendChild(label);
    this.appendChild(input);
    this.appendChild(message);

    this.inputEl = input;
    this.labelEl = label;
    this.messageEl = message;
  }

  // Botão de mostrar/ocultar senha: criado só quando `reveal` vale, removido quando deixa de valer.
  private syncReveal(active: boolean, boxClasses: string): void {
    if (!active) {
      this.revealEl?.remove();
      this.revealEl = null;
      this.revealed = false;
      return;
    }

    if (!this.revealEl) {
      const button = document.createElement("button");
      button.type = "button";
      button.addEventListener("click", () => {
        this.revealed = !this.revealed;
        this.updateAppearance();
        this.inputEl?.focus();
      });
      this.appendChild(button);
      this.revealEl = button;
    }

    const loc = this.getLocale();
    const label = this.revealed ? loc.hidePassword : loc.showPassword;
    this.revealEl.className = [
      "ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-md ark:p-0.5 ark:text-fg-muted ark:transition ark:hover:text-fg ark:focus:outline-none ark:focus-visible:ring-2 ark:focus-visible:ring-ring ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      boxClasses
    ].join(" ");
    this.revealEl.disabled = this.hasAttribute("disabled");
    this.revealEl.setAttribute("aria-pressed", this.revealed ? "true" : "false");
    this.revealEl.setAttribute("aria-label", label);
    this.revealEl.title = label;
    this.revealEl.innerHTML = this.revealed ? EYE_OFF_SVG : EYE_SVG;
  }

  private updateAppearance(): void {
    if (!this.inputEl || !this.labelEl || !this.messageEl) return;

    const intent = this.getIntent();
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const prefixEl = this.getSlotEl("prefix");
    const suffixEl = this.getSlotEl("suffix");

    const rawType = (this.getAttribute("type") || "text").toLowerCase();
    const type = INPUT_TYPES.includes(rawType) ? rawType : "text";
    const reveal = this.hasAttribute("reveal") && type === "password";
    if (!reveal) this.revealed = false;
    this.inputEl.type = reveal && this.revealed ? "text" : type;
    this.inputEl.placeholder = this.getAttribute("placeholder") || "";
    this.inputEl.name = this.getAttribute("name") || "";
    this.inputEl.disabled = this.hasAttribute("disabled");
    this.inputEl.required = this.hasAttribute("required");
    this.inputEl.readOnly = this.hasAttribute("readonly");

    for (const name of PASS_THROUGH_ATTRS) {
      const value = this.getAttribute(name);
      if (value === null) {
        this.inputEl.removeAttribute(name);
      } else {
        this.inputEl.setAttribute(name, value);
      }
    }

    // Altura do campo pelo token --ark-size-* (min-height), igual ao ark-button. Os paddings extras
    // reservam espaço para prefixo, sufixo e botão de revelar; `revealOffset` afasta um sufixo do botão.
    const sizes: Record<
      ArkSize,
      {
        input: string;
        label: string;
        prefixPad: string;
        suffixPad: string;
        bothPad: string;
        reveal: string;
        revealOffset: string;
      }
    > = {
      xs: {
        input: "ark:min-h-(--ark-size-xs) ark:px-2 ark:py-0.5 ark:text-xs",
        label: "ark:text-[10px]",
        prefixPad: "ark:pl-7",
        suffixPad: "ark:pr-7",
        bothPad: "ark:pr-12",
        reveal: "ark:h-5 ark:w-5",
        revealOffset: "2rem"
      },
      sm: {
        input: "ark:min-h-(--ark-size-sm) ark:px-2.5 ark:py-1 ark:text-xs",
        label: "ark:text-[11px]",
        prefixPad: "ark:pl-8",
        suffixPad: "ark:pr-8",
        bothPad: "ark:pr-14",
        reveal: "ark:h-5 ark:w-5",
        revealOffset: "2rem"
      },
      md: {
        input: "ark:min-h-(--ark-size-md) ark:px-3 ark:py-1.5 ark:text-sm",
        label: "ark:text-xs",
        prefixPad: "ark:pl-9",
        suffixPad: "ark:pr-9",
        bothPad: "ark:pr-16",
        reveal: "ark:h-6 ark:w-6",
        revealOffset: "2.25rem"
      },
      lg: {
        input: "ark:min-h-(--ark-size-lg) ark:px-4 ark:py-2 ark:text-base",
        label: "ark:text-sm",
        prefixPad: "ark:pl-10",
        suffixPad: "ark:pr-10",
        bothPad: "ark:pr-20",
        reveal: "ark:h-6 ark:w-6",
        revealOffset: "2.25rem"
      },
      xl: {
        input: "ark:min-h-(--ark-size-xl) ark:px-5 ark:py-2.5 ark:text-lg",
        label: "ark:text-base",
        prefixPad: "ark:pl-12",
        suffixPad: "ark:pr-12",
        bothPad: "ark:pr-24",
        reveal: "ark:h-7 ark:w-7",
        revealOffset: "2.5rem"
      }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    this.syncReveal(reveal, size.reveal);
    if (reveal) {
      this.style.setProperty("--ark-input-reveal-offset", size.revealOffset);
    } else {
      this.style.removeProperty("--ark-input-reveal-offset");
    }

    const roundedMap: Record<ArkRounded, string> = {
      none: "ark:rounded-none",
      xs: "ark:rounded-xs",
      sm: "ark:rounded-sm",
      md: "ark:rounded-md",
      lg: "ark:rounded-lg",
      xl: "ark:rounded-xl",
      full: "ark:rounded-full"
    };
    const rounded = roundedMap[(this.getAttribute("rounded") || "lg").toLowerCase() as ArkRounded] ?? roundedMap.lg;

    const focusRings: Record<ArkIntent, string> = {
      primary: "ark:focus:ring-primary-ring",
      secondary: "ark:focus:ring-secondary-ring",
      success: "ark:focus:ring-success-ring",
      warning: "ark:focus:ring-warning-ring",
      danger: "ark:focus:ring-danger-ring",
      info: "ark:focus:ring-info-ring",
      neutral: "ark:focus:ring-neutral-ring"
    };
    const focusRing = error ? focusRings.danger : focusRings[intent];

    const surface = "ark:border-border-strong ark:bg-surface ark:text-fg ark:placeholder:text-fg-placeholder";
    const border = error ? "ark:border-danger" : "";
    const rightPad = suffixEl && reveal ? size.bothPad : suffixEl || reveal ? size.suffixPad : "";

    this.inputEl.className = [
      "ark:w-full ark:min-w-0 ark:border ark:transition ark:focus:outline-none ark:focus:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      rounded,
      size.input,
      prefixEl ? size.prefixPad : "",
      rightPad,
      surface,
      border,
      focusRing
    ]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");

    // Label
    const labelText = this.getAttribute("label") || "";
    this.labelEl.textContent = labelText;
    this.labelEl.hidden = !labelText;
    this.labelEl.className = ["ark:mb-1 ark:block ark:font-medium", size.label, "ark:text-fg-soft"].join(" ");

    // Mensagem (erro tem precedência sobre helper)
    const errorMessage = this.getAttribute("error-message") || "";
    const helper = this.getAttribute("helper") || "";
    const message = errorMessage || helper;
    this.messageEl.textContent = message;
    this.messageEl.hidden = !message;
    this.messageEl.className = [
      "ark:mt-1 ark:text-xs",
      errorMessage ? "ark:text-danger-soft-fg" : "ark:text-fg-muted"
    ].join(" ");

    if (message) {
      this.messageEl.id = this.messageEl.id || `${this.inputEl.id}-message`;
      this.inputEl.setAttribute("aria-describedby", this.messageEl.id);
    } else {
      this.inputEl.removeAttribute("aria-describedby");
    }
    this.inputEl.setAttribute("aria-invalid", error ? "true" : "false");

    applyTestHooks(this, "input", this.inputEl);
    applyTestHooks(this, "input", this.labelEl, "label");
    applyTestHooks(this, "input", this.messageEl, errorMessage ? "error" : "helper");
    if (prefixEl) applyTestHooks(this, "input", prefixEl, "prefix");
    if (suffixEl) applyTestHooks(this, "input", suffixEl, "suffix");
    if (this.revealEl) applyTestHooks(this, "input", this.revealEl, "reveal");
  }
}

export default ArkInput;
