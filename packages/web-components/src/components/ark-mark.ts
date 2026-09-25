import type { ArkMarkShape } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/** Um path por forma, no viewBox 0 0 24 24; o ark-shape-picker desenha as mesmas. */
export const ARK_MARK_PATHS: Record<ArkMarkShape, string> = {
  circle: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20Z",
  square: "M3 3h18v18H3Z",
  triangle: "M12 2 22 21H2Z",
  diamond: "M12 1 23 12 12 23 1 12Z",
  star: "M12 1.5 15.2 8.6 23 9.6l-5.7 5.3 1.5 7.6L12 18.8 5.2 22.5l1.5-7.6L1 9.6l7.8-1Z",
  hexagon: "M7 2h10l5 10-5 10H7L2 12Z"
};

/** As seis formas, na ordem em que o ark-shape-picker as oferece. */
export const ARK_MARK_SHAPES: ArkMarkShape[] = ["circle", "square", "triangle", "diamond", "star", "hexagon"];

/** Normaliza o valor de `shape`; inválido cai em "circle". */
export function normalizeMarkShape(value: string | null | undefined): ArkMarkShape {
  const shape = (value || "").toLowerCase() as ArkMarkShape;
  return ARK_MARK_SHAPES.includes(shape) ? shape : "circle";
}

/** Medida vinda de atributo: número sem unidade vira px; vazio vira null. */
function cssLength(value: string | null): string | null {
  const trimmed = (value || "").trim();
  if (!trimmed) return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

/**
 * Marca de escopo: cor E forma, porque cor sozinha não distingue. O PRÓPRIO
 * host é a marca, com um SVG próprio (um path por forma) desenhado em `color`
 * (padrão currentColor) no lado `size`. Com `label` vira `role="img"`
 * nomeado; sem ele é decorativo (`aria-hidden`): o texto ao lado é o que
 * conta.
 */
export class ArkMark extends HTMLElementBase {
  static readonly tagName = "ark-mark";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private svgEl: SVGSVGElement | null = null;
  private pathEl: SVGPathElement | null = null;

  static get observedAttributes(): string[] {
    return ["shape", "color", "size", "label", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    if (!this.svgEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.svgEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** Forma desenhada. Padrão: "circle". */
  get shape(): ArkMarkShape {
    return normalizeMarkShape(this.getAttribute("shape"));
  }

  set shape(value: ArkMarkShape) {
    this.setAttribute("shape", value);
  }

  private render(): void {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    this.appendChild(svg);
    this.svgEl = svg;
    this.pathEl = path;
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
    if (!this.svgEl || !this.pathEl) return;

    this.pathEl.setAttribute("d", ARK_MARK_PATHS[this.shape]);
    const size = cssLength(this.getAttribute("size")) ?? "16px";
    this.svgEl.style.width = size;
    this.svgEl.style.height = size;
    this.style.color = this.getAttribute("color")?.trim() || "";

    this.applyOwnClasses([
      "ark:inline-flex",
      "ark:shrink-0",
      "ark:items-center",
      "ark:justify-center",
      "ark:align-middle"
    ]);

    const label = this.getAttribute("label");
    if (label) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }

    applyTestHooks(this, "mark", this);
  }
}

export default ArkMark;
