import { type ArkColorSwatch, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/**
 * Paleta de cores: o PRÓPRIO host é o `role="radiogroup"` e cada amostra é
 * um botão `role="radio"` do componente, renderizado a partir de `colors`
 * (`{ name, value }[]`, atributo JSON ou propriedade JS), preenchido com a
 * cor e nomeado pelo `name`. Teclado do radio nativo: um tab stop, setas
 * movem e selecionam dando a volta, Home/End, Espaço seleciona. `change` só
 * quando a seleção muda pelo usuário.
 */
export class ArkColorSwatches extends HTMLElement {
  static readonly tagName = "ark-color-swatches";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private colorsProperty: ArkColorSwatch[] | null = null;
  private swatches: HTMLButtonElement[] = [];
  /** Assinatura das cores renderizadas, para reconstruir só quando a lista muda. */
  private renderedKey = "";

  static get observedAttributes(): string[] {
    return ["value", "colors", "label", "aria-label", "disabled", "size", "theme", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("keydown", this.handleKeydown);
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

  /** Amostras: a propriedade, ou o JSON do atributo `colors` (entradas sem name ou value são ignoradas). */
  get colors(): ArkColorSwatch[] {
    if (this.colorsProperty) return this.colorsProperty;
    try {
      const parsed = JSON.parse(this.getAttribute("colors") || "[]") as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is ArkColorSwatch =>
          typeof item === "object" && item !== null && typeof item.name === "string" && typeof item.value === "string"
      );
    } catch {
      return [];
    }
  }

  set colors(list: ArkColorSwatch[] | string | null | undefined) {
    // Frameworks que preferem propriedade a atributo (React 19, Vue) entregam o JSON do wrapper aqui.
    if (typeof list === "string") {
      this.colorsProperty = null;
      this.setAttribute("colors", list);
      return;
    }
    this.colorsProperty = Array.isArray(list) ? list : null;
    if (this.isConnected) this.updateAppearance();
  }

  /** Cor selecionada (o `value` da amostra). */
  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string) {
    this.setAttribute("value", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Seleciona uma cor como o usuário faria: muda `value`, foca a amostra e emite `change`. */
  select(value: string): void {
    if (this.disabled || value === this.value) return;
    if (!this.colors.some((color) => color.value === value)) return;
    this.setAttribute("value", value);
    this.swatches.find((swatch) => swatch.dataset.value === value)?.focus();
    this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true, composed: true }));
  }

  // Setas movem o foco e selecionam (comportamento do radio nativo), dando a volta; Home/End vão às pontas.
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || this.swatches.length === 0) return;
    const current = this.swatches.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    const count = this.swatches.length;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % count;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
    }
    if (next === null) return;
    event.preventDefault();
    const target = this.swatches[next];
    target.focus();
    this.select(target.dataset.value || "");
  };

  private getSizeClass(): string {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, string> = {
      xs: "ark:h-4 ark:w-4",
      sm: "ark:h-5 ark:w-5",
      md: "ark:h-6 ark:w-6",
      lg: "ark:h-8 ark:w-8",
      xl: "ark:h-10 ark:w-10"
    };
    return sizes[size] ?? sizes.md;
  }

  // Reconstrói os botões só quando a lista de cores muda.
  private syncSwatches(colors: ArkColorSwatch[]): void {
    const key = JSON.stringify(colors);
    if (key === this.renderedKey) return;
    for (const swatch of this.swatches) swatch.remove();
    this.swatches = colors.map((color) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.dataset.value = color.value;
      button.addEventListener("click", () => this.select(color.value));
      this.appendChild(button);
      return button;
    });
    this.renderedKey = key;
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
    const colors = this.colors;
    const value = this.value;
    const disabled = this.disabled;
    const sizeClass = this.getSizeClass();

    this.syncSwatches(colors);

    this.setAttribute("role", "radiogroup");
    // Só quando muda: aria-label é observado e um set igual reentraria aqui.
    const label = this.getAttribute("label");
    if (label && this.getAttribute("aria-label") !== label) this.setAttribute("aria-label", label);
    if (disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
    this.applyOwnClasses(
      ["ark:inline-flex ark:flex-wrap ark:items-center ark:gap-2", disabled ? "ark:opacity-50" : ""]
        .join(" ")
        .split(" ")
        .filter(Boolean)
    );

    // Um tab stop: a amostra selecionada, senão a primeira.
    const selectedIndex = colors.findIndex((color) => color.value === value);
    const stop = selectedIndex >= 0 ? selectedIndex : 0;
    this.swatches.forEach((swatch, index) => {
      const color = colors[index];
      const selected = index === selectedIndex;
      swatch.setAttribute("aria-label", color.name);
      swatch.setAttribute("aria-checked", selected ? "true" : "false");
      swatch.tabIndex = index === stop ? 0 : -1;
      swatch.disabled = disabled;
      swatch.style.backgroundColor = color.value;
      swatch.className = [
        "ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:rounded-full ark:border ark:border-border-strong ark:outline-none ark:transition-transform ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out) ark:ring-offset-surface ark:focus-visible:ring-2 ark:focus-visible:ring-offset-2 ark:focus-visible:ring-ring ark:disabled:cursor-not-allowed",
        sizeClass,
        selected ? "ark:scale-110 ark:ring-2 ark:ring-offset-2 ark:ring-fg" : "ark:hover:scale-110"
      ].join(" ");
      applyTestHooks(this, "color-swatches", swatch, "swatch");
    });

    applyTestHooks(this, "color-swatches", this);
  }
}

export default ArkColorSwatches;
