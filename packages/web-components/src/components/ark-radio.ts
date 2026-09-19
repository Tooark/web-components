import { type ArkIntent, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkRadioPalette = {
  ring: string;
  on: string;
};

type ArkRadioSizing = {
  box: string;
  dot: string;
  label: string;
};

let nextId = 0;

/**
 * Botão de opção: o desenho é do componente (um <button role="radio"> com o
 * ponto) e um <input type="radio"> oculto carrega name/value para o
 * formulário, que agrupa nativamente por `name`; os dois são controles
 * nativos, então <fieldset disabled> os desabilita sem JS. O grupo, para
 * exclusividade, setas e roving tabindex, são os ark-radio de mesmo `name` no
 * mesmo <form> (ou na mesma raiz, sem form): marcar um desmarca os outros em
 * silêncio e `change` dispara só no que ganhou a marca; as setas movem o foco
 * e marcam, Espaço marca o focado, e um único deles fica na ordem de Tab (o
 * marcado, ou o primeiro habilitado). `label`, aria-label e filhos nomeiam a
 * opção como no ark-checkbox.
 */
export class ArkRadio extends HTMLElement {
  static readonly tagName = "ark-radio";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private boxEl: HTMLButtonElement | null = null;
  private dotEl: HTMLSpanElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private observer: MutationObserver | null = null;
  /** Raiz do grupo no último connect, para ressincronizar os que ficam quando este sai. */
  private groupRoot: ParentNode | null = null;
  /** Se o ponto já apareceu; a marcação depois do primeiro render entra com scale-in. */
  private dotShown: boolean | null = null;

  static get observedAttributes(): string[] {
    return [
      "checked",
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
      this.observer = new MutationObserver(() => this.syncName());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
    this.groupRoot = this.resolveGroupRoot();
    if (this.checked) this.uncheckSiblings();
    this.syncTabStops();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    // Quem fica precisa de um novo tab stop se este era o marcado.
    const root = this.groupRoot;
    this.groupRoot = null;
    if (root) ArkRadio.syncGroup(ArkRadio.membersIn(root, this.name, root instanceof HTMLFormElement ? root : null));
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.boxEl || !this.isConnected) return;
    this.updateAppearance();
    if (name === "checked" && this.checked) this.uncheckSiblings();
    if (name === "checked" || name === "disabled" || name === "name") this.syncTabStops();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean | string | null | undefined) {
    this.toggleAttribute("checked", coerceBooleanAttr(value));
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

  /** Valor submetido e publicado em `change` quando esta opção está marcada. Padrão: "on". */
  get value(): string {
    return this.getAttribute("value") || "on";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  /** Marca esta opção como um clique: desmarca as outras do grupo e emite `change` com o value. */
  select(): void {
    if (this.isDisabled() || this.checked) return;

    this.checked = true;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  focus(options?: FocusOptions): void {
    this.boxEl?.focus(options);
  }

  private isDisabled(): boolean {
    return this.boxEl ? this.boxEl.matches(":disabled") : this.disabled;
  }

  // --- Grupo ---

  // O <form> do input oculto, ou a raiz (documento ou shadow root) quando não há form.
  private resolveGroupRoot(): ParentNode | null {
    const form = this.inputEl?.form ?? null;
    if (form) return form;
    const root = this.getRootNode();
    return root instanceof Document || root instanceof DocumentFragment ? root : null;
  }

  private static membersIn(root: ParentNode, name: string, form: HTMLFormElement | null): ArkRadio[] {
    return Array.from(root.querySelectorAll<ArkRadio>("ark-radio")).filter(
      (radio) => radio instanceof ArkRadio && radio.name === name && (radio.inputEl?.form ?? null) === form
    );
  }

  /** Os ark-radio do mesmo grupo (mesmo `name` no mesmo form, ou na mesma raiz sem form), este incluído. */
  private members(): ArkRadio[] {
    const root = this.resolveGroupRoot();
    if (!root) return [this];
    return ArkRadio.membersIn(root, this.name, root instanceof HTMLFormElement ? root : null);
  }

  private uncheckSiblings(): void {
    for (const radio of this.members()) {
      if (radio !== this && radio.checked) radio.checked = false;
    }
  }

  // Um único tab stop por grupo: o marcado, ou o primeiro habilitado quando nenhum está.
  private static syncGroup(group: ArkRadio[]): void {
    const enabled = group.filter((radio) => !radio.isDisabled());
    const stop = enabled.find((radio) => radio.checked) ?? enabled[0] ?? null;
    for (const radio of group) {
      if (radio.boxEl) radio.boxEl.tabIndex = radio === stop ? 0 : -1;
    }
  }

  private syncTabStops(): void {
    ArkRadio.syncGroup(this.members());
  }

  // Setas movem o foco dentro do grupo e marcam a opção que o recebe (comportamento nativo), pulando as
  // desabilitadas e dando a volta.
  private move(step: 1 | -1): void {
    const enabled = this.members().filter((radio) => !radio.isDisabled());
    const index = enabled.indexOf(this);
    if (index < 0 || enabled.length < 2) return;
    const next = enabled[(index + step + enabled.length) % enabled.length];
    next.focus();
    next.select();
  }

  // --- Interação ---

  private readonly handleHostClick = (event: MouseEvent): void => {
    if (!this.boxEl) return;
    const target = event.target as HTMLElement | null;
    if (!target || target === this.boxEl || this.boxEl.contains(target)) return;
    if (this.labelEl && (target === this.labelEl || this.labelEl.contains(target))) return;
    if (target.closest("a, button, input, select, textarea, label, [contenteditable]") !== null) return;
    if (this.isDisabled()) return;
    this.boxEl.focus();
    this.select();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        event.preventDefault();
        this.move(1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        event.preventDefault();
        this.move(-1);
        break;
      case "Enter":
        // Enter não marca um radio; só Espaço (o clique nativo do botão).
        event.preventDefault();
        break;
    }
  };

  // --- Aparência ---

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

  private getPalette(intent: ArkIntent): ArkRadioPalette {
    const palettes: Record<ArkIntent, ArkRadioPalette> = {
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

  // Mesmas caixas do ark-checkbox, redondas, com o ponto a cerca de 40%.
  private getSizing(): ArkRadioSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, ArkRadioSizing> = {
      xs: { box: "ark:h-3.5 ark:w-3.5", dot: "ark:h-1.5 ark:w-1.5", label: "ark:text-xs" },
      sm: { box: "ark:h-4 ark:w-4", dot: "ark:h-1.5 ark:w-1.5", label: "ark:text-sm" },
      md: { box: "ark:h-5 ark:w-5", dot: "ark:h-2 ark:w-2", label: "ark:text-sm" },
      lg: { box: "ark:h-6 ark:w-6", dot: "ark:h-2.5 ark:w-2.5", label: "ark:text-base" },
      xl: { box: "ark:h-7 ark:w-7", dot: "ark:h-3 ark:w-3", label: "ark:text-lg" }
    };
    return sizes[size] ?? sizes.md;
  }

  private render(): void {
    const box = document.createElement("button");
    box.type = "button";
    box.setAttribute("role", "radio");
    box.setAttribute("data-ark-chrome", "box");
    box.id = `ark-radio-${++nextId}`;
    box.addEventListener("click", () => this.select());
    box.addEventListener("keydown", this.handleKeydown);

    const dot = document.createElement("span");
    dot.setAttribute("aria-hidden", "true");
    box.appendChild(dot);

    // Radio oculto para participação em formulários: o name agrupa nativamente.
    const input = document.createElement("input");
    input.type = "radio";
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    input.setAttribute("data-ark-chrome", "input");

    this.prepend(box, input);

    this.boxEl = box;
    this.dotEl = dot;
    this.inputEl = input;
  }

  private syncLabel(sizing: ArkRadioSizing): void {
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
      if (!this.id) this.id = `ark-radio-${++nextId}-host`;
      this.boxEl.removeAttribute("aria-label");
      this.boxEl.setAttribute("aria-labelledby", this.id);
    } else {
      this.boxEl.removeAttribute("aria-label");
      this.boxEl.removeAttribute("aria-labelledby");
    }
  }

  private syncDot(checked: boolean, sizing: ArkRadioSizing): void {
    if (!this.dotEl) return;
    const animate = this.dotShown === false && checked;
    this.dotEl.className = [
      "ark:rounded-full ark:bg-current",
      sizing.dot,
      checked ? "ark:block" : "ark:hidden",
      animate ? "ark-animate-scale-in" : ""
    ]
      .join(" ")
      .trim();
    this.dotShown = checked;
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
    const disabled = this.disabled;

    this.applyOwnClasses(
      "ark:inline-flex ark:cursor-pointer ark:items-center ark:gap-2 ark:align-middle ark:has-disabled:cursor-not-allowed ark:has-disabled:opacity-50".split(
        " "
      )
    );

    this.boxEl.className = [
      "ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-full ark:border ark:outline-none ark:transition-colors ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out) ark:focus-visible:ring-2 ark:focus-visible:ring-offset-2 ark:ring-offset-surface ark:disabled:cursor-not-allowed",
      palette.ring,
      sizing.box,
      checked ? palette.on : "ark:border-border-strong ark:bg-surface ark:text-transparent ark:hover:bg-surface-muted"
    ].join(" ");
    this.boxEl.setAttribute("aria-checked", checked ? "true" : "false");
    this.boxEl.disabled = disabled;

    this.syncDot(checked, sizing);
    this.syncLabel(sizing);
    this.syncName();

    this.inputEl.checked = checked;
    this.inputEl.disabled = disabled;
    this.inputEl.name = this.name;
    this.inputEl.value = this.value;

    applyTestHooks(this, "radio", this.boxEl);
    applyTestHooks(this, "radio", this.dotEl as Element, "dot");
    applyTestHooks(this, "radio", this.inputEl, "input");
    if (this.labelEl) applyTestHooks(this, "radio", this.labelEl, "label");
  }
}

export default ArkRadio;
