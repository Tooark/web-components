import type { ArkIntent, ArkSize } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { applyTestHooks } from "./test-hooks";

/**
 * Ponto de status: o PRÓPRIO host é o círculo na cor do intent (padrão
 * neutral). Com `label` vira `role="img"` nomeado; sem ele é decorativo
 * (`aria-hidden`), para o texto ao lado ser o que conta. Estático por
 * design: nunca pulsa.
 */
export class ArkStatusDot extends HTMLElementBase {
  static readonly tagName = "ark-status-dot";

  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["intent", "label", "size", "theme", "class", "testid"];
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

  private getSizeClass(): string {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, string> = {
      xs: "ark:h-1.5 ark:w-1.5",
      sm: "ark:h-2 ark:w-2",
      md: "ark:h-2.5 ark:w-2.5",
      lg: "ark:h-3 ark:w-3",
      xl: "ark:h-4 ark:w-4"
    };
    return sizes[size] ?? sizes.md;
  }

  private getColorClass(intent: ArkIntent): string {
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
    const intent = normalizeIntent(this.getAttribute("intent"), "neutral");
    this.applyOwnClasses(
      [
        "ark:inline-block ark:shrink-0 ark:rounded-full ark:align-middle",
        this.getSizeClass(),
        this.getColorClass(intent)
      ]
        .join(" ")
        .split(" ")
    );

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

    applyTestHooks(this, "status-dot", this);
  }
}

export default ArkStatusDot;
