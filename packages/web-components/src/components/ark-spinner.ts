import { type ArkIntent, type ArkLocale, type ArkSize, resolveLocale } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/** Mesmo SVG do ark-button: gira pelo preset `.ark-animate-spin` do core, isento de movimento reduzido. */
const SPINNER_SVG = `
  <svg class="ark:h-full ark:w-full ark-animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle class="ark:opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="ark:opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
  </svg>`;

/**
 * Indicador de carregamento solto: o PRÓPRIO host é o `role="status"`, com o
 * mesmo SVG do ark-button girando pelo preset `.ark-animate-spin` (o único
 * spinner da lib) e um rótulo só para leitores de tela (`label`, padrão a
 * string `loading` do idioma). Gira sempre, inclusive sob movimento reduzido:
 * é o único sinal de progresso. Sem `intent` herda a cor do texto ao redor.
 */
export class ArkSpinner extends HTMLElement {
  static readonly tagName = "ark-spinner";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private iconEl: HTMLSpanElement | null = null;
  private labelEl: HTMLSpanElement | null = null;

  static get observedAttributes(): string[] {
    return ["size", "intent", "label", "lang", "locale-json", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    if (!this.iconEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.iconEl || !this.isConnected) return;
    this.updateAppearance();
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getSizeClass(): string {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const sizes: Record<ArkSize, string> = {
      xs: "ark:h-3 ark:w-3",
      sm: "ark:h-4 ark:w-4",
      md: "ark:h-5 ark:w-5",
      lg: "ark:h-6 ark:w-6",
      xl: "ark:h-8 ark:w-8"
    };
    return sizes[size] ?? sizes.md;
  }

  // Sem intent a cor é a do texto ao redor (currentColor), para o spinner caber em qualquer contexto.
  private getColorClass(): string {
    const intent = (this.getAttribute("intent") || "").toLowerCase() as ArkIntent;
    const colors: Record<ArkIntent, string> = {
      primary: "ark:text-primary",
      secondary: "ark:text-secondary",
      success: "ark:text-success",
      warning: "ark:text-warning",
      danger: "ark:text-danger",
      info: "ark:text-info",
      neutral: "ark:text-neutral"
    };
    return colors[intent] ?? "";
  }

  private render(): void {
    const icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = SPINNER_SVG;
    const label = document.createElement("span");
    this.append(icon, label);
    this.iconEl = icon;
    this.labelEl = label;
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
    if (!this.iconEl || !this.labelEl) return;

    this.setAttribute("role", "status");
    this.applyOwnClasses(
      ["ark:inline-flex", "ark:items-center", "ark:justify-center", "ark:align-middle", this.getColorClass()].filter(
        Boolean
      )
    );

    this.iconEl.className = ["ark:inline-flex ark:shrink-0", this.getSizeClass()].join(" ");
    // O texto oculto é o conteúdo da live region; o aria-label dá nome ao host (status não nomeia pelo conteúdo).
    const label = this.getAttribute("label") || this.getLocale().loading;
    this.labelEl.className = "ark:sr-only";
    this.labelEl.textContent = label;
    this.setAttribute("aria-label", label);

    applyTestHooks(this, "spinner", this);
    applyTestHooks(this, "spinner", this.iconEl, "icon");
    applyTestHooks(this, "spinner", this.labelEl, "label");
  }
}

export default ArkSpinner;
