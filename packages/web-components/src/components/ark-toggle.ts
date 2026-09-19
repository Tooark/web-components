import { type ArkIntent, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkTogglePalette = {
  focusRing: string;
  base: string;
  pressed: string;
};

/**
 * Botão de estado pressionado (`aria-pressed`). O PRÓPRIO host é o controle
 * (classes, role, foco, teclado): os filhos do usuário ficam onde estão.
 * Dentro de um ark-toggle-group vira item de segmented control.
 */
export class ArkToggle extends HTMLElement {
  static readonly tagName = "ark-toggle";

  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["pressed", "disabled", "size", "intent", "theme", "value", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("keyup", this.handleKeyup);
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

  get pressed(): boolean {
    return this.hasAttribute("pressed");
  }

  set pressed(value: boolean | string | null | undefined) {
    this.toggleAttribute("pressed", coerceBooleanAttr(value));
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  toggle(): void {
    if (this.disabled) return;

    this.pressed = !this.pressed;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { pressed: this.pressed, value: this.value },
        bubbles: true,
        composed: true
      })
    );
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.toggle();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.target !== this || this.disabled) return;
    if (event.key === "Enter") {
      event.preventDefault();
      this.toggle();
    } else if (event.key === " ") {
      event.preventDefault();
    }
  };

  private readonly handleKeyup = (event: KeyboardEvent): void => {
    if (event.target !== this || this.disabled) return;
    if (event.key === " ") {
      event.preventDefault();
      this.toggle();
    }
  };

  private isInGroup(): boolean {
    return this.closest("ark-toggle-group") !== null;
  }

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "").toLowerCase();
    if (
      intent === "primary" ||
      intent === "secondary" ||
      intent === "success" ||
      intent === "warning" ||
      intent === "danger" ||
      intent === "info" ||
      intent === "neutral"
    ) {
      return intent;
    }
    return "primary";
  }

  private getPalette(intent: ArkIntent): ArkTogglePalette {
    // Dentro de um ark-toggle-group o visual é de segmented control:
    // fundo transparente e o item ativo "elevado" na superfície.
    if (this.isInGroup()) {
      return {
        focusRing: "ark:ring-ring",
        base: "ark:border-transparent ark:bg-transparent ark:text-fg-muted ark:hover:text-fg",
        pressed: "ark:border-transparent ark:bg-surface-raised ark:text-fg ark:shadow-sm"
      };
    }

    const base = "ark:border-border-strong ark:bg-transparent ark:text-fg-soft ark:hover:bg-surface-muted";
    const palettes: Record<ArkIntent, ArkTogglePalette> = {
      primary: {
        focusRing: "ark:ring-primary-ring",
        base,
        pressed: "ark:border-border-strong ark:bg-surface-strong ark:text-fg"
      },
      secondary: {
        focusRing: "ark:ring-secondary-ring",
        base,
        pressed: "ark:border-border-strong ark:bg-surface-muted ark:text-fg-soft"
      },
      success: {
        focusRing: "ark:ring-success-ring",
        base,
        pressed: "ark:border-success-border ark:bg-success-soft ark:text-success-soft-fg"
      },
      warning: {
        focusRing: "ark:ring-warning-ring",
        base,
        pressed: "ark:border-warning-border ark:bg-warning-soft ark:text-warning-soft-fg"
      },
      danger: {
        focusRing: "ark:ring-danger-ring",
        base,
        pressed: "ark:border-danger-border ark:bg-danger-soft ark:text-danger-soft-fg"
      },
      info: {
        focusRing: "ark:ring-info-ring",
        base,
        pressed: "ark:border-info-border ark:bg-info-soft ark:text-info-soft-fg"
      },
      neutral: {
        focusRing: "ark:ring-neutral-ring",
        base,
        pressed: "ark:border-neutral-border ark:bg-neutral-soft ark:text-neutral-soft-fg"
      }
    };

    return palettes[intent];
  }

  private computeClasses(): string[] {
    const base =
      "ark:inline-flex ark:items-center ark:justify-center ark:gap-2 ark:rounded-md ark:border ark:font-semibold ark:transition ark:select-none ark:cursor-pointer ark:outline-none ark:focus-visible:ring-2 ark:aria-disabled:cursor-not-allowed ark:aria-disabled:opacity-50 ark:aria-disabled:pointer-events-none";
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const palette = this.getPalette(this.getIntent());

    // Mesma regra do ark-button: altura pelo token --ark-size-* (min-height).
    const sizes: Record<ArkSize, string> = {
      xs: "ark:min-h-(--ark-size-xs) ark:px-2 ark:py-0.5 ark:text-xs",
      sm: "ark:min-h-(--ark-size-sm) ark:px-3 ark:py-1 ark:text-xs",
      md: "ark:min-h-(--ark-size-md) ark:px-4 ark:py-1.5 ark:text-sm",
      lg: "ark:min-h-(--ark-size-lg) ark:px-5 ark:py-2 ark:text-base",
      xl: "ark:min-h-(--ark-size-xl) ark:px-6 ark:py-2.5 ark:text-lg"
    };

    return [base, palette.focusRing, this.pressed ? palette.pressed : palette.base, sizes[size] ?? sizes.md]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean);
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
    const disabled = this.disabled;
    this.setAttribute("role", "button");
    this.setAttribute("aria-pressed", this.pressed ? "true" : "false");
    this.setAttribute("tabindex", disabled ? "-1" : "0");
    if (disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
    this.applyOwnClasses(this.computeClasses());
    applyTestHooks(this, "toggle", this);
  }
}

export default ArkToggle;
