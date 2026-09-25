import type { ArkSize } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/**
 * Tecla de atalho: o PRÓPRIO host é a tecla (mono, borda, fundo
 * surface-muted, aresta inferior), com o texto da tecla como filho do
 * usuário. Não é interativo e não tem role próprio; para leitores de tela é
 * texto comum, como um <kbd>.
 */
export class ArkKbd extends HTMLElementBase {
  static readonly tagName = "ark-kbd";

  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["size", "theme", "class", "testid"];
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
      xs: "ark:min-h-4 ark:min-w-4 ark:px-1 ark:text-2xs",
      sm: "ark:min-h-5 ark:min-w-5 ark:px-1 ark:text-xs",
      md: "ark:min-h-6 ark:min-w-6 ark:px-1.5 ark:text-xs",
      lg: "ark:min-h-7 ark:min-w-7 ark:px-2 ark:text-sm",
      xl: "ark:min-h-8 ark:min-w-8 ark:px-2 ark:text-base"
    };
    return sizes[size] ?? sizes.md;
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
    this.applyOwnClasses(
      [
        "ark:inline-flex ark:items-center ark:justify-center ark:rounded-md ark:border ark:border-border-strong ark:bg-surface-muted ark:font-mono ark:font-medium ark:leading-none ark:text-fg-soft ark:whitespace-nowrap ark:align-middle ark:shadow-[inset_0_-1px_0_var(--ark-color-border-strong)]",
        this.getSizeClass()
      ]
        .join(" ")
        .split(" ")
    );
    applyTestHooks(this, "kbd", this);
  }
}

export default ArkKbd;
