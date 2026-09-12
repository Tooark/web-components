import type { ArkIntent, ArkRounded, ArkSize } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

const INPUT_TYPES = ["text", "password", "email", "number", "tel", "url", "search"];

let arkInputIdCounter = 0;

/**
 * Campo de texto padronizado da família Ark. Serve tanto de componente público
 * quanto de base visual para orquestradores (ark-datepicker etc.), que colocam
 * seus botões na área de sufixo (`slot="suffix"`) e acessam o campo nativo via
 * `inputElement`/`focus()`.
 *
 * Layout em grid no PRÓPRIO host (ver components.css): label, campo e mensagem
 * são criados pelo componente; o filho `slot="suffix"` do usuário fica onde
 * está e é posicionado por CSS sobre a ponta direita do campo — nada é movido.
 */
export class ArkInput extends HTMLElement {
  static readonly tagName = "ark-input";

  private inputEl: HTMLInputElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  private observer: MutationObserver | null = null;

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
      "testid"
    ];
  }

  connectedCallback(): void {
    if (!this.inputEl) {
      this.render();
    }
    if (!this.observer) {
      // Sufixo adicionado/removido depois da montagem: recalcula o padding.
      this.observer = new MutationObserver(() => this.updateAppearance());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
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

  private getSuffixEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>(':scope > [slot="suffix"]');
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

  private updateAppearance(): void {
    if (!this.inputEl || !this.labelEl || !this.messageEl) return;

    const intent = this.getIntent();
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const suffixEl = this.getSuffixEl();
    const hasSuffix = suffixEl !== null;

    const type = (this.getAttribute("type") || "text").toLowerCase();
    this.inputEl.type = INPUT_TYPES.includes(type) ? type : "text";
    this.inputEl.placeholder = this.getAttribute("placeholder") || "";
    this.inputEl.name = this.getAttribute("name") || "";
    this.inputEl.disabled = this.hasAttribute("disabled");
    this.inputEl.required = this.hasAttribute("required");
    this.inputEl.readOnly = this.hasAttribute("readonly");

    // Altura do campo pelo token --ark-size-* (min-height), igual ao ark-button.
    const sizes: Record<ArkSize, { input: string; label: string; suffixPad: string }> = {
      xs: {
        input: "ark:min-h-(--ark-size-xs) ark:px-2 ark:py-0.5 ark:text-xs",
        label: "ark:text-[10px]",
        suffixPad: "ark:pr-7"
      },
      sm: {
        input: "ark:min-h-(--ark-size-sm) ark:px-2.5 ark:py-1 ark:text-xs",
        label: "ark:text-[11px]",
        suffixPad: "ark:pr-8"
      },
      md: {
        input: "ark:min-h-(--ark-size-md) ark:px-3 ark:py-1.5 ark:text-sm",
        label: "ark:text-xs",
        suffixPad: "ark:pr-9"
      },
      lg: {
        input: "ark:min-h-(--ark-size-lg) ark:px-4 ark:py-2 ark:text-base",
        label: "ark:text-sm",
        suffixPad: "ark:pr-10"
      },
      xl: {
        input: "ark:min-h-(--ark-size-xl) ark:px-5 ark:py-2.5 ark:text-lg",
        label: "ark:text-base",
        suffixPad: "ark:pr-12"
      }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

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

    this.inputEl.className = [
      "ark:w-full ark:min-w-0 ark:border ark:transition ark:focus:outline-none ark:focus:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      rounded,
      size.input,
      hasSuffix ? size.suffixPad : "",
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
    if (suffixEl) applyTestHooks(this, "input", suffixEl, "suffix");
  }
}

export default ArkInput;
