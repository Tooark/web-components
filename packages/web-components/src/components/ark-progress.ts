import type { ArkIntent, ArkSize } from "@tooark/core";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

type ArkProgressSizing = {
  track: string;
  value: string;
};

/**
 * Barra de progresso: o PRÓPRIO host é o `role="progressbar"` (aria-valuenow,
 * min e max, nome por `label`), uma linha com o trilho, que cresce, e o
 * texto do valor (`show-value`). `value` de 0 a `max` (padrão 100) move a
 * largura da barra com os tokens default/out; `indeterminate` tira o
 * aria-valuenow e troca a barra por um segmento que percorre o trilho em
 * loop, com duração fixa e isento de movimento reduzido, como o spinner: é o
 * único sinal de progresso.
 */
export class ArkProgress extends HTMLElement {
  static readonly tagName = "ark-progress";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private trackEl: HTMLDivElement | null = null;
  private barEl: HTMLDivElement | null = null;
  private valueEl: HTMLSpanElement | null = null;

  static get observedAttributes(): string[] {
    return [
      "value",
      "max",
      "indeterminate",
      "label",
      "aria-label",
      "show-value",
      "size",
      "intent",
      "theme",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    if (!this.trackEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.trackEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** Valor atual, limitado a 0..max. Padrão: 0. */
  get value(): number {
    const raw = Number(this.getAttribute("value"));
    const max = this.max;
    if (!Number.isFinite(raw)) return 0;
    return Math.min(max, Math.max(0, raw));
  }

  set value(value: number) {
    this.setAttribute("value", String(value));
  }

  /** Valor máximo. Padrão: 100. */
  get max(): number {
    const raw = Number(this.getAttribute("max"));
    return Number.isFinite(raw) && raw > 0 ? raw : 100;
  }

  set max(value: number) {
    this.setAttribute("max", String(value));
  }

  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }

  set indeterminate(value: boolean | string | null | undefined) {
    this.toggleAttribute("indeterminate", ArkProgress.truthy(value));
  }

  get showValue(): boolean {
    return this.hasAttribute("show-value");
  }

  set showValue(value: boolean | string | null | undefined) {
    this.toggleAttribute("show-value", ArkProgress.truthy(value));
  }

  private static truthy(value: boolean | string | null | undefined): boolean {
    return value === "" || (value !== null && value !== undefined && value !== false && value !== "false");
  }

  private getSizing(): ArkProgressSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, ArkProgressSizing> = {
      xs: { track: "ark:h-1", value: "ark:text-xs" },
      sm: { track: "ark:h-1.5", value: "ark:text-xs" },
      md: { track: "ark:h-2", value: "ark:text-sm" },
      lg: { track: "ark:h-3", value: "ark:text-sm" },
      xl: { track: "ark:h-4", value: "ark:text-base" }
    };
    return sizes[size] ?? sizes.md;
  }

  private getBarColor(intent: ArkIntent): string {
    const colors: Record<ArkIntent, string> = {
      primary: "ark:bg-primary",
      secondary: "ark:bg-secondary",
      success: "ark:bg-success",
      warning: "ark:bg-warning",
      danger: "ark:bg-danger",
      info: "ark:bg-info",
      neutral: "ark:bg-neutral"
    };
    return colors[intent];
  }

  private render(): void {
    const track = document.createElement("div");
    track.setAttribute("aria-hidden", "true");
    const bar = document.createElement("div");
    track.appendChild(bar);
    const value = document.createElement("span");
    value.setAttribute("aria-hidden", "true");
    this.append(track, value);

    this.trackEl = track;
    this.barEl = bar;
    this.valueEl = value;
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
    if (!this.trackEl || !this.barEl || !this.valueEl) return;

    const intent = normalizeIntent(this.getAttribute("intent"), "primary");
    const sizing = this.getSizing();
    const indeterminate = this.indeterminate;
    const max = this.max;
    const value = this.value;
    const percent = (value / max) * 100;

    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(max));
    if (indeterminate) {
      this.removeAttribute("aria-valuenow");
    } else {
      this.setAttribute("aria-valuenow", String(value));
    }
    const label = this.getAttribute("label");
    if (label) {
      // Só quando muda: aria-label é observado e um set igual reentraria aqui.
      if (this.getAttribute("aria-label") !== label) this.setAttribute("aria-label", label);
    } else if (this.getAttribute("aria-label") === "") {
      this.removeAttribute("aria-label");
    }
    this.toggleAttribute("data-ark-indeterminate", indeterminate);

    this.applyOwnClasses(["ark:flex", "ark:w-full", "ark:items-center", "ark:gap-2"]);

    this.trackEl.className = [
      "ark:relative ark:min-w-0 ark:flex-1 ark:overflow-hidden ark:rounded-full ark:bg-muted",
      sizing.track
    ].join(" ");

    // Largura pela transição com os tokens; no indeterminado o segmento tem 40% e a animação vem do CSS.
    this.barEl.className = [
      "ark:h-full ark:rounded-full ark:transition-[width] ark:duration-(--ark-duration-default) ark:ease-(--ark-ease-out)",
      this.getBarColor(intent)
    ].join(" ");
    this.barEl.style.width = indeterminate ? "40%" : `${percent}%`;

    const showValue = this.showValue && !indeterminate;
    this.valueEl.hidden = !showValue;
    this.valueEl.textContent = showValue ? `${Math.round(percent)}%` : "";
    this.valueEl.className = [
      "ark:min-w-[4ch] ark:shrink-0 ark:text-end ark:tabular-nums ark:text-fg-muted",
      sizing.value
    ].join(" ");

    applyTestHooks(this, "progress", this);
    applyTestHooks(this, "progress", this.trackEl, "track");
    applyTestHooks(this, "progress", this.barEl, "bar");
    applyTestHooks(this, "progress", this.valueEl, "value");
  }
}

export default ArkProgress;
