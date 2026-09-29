import { type ArkLocale, type ArkMarkShape, type ArkSize, coerceBooleanAttr, resolveLocale } from "@tooark/core";
import { ARK_MARK_SHAPES, type ArkMark, normalizeMarkShape } from "./ark-mark";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Chave do nome localizado de cada forma. */
const SHAPE_LABEL: Record<ArkMarkShape, keyof ArkLocale> = {
  circle: "shapeCircle",
  square: "shapeSquare",
  triangle: "shapeTriangle",
  diamond: "shapeDiamond",
  star: "shapeStar",
  hexagon: "shapeHexagon",
  cross: "shapeCross",
  pentagon: "shapePentagon",
  moon: "shapeMoon",
  asterisk: "shapeAsterisk"
};

/**
 * Seletor de forma da marca de escopo: o PRÓPRIO host é o `role="radiogroup"`
 * com uma opção `role="radio"` por forma, renderizada pelo componente, cada
 * uma um ark-mark desenhado em `color` (a cor atual, para o usuário ver o par
 * real) e nomeada pelo nome localizado da forma. Sem `shapes` são as dez
 * formas do ark-mark, na ordem de `ARK_MARK_SHAPES`; `shapes` escolhe quais e
 * em que ordem. Mesmo teclado do ark-color-swatches. `change` só quando a
 * seleção muda pelo usuário.
 */
export class ArkShapePicker extends HTMLElementBase {
  static readonly tagName = "ark-shape-picker";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private options: HTMLButtonElement[] = [];
  /** Formas das opções renderizadas, na ordem dos botões. */
  private offered: ArkMarkShape[] = [];
  private rendered = false;

  static get observedAttributes(): string[] {
    return [
      "value",
      "shapes",
      "color",
      "label",
      "aria-label",
      "disabled",
      "size",
      "lang",
      "locale-json",
      "theme",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("keydown", this.handleKeydown);
  }

  connectedCallback(): void {
    upgradeProperties(this);
    this.rendered = true;
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.rendered || !this.isConnected) return;
    this.updateAppearance();
  }

  /** Forma selecionada; sem atributo ou com valor inválido, nenhuma. */
  get value(): ArkMarkShape | "" {
    const raw = this.getAttribute("value");
    return raw && ARK_MARK_SHAPES.includes(raw as ArkMarkShape) ? (raw as ArkMarkShape) : "";
  }

  set value(value: ArkMarkShape | "") {
    if (value) {
      this.setAttribute("value", value);
    } else {
      this.removeAttribute("value");
    }
  }

  /** Formas oferecidas, na ordem (atributo `shapes`, separado por vírgula, ou "all"); sem nenhuma válida, as dez. */
  get shapes(): ArkMarkShape[] {
    const raw = (this.getAttribute("shapes") || "").trim().toLowerCase();
    if (raw === "all") return [...ARK_MARK_SHAPES];
    const list: ArkMarkShape[] = [];
    for (const token of raw.split(",")) {
      const shape = token.trim() as ArkMarkShape;
      if (ARK_MARK_SHAPES.includes(shape) && !list.includes(shape)) list.push(shape);
    }
    return list.length > 0 ? list : [...ARK_MARK_SHAPES];
  }

  set shapes(value: ArkMarkShape[] | string | null | undefined) {
    const list = Array.isArray(value) ? value.join(",") : value || "";
    if (list) {
      this.setAttribute("shapes", list);
    } else {
      this.removeAttribute("shapes");
    }
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Seleciona uma forma oferecida como o usuário faria: muda `value`, foca a opção e emite `change`. */
  select(value: ArkMarkShape): void {
    const shape = normalizeMarkShape(value);
    if (this.disabled || shape === this.value || !this.shapes.includes(shape)) return;
    this.setAttribute("value", shape);
    this.options[this.offered.indexOf(shape)]?.focus();
    this.dispatchEvent(new CustomEvent("change", { detail: { value: shape }, bubbles: true, composed: true }));
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.disabled) return;
    const current = this.options.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;
    const count = this.options.length;
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
    this.options[next].focus();
    this.select(this.offered[next]);
  };

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getSizing(): { option: string; mark: string } {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, { option: string; mark: string }> = {
      xs: { option: "ark:h-6 ark:w-6", mark: "12" },
      sm: { option: "ark:h-7 ark:w-7", mark: "14" },
      md: { option: "ark:h-8 ark:w-8", mark: "16" },
      lg: { option: "ark:h-10 ark:w-10", mark: "20" },
      xl: { option: "ark:h-12 ark:w-12", mark: "24" }
    };
    return sizes[size] ?? sizes.md;
  }

  // Recria as opções só quando a lista oferecida muda (atributo `shapes`); cada botão sabe a própria forma.
  private syncOptions(): void {
    const shapes = this.shapes;
    if (shapes.join(",") === this.offered.join(",")) return;
    for (const option of this.options) option.remove();
    this.offered = shapes;
    this.options = shapes.map((shape) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "radio");
      button.dataset.value = shape;
      const mark = document.createElement("ark-mark") as ArkMark;
      mark.setAttribute("shape", shape);
      button.appendChild(mark);
      button.addEventListener("click", () => this.select(shape));
      this.appendChild(button);
      return button;
    });
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
    const locale = this.getLocale();
    const value = this.value;
    const disabled = this.disabled;
    const sizing = this.getSizing();
    const color = this.getAttribute("color")?.trim() || "";

    this.syncOptions();
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
      ["ark:inline-flex ark:flex-wrap ark:items-center ark:gap-1", disabled ? "ark:opacity-50" : ""]
        .join(" ")
        .split(" ")
        .filter(Boolean)
    );

    const selectedIndex = value ? this.offered.indexOf(value) : -1;
    const stop = selectedIndex >= 0 ? selectedIndex : 0;
    this.options.forEach((option, index) => {
      const shape = this.offered[index];
      const selected = index === selectedIndex;
      option.setAttribute("aria-label", String(locale[SHAPE_LABEL[shape]]));
      option.setAttribute("aria-checked", selected ? "true" : "false");
      option.tabIndex = index === stop ? 0 : -1;
      option.disabled = disabled;
      option.className = [
        "ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-md ark:border ark:outline-none ark:transition-colors ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out) ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring ark:disabled:cursor-not-allowed",
        sizing.option,
        selected ? "ark:border-border-strong ark:bg-surface-muted" : "ark:border-transparent ark:hover:bg-surface-muted"
      ].join(" ");
      const mark = option.firstElementChild as ArkMark | null;
      if (mark) {
        mark.setAttribute("size", sizing.mark);
        if (color) {
          mark.setAttribute("color", color);
        } else {
          mark.removeAttribute("color");
        }
      }
      applyTestHooks(this, "shape-picker", option, "option");
    });

    applyTestHooks(this, "shape-picker", this);
  }
}

export default ArkShapePicker;
