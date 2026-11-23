import { type ArkOrientation, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import type { ArkRadio } from "./ark-radio";
import { releaseGroupAttrs, stampGroupAttr } from "./group-attrs";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Atributos do grupo gravados em cada rádio enquanto o grupo os tem. */
const PROPAGATED_ATTRS = ["name", "size", "intent", "theme"];

let groupSeq = 0;

/**
 * Grupo de rádios. O PRÓPRIO host é o `role="radiogroup"` e os `ark-radio` do
 * usuário ficam onde estão: dentro dele os rádios formam um grupo pela
 * presença no host, com ou sem `name` (fora de um grupo continuam agrupando
 * por `name`). `value` reflete o rádio marcado e, atribuído, marca o desse
 * valor; o `change` de cada rádio é parado aqui e sai um só, consolidado, com
 * `detail: { value }`. `label` desenha a legenda própria, `helper` e
 * `error-message` a mensagem abaixo, como nos campos; `name`, `size`,
 * `intent`, `theme` e `disabled` do grupo valem para todos os rádios. O
 * teclado e a participação em formulário são os do ark-radio.
 */
export class ArkRadioGroup extends HTMLElementBase {
  static readonly tagName = "ark-radio-group";

  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private labelEl: HTMLSpanElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;
  /** Escrevendo `value` a partir dos rádios: o attributeChangedCallback não relê. */
  private syncingValue = false;
  /** Rádios já arrumados, para devolver os atributos a um que saiu do grupo. */
  private known = new Set<Element>();
  /** `aria-labelledby` que o próprio componente escreveu, para não apagar um do usuário. */
  private appliedLabelledBy: string | null = null;
  /** Os aria-* de estado que o componente escreveu no host, pelo mesmo motivo. */
  private appliedAria = new Map<string, string>();

  static get observedAttributes(): string[] {
    return [
      "value",
      "name",
      "label",
      "helper",
      "error",
      "error-message",
      "orientation",
      "required",
      "disabled",
      "size",
      "intent",
      "theme",
      "aria-label",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("change", this.handleRadioChange);
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.labelEl) this.render();
    if (!this.observer) {
      // Rádios que entram ou saem (frameworks) e um `checked` gravado direto num rádio refazem o estado do grupo.
      // Um atributo que o grupo governa, regravado direto num rádio, também volta ao valor do grupo.
      this.observer = new MutationObserver((records) =>
        this.syncRadios(records.some((record) => record.attributeName === "checked"))
      );
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["checked", "disabled", ...PROPAGATED_ATTRS]
      });
    }
    this.updateAppearance();
    this.syncRadios();
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
    if (!this.labelEl || !this.isConnected) return;
    if (name === "value") {
      if (!this.syncingValue) this.syncRadios();
      return;
    }
    this.updateAppearance();
    this.syncRadios();
  }

  /** O `value` do rádio marcado ("" sem nenhum). Atribuir marca o rádio desse valor, sem emitir `change`. */
  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value || null);
  }

  /** `name` gravado em cada rádio, para o formulário. */
  get name(): string {
    return this.getAttribute("name") || "";
  }

  set name(value: string | null | undefined) {
    reflectAttr(this, "name", value || null);
  }

  /** Legenda própria do grupo, que o nomeia por aria-labelledby. */
  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value || null);
  }

  /** Texto de apoio abaixo do grupo. */
  get helper(): string {
    return this.getAttribute("helper") || "";
  }

  set helper(value: string | null | undefined) {
    reflectAttr(this, "helper", value || null);
  }

  /** Marca o grupo como inválido (aria-invalid), com ou sem mensagem. */
  get error(): boolean {
    return this.hasAttribute("error");
  }

  set error(value: boolean | string | null | undefined) {
    this.toggleAttribute("error", coerceBooleanAttr(value));
  }

  /** Direção da lista: vertical ou horizontal. Padrão: "vertical". */
  get orientation(): ArkOrientation {
    return (this.getAttribute("orientation") || "").toLowerCase() === "horizontal" ? "horizontal" : "vertical";
  }

  set orientation(value: string | null | undefined) {
    reflectAttr(this, "orientation", value || null);
  }

  /** Escolha obrigatória: vira aria-required no grupo. */
  get required(): boolean {
    return this.hasAttribute("required");
  }

  set required(value: boolean | string | null | undefined) {
    this.toggleAttribute("required", coerceBooleanAttr(value));
  }

  /** Desabilita todos os rádios do grupo. */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Os rádios deste grupo, em ordem de documento, mesmo atrás de um wrapper de framework. */
  get radios(): ArkRadio[] {
    return Array.from(this.querySelectorAll<ArkRadio>("ark-radio")).filter(
      (radio) => radio.closest("ark-radio-group") === this
    );
  }

  // O `change` do rádio não vaza; o grupo publica o próprio, consolidado. Imediata porque quem escuta no próprio host
  // (wrappers) foi registrado depois deste listener e ainda receberia o do rádio.
  private readonly handleRadioChange = (event: Event): void => {
    const target = event.target as Element | null;
    if (!target || target === this || target.tagName.toLowerCase() !== "ark-radio") return;
    if (target.closest("ark-radio-group") !== this) return;
    event.stopImmediatePropagation();

    const value = (target as ArkRadio).value;
    this.writeValue(value);
    this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true, composed: true }));
  };

  private writeValue(value: string | null): void {
    this.syncingValue = true;
    if (value === null) {
      if (this.hasAttribute("value")) this.removeAttribute("value");
    } else if (this.getAttribute("value") !== value) {
      this.setAttribute("value", value);
    }
    this.syncingValue = false;
  }

  /**
   * Grava em cada rádio os atributos do grupo, devolve os de quem saiu e concilia o `value`. O declarado no grupo
   * marca o rádio desse valor (também um que chegar depois); sem ele, ou quando foi um rádio que mudou
   * (`fromRadios`: um `checked` gravado direto nele), o rádio marcado escreve o `value`.
   */
  private syncRadios(fromRadios = false): void {
    const radios = this.radios;

    for (const gone of Array.from(this.known)) {
      if (radios.includes(gone as ArkRadio)) continue;
      releaseGroupAttrs(gone);
      this.known.delete(gone);
    }
    for (const radio of radios) {
      this.known.add(radio);
      for (const name of PROPAGATED_ATTRS) stampGroupAttr(radio, name, this.getAttribute(name));
      stampGroupAttr(radio, "disabled", this.disabled ? "" : null);
    }

    const checked = radios.find((radio) => radio.hasAttribute("checked")) ?? null;
    const wanted = this.getAttribute("value");
    if (fromRadios) {
      this.writeValue(checked ? checked.getAttribute("value") || "on" : null);
      return;
    }
    if (wanted === null) {
      if (checked) this.writeValue(checked.getAttribute("value") || "on");
      return;
    }
    // Marcar um desmarca os outros (o próprio rádio cuida disso), sem `change`. Sem rádio com esse valor ainda, o
    // `value` fica à espera dele.
    const target = radios.find((radio) => (radio.getAttribute("value") || "on") === wanted) ?? null;
    if (target && !target.hasAttribute("checked")) target.setAttribute("checked", "");
  }

  private render(): void {
    const id = this.id || `ark-radio-group-${++groupSeq}`;
    const label = document.createElement("span");
    label.setAttribute("data-ark-chrome", "label");
    label.id = `${id}-label`;
    const message = document.createElement("p");
    message.setAttribute("data-ark-chrome", "message");
    message.id = `${id}-message`;
    // Os dois no início do host, antes dos rádios do usuário: a mensagem vai para o fim pelo `order`, então um rádio
    // que um framework inserir depois nunca fica abaixo dela.
    this.prepend(label, message);
    this.labelEl = label;
    this.messageEl = message;
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

  // Estado em aria-* no host: o componente grava o que tem a dizer e, sem nada a dizer, só tira o que ele mesmo
  // gravou. Um aria-describedby (ou aria-invalid, aria-required) que o app pôs no host continua lá.
  private writeAria(name: string, value: string | null): void {
    const written = this.appliedAria.get(name);
    if (value === null) {
      if (written === undefined) return;
      this.appliedAria.delete(name);
      if (this.getAttribute(name) === written) this.removeAttribute(name);
      return;
    }
    setAttr(this, name, value);
    this.appliedAria.set(name, value);
  }

  private updateAppearance(): void {
    if (!this.labelEl || !this.messageEl) return;
    const horizontal = this.orientation === "horizontal";
    const errorMessage = this.getAttribute("error-message") || "";
    const helper = this.getAttribute("helper") || "";
    const message = errorMessage || helper;
    const invalid = this.hasAttribute("error") || errorMessage !== "";
    const labelText = this.getAttribute("label") || "";

    setAttr(this, "role", "radiogroup");
    setAttr(this, "aria-orientation", horizontal ? "horizontal" : "vertical");
    this.writeAria("aria-required", this.required ? "true" : null);
    this.writeAria("aria-invalid", invalid ? "true" : null);
    this.writeAria("aria-describedby", message ? this.messageEl.id : null);

    // A legenda nomeia o grupo; um aria-label ou um aria-labelledby que o usuário pôs por conta própria vencem.
    const labelledBy = this.getAttribute("aria-labelledby");
    const mine = labelledBy === null || labelledBy === this.appliedLabelledBy;
    if (labelText && !this.hasAttribute("aria-label") && mine) {
      setAttr(this, "aria-labelledby", this.labelEl.id);
      this.appliedLabelledBy = this.labelEl.id;
    } else if (this.appliedLabelledBy !== null) {
      if (labelledBy === this.appliedLabelledBy) this.removeAttribute("aria-labelledby");
      this.appliedLabelledBy = null;
    }

    const sizes: Record<ArkSize, { label: string; gap: string }> = {
      xs: { label: "ark:text-2xs", gap: "ark:gap-x-3 ark:gap-y-1.5" },
      sm: { label: "ark:text-xs", gap: "ark:gap-x-4 ark:gap-y-2" },
      md: { label: "ark:text-xs", gap: "ark:gap-x-4 ark:gap-y-2" },
      lg: { label: "ark:text-sm", gap: "ark:gap-x-5 ark:gap-y-2.5" },
      xl: { label: "ark:text-base", gap: "ark:gap-x-6 ark:gap-y-3" }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    // Coluna (vertical) ou fila que quebra (horizontal); a legenda e a mensagem ocupam a linha inteira nos dois.
    this.applyOwnClasses(
      [
        "ark:flex",
        horizontal ? "ark:flex-row ark:flex-wrap ark:items-center" : "ark:flex-col ark:items-start",
        size.gap
      ]
        .join(" ")
        .split(/\s+/)
    );

    if (this.labelEl.textContent !== labelText) this.labelEl.textContent = labelText;
    this.labelEl.hidden = !labelText;
    setClass(this.labelEl, `ark:block ark:basis-full ark:font-medium ark:text-fg-soft ${size.label}`);

    if (this.messageEl.textContent !== message) this.messageEl.textContent = message;
    this.messageEl.hidden = !message;
    setClass(
      this.messageEl,
      `ark:order-last ark:basis-full ark:text-xs ${errorMessage ? "ark:text-danger-soft-fg" : "ark:text-fg-muted"}`
    );

    applyTestHooks(this, "radio-group", this);
    applyTestHooks(this, "radio-group", this.labelEl, "label");
    applyTestHooks(this, "radio-group", this.messageEl, errorMessage ? "error" : "helper");
  }
}

/** Troca a classe só quando muda (o observer do grupo vê a subárvore). */
function setClass(el: Element, value: string): void {
  if (el.className !== value) el.className = value;
}

/** Escreve um atributo só quando muda (os observados reentrariam no attributeChangedCallback). */
function setAttr(el: Element, name: string, value: string | null): void {
  if (value === null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== value) {
    el.setAttribute(name, value);
  }
}

export default ArkRadioGroup;
