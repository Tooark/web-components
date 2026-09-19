import type { ArkIntent, ArkRounded, ArkSelectOption, ArkSize } from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

/** Chevron do componente (chrome próprio), desenhado sobre a ponta direita do campo. */
const CHEVRON_SVG = `
  <svg class="ark:h-full ark:w-full" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>`;

let arkSelectIdCounter = 0;

/**
 * Campo de seleção padronizado: um <select> nativo estilizado, com teclado,
 * leitor de tela e mobile de graça. Layout em grid no PRÓPRIO host (ver
 * components.css): label, campo, chevron e mensagem são criados pelo
 * componente. As opções vêm de dados (atributo `options` em JSON ou
 * propriedade JS), nunca de filhos: o <select> exige os <option> dentro dele
 * e a lib não move filhos do usuário.
 */
export class ArkSelect extends HTMLElement {
  static readonly tagName = "ark-select";

  private selectEl: HTMLSelectElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private chevronEl: HTMLSpanElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  private optionsProp: ArkSelectOption[] | null = null;
  /** Assinatura das opções renderizadas; o <select> só é reconstruído quando ela muda. */
  private optionsKey: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "label",
      "placeholder",
      "options",
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
      "aria-label",
      "testid"
    ];
  }

  connectedCallback(): void {
    if (!this.selectEl) {
      this.render();
    }
    this.updateAppearance();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.selectEl) return;

    if (name === "value") {
      this.applyValue();
    }
    this.updateAppearance();
  }

  /** O <select> nativo interno, para composição por outros componentes. */
  get selectElement(): HTMLSelectElement | null {
    return this.selectEl;
  }

  /** Opções (propriedade JS; tem precedência sobre o atributo `options`). */
  get options(): ArkSelectOption[] {
    return this.optionsProp ?? this.parseOptionsAttr();
  }

  set options(list: ArkSelectOption[] | string | null) {
    // Frameworks que preferem propriedade a atributo (React 19, Vue) entregam o JSON do wrapper aqui.
    if (typeof list === "string") {
      this.optionsProp = null;
      this.setAttribute("options", list);
      return;
    }
    this.optionsProp = Array.isArray(list) ? list : null;
    if (this.selectEl) this.updateAppearance();
  }

  get value(): string {
    return this.selectEl?.value ?? this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    if (this.selectEl) {
      this.selectEl.value = next;
      this.updateAppearance();
    } else {
      this.setAttribute("value", next);
    }
  }

  focus(options?: FocusOptions): void {
    this.selectEl?.focus(options);
  }

  private parseOptionsAttr(): ArkSelectOption[] {
    const raw = this.getAttribute("options");
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ArkSelectOption[]) : [];
    } catch {
      return [];
    }
  }

  private render(): void {
    const id = this.getAttribute("id") ? `${this.getAttribute("id")}-select` : `ark-select-${++arkSelectIdCounter}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const select = document.createElement("select");
    select.id = id;
    select.addEventListener("change", this.handleChange);

    const chevron = document.createElement("span");
    chevron.innerHTML = CHEVRON_SVG;
    chevron.setAttribute("aria-hidden", "true");

    const message = document.createElement("p");

    // Ordem visual (label, campo, mensagem) vem das grid-areas em components.css.
    this.appendChild(label);
    this.appendChild(select);
    this.appendChild(chevron);
    this.appendChild(message);

    this.selectEl = select;
    this.labelEl = label;
    this.chevronEl = chevron;
    this.messageEl = message;
  }

  // O change nativo não sobe: o consumidor recebe um único `change`, com detail.
  private readonly handleChange = (event: Event): void => {
    event.stopPropagation();
    this.updateAppearance();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  };

  /** Reconstrói os <option> quando placeholder ou opções mudaram; devolve true nesse caso. */
  private syncOptions(): boolean {
    if (!this.selectEl) return false;

    const options = this.options;
    const placeholder = this.getAttribute("placeholder") || "";
    const key = JSON.stringify([placeholder, options]);
    if (key === this.optionsKey) return false;
    this.optionsKey = key;

    this.selectEl.textContent = "";

    if (placeholder) {
      // Aparece só no campo fechado: desabilitado e oculto da lista, como um placeholder de input.
      const option = document.createElement("option");
      option.value = "";
      option.textContent = placeholder;
      option.disabled = true;
      option.hidden = true;
      this.selectEl.appendChild(option);
    }

    const groups = new Map<string, HTMLOptGroupElement>();
    for (const item of options) {
      const option = document.createElement("option");
      option.value = String(item.value);
      option.textContent = item.label ?? String(item.value);
      option.disabled = Boolean(item.disabled);

      if (item.group) {
        let group = groups.get(item.group);
        if (!group) {
          group = document.createElement("optgroup");
          group.label = item.group;
          groups.set(item.group, group);
          this.selectEl.appendChild(group);
        }
        group.appendChild(option);
      } else {
        this.selectEl.appendChild(option);
      }
    }

    return true;
  }

  private applyValue(): void {
    if (!this.selectEl) return;

    const value = this.getAttribute("value");
    if (value !== null) {
      this.selectEl.value = value;
      return;
    }

    // Sem `value`: o placeholder fica selecionado; sem placeholder vale o padrão nativo (primeira opção).
    const placeholder = this.selectEl.querySelector<HTMLOptionElement>(':scope > option[value=""]');
    if (placeholder) placeholder.selected = true;
  }

  private updateAppearance(): void {
    if (!this.selectEl || !this.labelEl || !this.chevronEl || !this.messageEl) return;

    if (this.syncOptions()) this.applyValue();

    const intent = normalizeIntent(this.getAttribute("intent"), "primary");
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const hasPlaceholder = Boolean(this.getAttribute("placeholder"));
    const showingPlaceholder = hasPlaceholder && this.selectEl.value === "";

    this.selectEl.name = this.getAttribute("name") || "";
    this.selectEl.disabled = this.hasAttribute("disabled");
    this.selectEl.required = this.hasAttribute("required");
    // Sem `label` visível o nome vem de um aria-label do host, espelhado no <select> como no ark-input.
    const ariaLabel = this.getAttribute("aria-label");
    if (ariaLabel) {
      this.selectEl.setAttribute("aria-label", ariaLabel);
    } else {
      this.selectEl.removeAttribute("aria-label");
    }

    // Altura do campo pelo token --ark-size-* (min-height), igual ao ark-input; o padding direito reserva o chevron.
    const sizes: Record<ArkSize, { field: string; label: string; chevron: string }> = {
      xs: {
        field: "ark:min-h-(--ark-size-xs) ark:py-0.5 ark:pr-7 ark:pl-2 ark:text-xs",
        label: "ark:text-2xs",
        chevron: "ark:h-3.5 ark:w-3.5"
      },
      sm: {
        field: "ark:min-h-(--ark-size-sm) ark:py-1 ark:pr-8 ark:pl-2.5 ark:text-xs",
        label: "ark:text-2xs",
        chevron: "ark:h-3.5 ark:w-3.5"
      },
      md: {
        field: "ark:min-h-(--ark-size-md) ark:py-1.5 ark:pr-9 ark:pl-3 ark:text-sm",
        label: "ark:text-xs",
        chevron: "ark:h-4 ark:w-4"
      },
      lg: {
        field: "ark:min-h-(--ark-size-lg) ark:py-2 ark:pr-10 ark:pl-4 ark:text-base",
        label: "ark:text-sm",
        chevron: "ark:h-4 ark:w-4"
      },
      xl: {
        field: "ark:min-h-(--ark-size-xl) ark:py-2.5 ark:pr-12 ark:pl-5 ark:text-lg",
        label: "ark:text-base",
        chevron: "ark:h-5 ark:w-5"
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

    this.selectEl.className = [
      "ark:w-full ark:min-w-0 ark:appearance-none ark:cursor-pointer ark:border ark:transition ark:focus:outline-none ark:focus:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      rounded,
      size.field,
      "ark:border-border-strong ark:bg-surface",
      showingPlaceholder ? "ark:text-fg-placeholder" : "ark:text-fg",
      error ? "ark:border-danger" : "",
      focusRing
    ]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");

    this.chevronEl.className = ["ark:pointer-events-none ark:text-fg-muted", size.chevron].join(" ");

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
      this.messageEl.id = this.messageEl.id || `${this.selectEl.id}-message`;
      this.selectEl.setAttribute("aria-describedby", this.messageEl.id);
    } else {
      this.selectEl.removeAttribute("aria-describedby");
    }
    this.selectEl.setAttribute("aria-invalid", error ? "true" : "false");

    applyTestHooks(this, "select", this.selectEl);
    applyTestHooks(this, "select", this.labelEl, "label");
    applyTestHooks(this, "select", this.chevronEl, "chevron");
    applyTestHooks(this, "select", this.messageEl, errorMessage ? "error" : "helper");
  }
}

export default ArkSelect;
