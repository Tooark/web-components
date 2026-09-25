import type { ArkIntent, ArkRounded, ArkSize } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

/** Atributos do host espelhados no <textarea> nativo sem interpretação. */
const PASS_THROUGH_ATTRS = ["autocomplete", "autofocus", "maxlength", "minlength", "spellcheck", "wrap", "aria-label"];

let arkTextareaIdCounter = 0;

/**
 * Área de texto padronizada: a mesma grid label / campo / mensagem do
 * ark-input (ver components.css) e os mesmos atributos de label, helper e
 * erro. `rows` dá a altura inicial, `autosize` cresce com o conteúdo
 * (`field-sizing: content` nativo, com fallback por JS), `monospace` e
 * `resize` atendem edição de código e de dados.
 */
export class ArkTextarea extends HTMLElementBase {
  static readonly tagName = "ark-textarea";

  private textareaEl: HTMLTextAreaElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  /** Autosize por JS quando o navegador não tem field-sizing: a altura é medida a cada input. */
  private autosizeByJs = false;

  static get observedAttributes(): string[] {
    return [
      "label",
      "placeholder",
      "value",
      "name",
      "rows",
      "autosize",
      "monospace",
      "resize",
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
      "testid",
      ...PASS_THROUGH_ATTRS
    ];
  }

  connectedCallback(): void {
    if (!this.textareaEl) {
      this.render();
    }
    this.updateAppearance();
    if (this.hasAttribute("autofocus")) this.textareaEl?.focus();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.textareaEl) return;

    if (name === "value") {
      this.textareaEl.value = newValue ?? "";
      this.fitHeight();
      return;
    }

    this.updateAppearance();
  }

  /** O <textarea> nativo interno, para composição por outros componentes. */
  get textareaElement(): HTMLTextAreaElement | null {
    return this.textareaEl;
  }

  get value(): string {
    return this.textareaEl?.value ?? this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    if (this.textareaEl) {
      this.textareaEl.value = next;
      this.fitHeight();
    } else {
      this.setAttribute("value", next);
    }
  }

  focus(options?: FocusOptions): void {
    this.textareaEl?.focus(options);
  }

  private render(): void {
    const id = this.getAttribute("id")
      ? `${this.getAttribute("id")}-textarea`
      : `ark-textarea-${++arkTextareaIdCounter}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.value = this.getAttribute("value") ?? "";
    textarea.addEventListener("input", () => this.fitHeight());

    const message = document.createElement("p");

    // Ordem visual (label, campo, mensagem) vem das grid-areas em components.css.
    this.appendChild(label);
    this.appendChild(textarea);
    this.appendChild(message);

    this.textareaEl = textarea;
    this.labelEl = label;
    this.messageEl = message;
  }

  private supportsFieldSizing(): boolean {
    return typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("field-sizing", "content");
  }

  // Fallback do autosize: mede o conteúdo e fixa a altura. Com field-sizing nativo não faz nada.
  private fitHeight(): void {
    if (!this.textareaEl || !this.autosizeByJs) return;
    this.textareaEl.style.height = "auto";
    this.textareaEl.style.height = `${this.textareaEl.scrollHeight}px`;
  }

  private updateAppearance(): void {
    if (!this.textareaEl || !this.labelEl || !this.messageEl) return;

    const intent = normalizeIntent(this.getAttribute("intent"), "primary");
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const autosize = this.hasAttribute("autosize");

    this.textareaEl.placeholder = this.getAttribute("placeholder") || "";
    this.textareaEl.name = this.getAttribute("name") || "";
    this.textareaEl.disabled = this.hasAttribute("disabled");
    this.textareaEl.required = this.hasAttribute("required");
    this.textareaEl.readOnly = this.hasAttribute("readonly");
    const rows = Number.parseInt(this.getAttribute("rows") || "", 10);
    this.textareaEl.rows = Number.isFinite(rows) && rows > 0 ? rows : 3;

    for (const name of PASS_THROUGH_ATTRS) {
      const value = this.getAttribute(name);
      if (value === null) {
        this.textareaEl.removeAttribute(name);
      } else {
        this.textareaEl.setAttribute(name, value);
      }
    }

    this.autosizeByJs = autosize && !this.supportsFieldSizing();
    if (!this.autosizeByJs) this.textareaEl.style.removeProperty("height");

    // Fonte e padding por size; a altura mínima segue o token para uma linha alinhar com o ark-input.
    const sizes: Record<ArkSize, { field: string; label: string }> = {
      xs: { field: "ark:min-h-(--ark-size-xs) ark:px-2 ark:py-0.5 ark:text-xs", label: "ark:text-2xs" },
      sm: { field: "ark:min-h-(--ark-size-sm) ark:px-2.5 ark:py-1 ark:text-xs", label: "ark:text-2xs" },
      md: { field: "ark:min-h-(--ark-size-md) ark:px-3 ark:py-1.5 ark:text-sm", label: "ark:text-xs" },
      lg: { field: "ark:min-h-(--ark-size-lg) ark:px-4 ark:py-2 ark:text-base", label: "ark:text-sm" },
      xl: { field: "ark:min-h-(--ark-size-xl) ark:px-5 ark:py-2.5 ark:text-lg", label: "ark:text-base" }
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

    const resize =
      (this.getAttribute("resize") || "vertical").toLowerCase() === "none" ? "ark:resize-none" : "ark:resize-y";

    this.textareaEl.className = [
      "ark:block ark:w-full ark:min-w-0 ark:border ark:transition ark:focus:outline-none ark:focus:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      rounded,
      size.field,
      resize,
      autosize && !this.autosizeByJs ? "ark:field-sizing-content" : "",
      this.hasAttribute("monospace") ? "ark:font-mono" : "",
      "ark:border-border-strong ark:bg-surface ark:text-fg ark:placeholder:text-fg-placeholder",
      error ? "ark:border-danger" : "",
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
      this.messageEl.id = this.messageEl.id || `${this.textareaEl.id}-message`;
      this.textareaEl.setAttribute("aria-describedby", this.messageEl.id);
    } else {
      this.textareaEl.removeAttribute("aria-describedby");
    }
    this.textareaEl.setAttribute("aria-invalid", error ? "true" : "false");

    applyTestHooks(this, "textarea", this.textareaEl);
    applyTestHooks(this, "textarea", this.labelEl, "label");
    applyTestHooks(this, "textarea", this.messageEl, errorMessage ? "error" : "helper");

    this.fitHeight();
  }
}

export default ArkTextarea;
