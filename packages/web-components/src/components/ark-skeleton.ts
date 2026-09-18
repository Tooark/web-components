import type { ArkRounded } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/**
 * Raio por token para o `rounded`: inline, porque `.ark-skeleton` (motion.css, sem layer) fixa o raio padrão e
 * venceria uma utility `ark:rounded-*`.
 */
const RADIUS: Record<ArkRounded, string> = {
  none: "0",
  xs: "var(--ark-radius-xs, 0.125rem)",
  sm: "var(--ark-radius-sm, 0.25rem)",
  md: "var(--ark-radius-md, 0.375rem)",
  lg: "var(--ark-radius-lg, 0.5rem)",
  xl: "var(--ark-radius-xl, 0.75rem)",
  full: "9999px"
};

/**
 * Placeholder de carregamento. O PRÓPRIO host é o bloco (`.ark-skeleton` de
 * core: fundo muted suave e raio), `aria-hidden` porque não há nada para ler.
 * Largura e altura vêm de `class` ou `style` do usuário (padrão 1rem de
 * altura; `ratio` dá a altura pela largura, para imagem e avatar; `color`
 * troca o tint base). `rows` acima de 1 troca o bloco por N barras próprias
 * em coluna, a última mais curta. `animated` liga o brilho que varre
 * (`.ark-skeleton-animated`), com fase sorteada por elemento e escalonada
 * entre as barras, opt-in e parado sob movimento reduzido; o conteúdo que
 * substitui o skeleton
 * entra com `.ark-animate-fade-in`, sem elemento próprio para isso.
 */
export class ArkSkeleton extends HTMLElement {
  static readonly tagName = "ark-skeleton";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private rowEls: HTMLDivElement[] = [];
  /** Fase do brilho deste elemento, sorteada uma vez: skeletons vizinhos não varrem em sincronia. */
  private readonly phase = Math.random();

  static get observedAttributes(): string[] {
    return ["rows", "animated", "rounded", "color", "ratio", "theme", "class", "testid"];
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

  /** Número de barras; 1 (padrão) é o bloco único. */
  get rows(): number {
    const parsed = Number.parseInt(this.getAttribute("rows") || "1", 10);
    return Number.isFinite(parsed) && parsed > 1 ? parsed : 1;
  }

  set rows(value: number) {
    if (value > 1) {
      this.setAttribute("rows", String(Math.floor(value)));
    } else {
      this.removeAttribute("rows");
    }
  }

  get animated(): boolean {
    return this.hasAttribute("animated");
  }

  set animated(value: boolean) {
    this.toggleAttribute("animated", Boolean(value));
  }

  private getRadius(): string | null {
    const rounded = (this.getAttribute("rounded") || "").toLowerCase() as ArkRounded;
    return RADIUS[rounded] ?? null;
  }

  /** `ratio` como valor de aspect-ratio: "16/9", "16:9" ou um número; inválido vira null. */
  private getRatio(): string | null {
    const raw = (this.getAttribute("ratio") || "").trim();
    if (!raw) return null;
    const match = /^(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)$/.exec(raw);
    if (match) {
      const width = Number(match[1]);
      const height = Number(match[2]);
      return width > 0 && height > 0 ? `${width} / ${height}` : null;
    }
    const single = Number(raw);
    return Number.isFinite(single) && single > 0 ? String(single) : null;
  }

  private skeletonClasses(): string[] {
    return this.animated ? ["ark-skeleton", "ark-skeleton-animated"] : ["ark-skeleton"];
  }

  /** Atraso negativo que desloca a fase do brilho; as barras seguem a razão áurea a partir da fase do host. */
  private shimmerDelay(index: number): string {
    if (!this.animated) return "";
    const phase = (this.phase + index * 0.618) % 1;
    return `calc(var(--ark-skeleton-duration, 1.6s) * -${phase.toFixed(3)})`;
  }

  // Barras próprias quando rows > 1: nós do componente, a última com 60% da largura.
  private syncRows(rows: number, radius: string | null): void {
    const count = rows > 1 ? rows : 0;
    while (this.rowEls.length > count) {
      this.rowEls.pop()?.remove();
    }
    while (this.rowEls.length < count) {
      const row = document.createElement("div");
      row.setAttribute("data-ark-chrome", "row");
      this.appendChild(row);
      this.rowEls.push(row);
    }

    this.rowEls.forEach((row, index) => {
      const last = index === count - 1;
      row.className = [...this.skeletonClasses(), "ark:h-3", last ? "ark:w-3/5" : "ark:w-full"].join(" ");
      row.style.borderRadius = radius ?? "";
      row.style.animationDelay = this.shimmerDelay(index);
      applyTestHooks(this, "skeleton", row, "row");
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
    this.setAttribute("aria-hidden", "true");
    const rows = this.rows;
    const radius = this.getRadius();

    // Tint próprio: custom property inline no host, herdada pelas barras e lida pelo .ark-skeleton.
    const color = (this.getAttribute("color") || "").trim();
    if (color) {
      this.style.setProperty("--ark-skeleton-color", color);
    } else {
      this.style.removeProperty("--ark-skeleton-color");
    }

    // Proporção só no bloco único: aspect-ratio inline e a altura padrão sai (data-ark-ratio no CSS).
    const ratio = rows > 1 ? null : this.getRatio();
    this.style.aspectRatio = ratio ?? "";
    this.toggleAttribute("data-ark-ratio", ratio !== null);

    if (rows > 1) {
      this.setAttribute("data-ark-rows", String(rows));
      this.style.borderRadius = "";
      this.style.animationDelay = "";
      this.applyOwnClasses(["ark:flex", "ark:flex-col", "ark:gap-2"]);
    } else {
      this.removeAttribute("data-ark-rows");
      this.style.borderRadius = radius ?? "";
      this.style.animationDelay = this.shimmerDelay(0);
      this.applyOwnClasses(["ark:block", ...this.skeletonClasses()]);
    }
    this.syncRows(rows, radius);

    applyTestHooks(this, "skeleton", this);
  }
}

export default ArkSkeleton;
