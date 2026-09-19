import { coerceBooleanAttr } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/**
 * Item de um ark-command-palette. O PRÓPRIO host é a opção (`role="option"`):
 * ícone e texto são filhos livres e um filho `slot="trailing"` (atalho,
 * badge) vai para a direita por CSS. Nunca recebe foco: o campo de busca da
 * paleta aponta para ele por `aria-activedescendant`. `value` é o que
 * `ark-select` carrega, `group` a seção em que é listado, `label` o texto do
 * filtro e do nome (padrão: o texto dos filhos sem slot). A paleta escreve
 * `id`, `hidden`, `aria-selected` e a ordem visual.
 */
export class ArkCommandItem extends HTMLElement {
  static readonly tagName = "ark-command-item";

  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["value", "group", "label", "disabled", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
  }

  connectedCallback(): void {
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

  get value(): string {
    return this.getAttribute("value") || "";
  }

  /** Seção em que a paleta lista o item; vazio é sem grupo. */
  get group(): string {
    return (this.getAttribute("group") || "").trim();
  }

  /** Texto usado no filtro e no nome da opção: `label`, senão o texto dos filhos sem slot. */
  get label(): string {
    const attr = this.getAttribute("label");
    if (attr) return attr.trim();
    return Array.from(this.childNodes)
      .filter((node) => !(node instanceof Element && node.hasAttribute("slot")))
      .map((node) => node.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Seleciona o item: emite `ark-select` com o value, que a paleta consolida e fecha em seguida. */
  select(): void {
    if (this.disabled) return;
    this.dispatchEvent(new CustomEvent("ark-select", { detail: { value: this.value }, bubbles: true, composed: true }));
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.select();
  };

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
    this.setAttribute("role", "option");
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
    const label = this.getAttribute("label");
    if (label) {
      this.setAttribute("aria-label", label);
    } else {
      this.removeAttribute("aria-label");
    }

    this.applyOwnClasses(
      "ark:flex ark:min-h-9 ark:cursor-pointer ark:items-center ark:gap-2 ark:px-4 ark:py-1.5 ark:text-sm ark:text-fg ark:select-none ark:data-[ark-active]:bg-surface-muted ark:aria-disabled:cursor-not-allowed ark:aria-disabled:opacity-50".split(
        " "
      )
    );

    applyTestHooks(this, "command-item", this);
  }
}

export default ArkCommandItem;
