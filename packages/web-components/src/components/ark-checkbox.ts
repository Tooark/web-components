import { type ArkIntent, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

type ArkCheckboxPalette = {
  ring: string;
  on: string;
};

type ArkCheckboxSizing = {
  box: string;
  label: string;
};

/** Glifo de marcado (chrome próprio do componente). */
const CHECK_SVG =
  '<svg class="ark:h-full ark:w-full" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5l2.5 2.5 4.5-5"></path></svg>';
/** Glifo de indeterminado: um traço. */
const MIXED_SVG =
  '<svg class="ark:h-full ark:w-full" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 6h6"></path></svg>';

let nextId = 0;

/**
 * Caixa de seleção: o desenho é do componente (um <button role="checkbox">
 * com o glifo) e um <input type="checkbox"> oculto carrega name/value para o
 * formulário; os dois são controles nativos, então <fieldset disabled> os
 * desabilita sem JS. `label` vira um <label for> próprio; sem ele o host
 * precisa de aria-label, ou de filhos (texto livre, links), que dão nome à
 * caixa por aria-labelledby e a alternam ao clique. Os nós próprios ficam no
 * início do host, marcados data-ark-chrome, antes dos filhos do usuário.
 */
export class ArkCheckbox extends HTMLElementBase {
  static readonly tagName = "ark-checkbox";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private boxEl: HTMLButtonElement | null = null;
  private iconEl: HTMLSpanElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private observer: MutationObserver | null = null;
  /** Glifo em exibição; a troca depois do primeiro render entra com scale-in. */
  private iconKind: "none" | "check" | "mixed" | null = null;

  static get observedAttributes(): string[] {
    return [
      "checked",
      "indeterminate",
      "disabled",
      "name",
      "value",
      "label",
      "aria-label",
      "size",
      "intent",
      "theme",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleHostClick);
  }

  connectedCallback(): void {
    if (!this.boxEl) this.render();
    if (!this.observer) {
      // Filhos que chegam depois (frameworks) passam a nomear a caixa.
      this.observer = new MutationObserver(() => this.syncName());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.boxEl || !this.isConnected) return;
    this.updateAppearance();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean | string | null | undefined) {
    this.toggleAttribute("checked", coerceBooleanAttr(value));
  }

  /** Estado misto (parte de um grupo marcada): aria-checked="mixed" e o traço; o próximo clique limpa. */
  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }

  set indeterminate(value: boolean | string | null | undefined) {
    this.toggleAttribute("indeterminate", coerceBooleanAttr(value));
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  get name(): string {
    return this.getAttribute("name") || "";
  }

  set name(value: string) {
    this.setAttribute("name", value);
  }

  /** Valor submetido quando marcado. Padrão: "on", como o input nativo. */
  get value(): string {
    return this.getAttribute("value") || "on";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  /** Alterna o estado como um clique: limpa `indeterminate`, inverte `checked` e emite `change`. */
  toggle(): void {
    if (this.isDisabled()) return;

    this.removeAttribute("indeterminate");
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true
      })
    );
  }

  focus(options?: FocusOptions): void {
    this.boxEl?.focus(options);
  }

  // Cobre o atributo e o <fieldset disabled>, que desabilita o botão nativamente.
  private isDisabled(): boolean {
    return this.boxEl ? this.boxEl.matches(":disabled") : this.disabled;
  }

  // Clique nos filhos do usuário (o rótulo livre) alterna a caixa, como um <label>. O botão e o <label for>
  // próprios já fazem isso nativamente; um controle ou link dentro do rótulo fica com o próprio comportamento.
  private readonly handleHostClick = (event: MouseEvent): void => {
    if (!this.boxEl) return;
    const target = event.target as HTMLElement | null;
    if (!target || target === this.boxEl || this.boxEl.contains(target)) return;
    if (this.labelEl && (target === this.labelEl || this.labelEl.contains(target))) return;
    if (target.closest("a, button, input, select, textarea, label, [contenteditable]") !== null) return;
    if (this.isDisabled()) return;
    this.boxEl.focus();
    this.toggle();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    // Enter não marca um checkbox; só Espaço (o clique nativo do botão).
    if (event.key === "Enter") event.preventDefault();
  };

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

  private getPalette(intent: ArkIntent): ArkCheckboxPalette {
    const palettes: Record<ArkIntent, ArkCheckboxPalette> = {
      primary: {
        ring: "ark:focus-visible:ring-primary-ring",
        on: "ark:border-primary ark:bg-primary ark:text-primary-fg ark:hover:border-primary-hover ark:hover:bg-primary-hover"
      },
      secondary: {
        ring: "ark:focus-visible:ring-secondary-ring",
        on: "ark:border-secondary ark:bg-secondary ark:text-secondary-fg ark:hover:border-secondary-hover ark:hover:bg-secondary-hover"
      },
      success: {
        ring: "ark:focus-visible:ring-success-ring",
        on: "ark:border-success ark:bg-success ark:text-success-fg ark:hover:border-success-hover ark:hover:bg-success-hover"
      },
      warning: {
        ring: "ark:focus-visible:ring-warning-ring",
        on: "ark:border-warning ark:bg-warning ark:text-warning-fg ark:hover:border-warning-hover ark:hover:bg-warning-hover"
      },
      danger: {
        ring: "ark:focus-visible:ring-danger-ring",
        on: "ark:border-danger ark:bg-danger ark:text-danger-fg ark:hover:border-danger-hover ark:hover:bg-danger-hover"
      },
      info: {
        ring: "ark:focus-visible:ring-info-ring",
        on: "ark:border-info ark:bg-info ark:text-info-fg ark:hover:border-info-hover ark:hover:bg-info-hover"
      },
      neutral: {
        ring: "ark:focus-visible:ring-neutral-ring",
        on: "ark:border-neutral ark:bg-neutral ark:text-neutral-fg ark:hover:border-neutral-hover ark:hover:bg-neutral-hover"
      }
    };

    return palettes[intent];
  }

  // Caixa na escala de espaçamento, como o ark-switch: um glifo ao lado do texto, não um controle de altura.
  private getSizing(): ArkCheckboxSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, ArkCheckboxSizing> = {
      xs: { box: "ark:h-3.5 ark:w-3.5 ark:p-px", label: "ark:text-xs" },
      sm: { box: "ark:h-4 ark:w-4 ark:p-px", label: "ark:text-sm" },
      md: { box: "ark:h-5 ark:w-5 ark:p-0.5", label: "ark:text-sm" },
      lg: { box: "ark:h-6 ark:w-6 ark:p-0.5", label: "ark:text-base" },
      xl: { box: "ark:h-7 ark:w-7 ark:p-1", label: "ark:text-lg" }
    };
    return sizes[size] ?? sizes.md;
  }

  private render(): void {
    const box = document.createElement("button");
    box.type = "button";
    box.setAttribute("role", "checkbox");
    box.setAttribute("data-ark-chrome", "box");
    box.id = `ark-checkbox-${++nextId}`;
    box.addEventListener("click", () => this.toggle());
    box.addEventListener("keydown", this.handleKeydown);

    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    box.appendChild(icon);

    // Checkbox oculto para participação em formulários (submete quando marcado).
    const input = document.createElement("input");
    input.type = "checkbox";
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.setAttribute("data-ark-chrome", "input");

    // No início do host: a caixa antes do rótulo na ordem de leitura; o input oculto não conta.
    this.prepend(box, input);

    this.boxEl = box;
    this.iconEl = icon;
    this.inputEl = input;
  }

  // Rótulo próprio: <label for> logo depois do input oculto, só enquanto `label` existir.
  private syncLabel(sizing: ArkCheckboxSizing): void {
    const text = this.getAttribute("label");
    if (!text) {
      this.labelEl?.remove();
      this.labelEl = null;
      return;
    }
    if (!this.labelEl) {
      const label = document.createElement("label");
      label.setAttribute("data-ark-chrome", "label");
      this.inputEl?.after(label);
      this.labelEl = label;
    }
    this.labelEl.htmlFor = this.boxEl?.id ?? "";
    this.labelEl.textContent = text;
    this.labelEl.className = ["ark:cursor-[inherit] ark:select-none ark:text-fg", sizing.label].join(" ");
  }

  // Nome acessível da caixa: o <label for> próprio; senão aria-label; senão os filhos do usuário, via
  // aria-labelledby no host (que ganha um id quando falta).
  private syncName(): void {
    if (!this.boxEl) return;
    const ariaLabel = this.getAttribute("aria-label");
    const hasChildren = Array.from(this.childNodes).some(
      (node) =>
        (node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim() !== "") ||
        (node.nodeType === Node.ELEMENT_NODE && !(node as Element).hasAttribute("data-ark-chrome"))
    );

    if (this.labelEl) {
      this.boxEl.removeAttribute("aria-label");
      this.boxEl.removeAttribute("aria-labelledby");
    } else if (ariaLabel) {
      this.boxEl.setAttribute("aria-label", ariaLabel);
      this.boxEl.removeAttribute("aria-labelledby");
    } else if (hasChildren) {
      if (!this.id) this.id = `ark-checkbox-${++nextId}-host`;
      this.boxEl.removeAttribute("aria-label");
      this.boxEl.setAttribute("aria-labelledby", this.id);
    } else {
      this.boxEl.removeAttribute("aria-label");
      this.boxEl.removeAttribute("aria-labelledby");
    }
  }

  private syncIcon(kind: "none" | "check" | "mixed"): void {
    if (!this.iconEl || kind === this.iconKind) return;
    const animate = this.iconKind !== null && kind !== "none";
    this.iconEl.innerHTML = kind === "check" ? CHECK_SVG : kind === "mixed" ? MIXED_SVG : "";
    this.iconEl.className = [
      "ark:flex ark:h-full ark:w-full ark:items-center ark:justify-center",
      animate ? "ark-animate-scale-in" : ""
    ]
      .join(" ")
      .trim();
    this.iconKind = kind;
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
    if (!this.boxEl || !this.inputEl) return;

    const palette = this.getPalette(this.getIntent());
    const sizing = this.getSizing();
    const checked = this.checked;
    const indeterminate = this.indeterminate;
    const disabled = this.disabled;

    // O host dimeriza tudo (caixa e rótulo) quando qualquer controle interno está desabilitado, inclusive
    // por <fieldset disabled>.
    this.applyOwnClasses(
      "ark:inline-flex ark:cursor-pointer ark:items-center ark:gap-2 ark:align-middle ark:has-disabled:cursor-not-allowed ark:has-disabled:opacity-50".split(
        " "
      )
    );

    this.boxEl.className = [
      "ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-sm ark:border ark:outline-none ark:transition-colors ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out) ark:focus-visible:ring-2 ark:focus-visible:ring-offset-2 ark:ring-offset-surface ark:disabled:cursor-not-allowed",
      palette.ring,
      sizing.box,
      checked || indeterminate
        ? palette.on
        : "ark:border-border-strong ark:bg-surface ark:text-transparent ark:hover:bg-surface-muted"
    ].join(" ");
    this.boxEl.setAttribute("aria-checked", indeterminate ? "mixed" : checked ? "true" : "false");
    this.boxEl.disabled = disabled;

    this.syncIcon(indeterminate ? "mixed" : checked ? "check" : "none");
    this.syncLabel(sizing);
    this.syncName();

    this.inputEl.checked = checked;
    this.inputEl.indeterminate = indeterminate;
    this.inputEl.disabled = disabled;
    this.inputEl.name = this.name;
    this.inputEl.value = this.value;

    applyTestHooks(this, "checkbox", this.boxEl);
    applyTestHooks(this, "checkbox", this.inputEl, "input");
    if (this.labelEl) applyTestHooks(this, "checkbox", this.labelEl, "label");
  }
}

export default ArkCheckbox;
