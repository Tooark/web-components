import "../styles/tailwind.css";
import type { ArkButtonType, ArkSize, ArkStyleVariant, ArkIntent, ArkThemeSelected } from "@tooark/core";

type ArkButtonPalette = {
  focusRing: string;
  solid: string;
  outline: string;
  ghost: string;
};

export class ArkButton extends HTMLElement {
  static readonly tagName = "ark-button";

  private buttonEl: HTMLButtonElement | null = null;

  static get observedAttributes(): string[] {
    return ["disabled", "type", "variant", "size", "intent", "theme", "color", "text-color", "class"];
  }

  connectedCallback(): void {
    if (!this.buttonEl) {
      this.render();
    }

    this.syncDisabled();
    this.syncType();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "disabled") {
      this.syncDisabled();
      return;
    }

    if (name === "type") {
      this.syncType();
      return;
    }

    if (name === "variant" || name === "size" || name === "intent" || name === "theme" || name === "color" || name === "text-color" || name === "class") {
      this.updateAppearance();
    }
  }

  private getTheme(): ArkThemeSelected {
    const theme = (this.getAttribute("theme") || "auto").toLowerCase();
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  private normalizeIntent(value: string | null): ArkIntent {
    const intent = (value || "").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
      return intent;
    }
    return "primary";
  }

  private resolveVariantAndIntent(): { styleVariant: ArkStyleVariant; intent: ArkIntent } {
    const variant = (this.getAttribute("variant") || "primary").toLowerCase();
    const attrIntent = this.getAttribute("intent");

    if (variant === "outline" || variant === "ghost" || variant === "solid") {
      return {
        styleVariant: variant,
        intent: this.normalizeIntent(attrIntent)
      };
    }

    if (variant === "primary" || variant === "secondary" || variant === "success" || variant === "warning" || variant === "danger" || variant === "info") {
      return {
        styleVariant: "solid",
        intent: this.normalizeIntent(attrIntent || variant)
      };
    }

    return {
      styleVariant: "solid",
      intent: this.normalizeIntent(attrIntent)
    };
  }

  private getPalette(theme: ArkThemeSelected, intent: ArkIntent): ArkButtonPalette {
    const light: Record<ArkIntent, ArkButtonPalette> = {
      primary: {
        focusRing: "focus:ring-slate-400",
        solid: "bg-slate-900 text-white border-transparent hover:bg-slate-800",
        outline: "bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-900 border-transparent hover:bg-slate-50"
      },
      secondary: {
        focusRing: "focus:ring-slate-400",
        solid: "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
        outline: "bg-transparent text-slate-900 border-slate-300 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-700 border-transparent hover:bg-slate-50"
      },
      success: {
        focusRing: "focus:ring-emerald-400",
        solid: "bg-emerald-600 text-white border-transparent hover:bg-emerald-500",
        outline: "bg-transparent text-emerald-700 border-emerald-300 hover:bg-emerald-50",
        ghost: "bg-transparent text-emerald-700 border-transparent hover:bg-emerald-50"
      },
      warning: {
        focusRing: "focus:ring-amber-400",
        solid: "bg-amber-500 text-slate-900 border-transparent hover:bg-amber-400",
        outline: "bg-transparent text-amber-700 border-amber-300 hover:bg-amber-50",
        ghost: "bg-transparent text-amber-700 border-transparent hover:bg-amber-50"
      },
      danger: {
        focusRing: "focus:ring-red-400",
        solid: "bg-red-600 text-white border-transparent hover:bg-red-500",
        outline: "bg-transparent text-red-700 border-red-300 hover:bg-red-50",
        ghost: "bg-transparent text-red-700 border-transparent hover:bg-red-50"
      },
      info: {
        focusRing: "focus:ring-sky-400",
        solid: "bg-sky-600 text-white border-transparent hover:bg-sky-500",
        outline: "bg-transparent text-sky-700 border-sky-300 hover:bg-sky-50",
        ghost: "bg-transparent text-sky-700 border-transparent hover:bg-sky-50"
      },
      neutral: {
        focusRing: "focus:ring-zinc-400",
        solid: "bg-zinc-700 text-white border-transparent hover:bg-zinc-600",
        outline: "bg-transparent text-zinc-700 border-zinc-300 hover:bg-zinc-50",
        ghost: "bg-transparent text-zinc-700 border-transparent hover:bg-zinc-50"
      }
    };

    const dark: Record<ArkIntent, ArkButtonPalette> = {
      primary: {
        focusRing: "focus:ring-slate-500",
        solid: "bg-slate-100 text-slate-900 border-transparent hover:bg-white",
        outline: "bg-transparent text-slate-100 border-slate-600 hover:bg-slate-800",
        ghost: "bg-transparent text-slate-100 border-transparent hover:bg-slate-800"
      },
      secondary: {
        focusRing: "focus:ring-slate-500",
        solid: "bg-slate-800 text-slate-100 border-slate-600 hover:bg-slate-700",
        outline: "bg-transparent text-slate-100 border-slate-600 hover:bg-slate-800",
        ghost: "bg-transparent text-slate-200 border-transparent hover:bg-slate-800"
      },
      success: {
        focusRing: "focus:ring-emerald-500",
        solid: "bg-emerald-500 text-slate-950 border-transparent hover:bg-emerald-400",
        outline: "bg-transparent text-emerald-300 border-emerald-600 hover:bg-emerald-950/40",
        ghost: "bg-transparent text-emerald-300 border-transparent hover:bg-emerald-950/40"
      },
      warning: {
        focusRing: "focus:ring-amber-500",
        solid: "bg-amber-400 text-slate-950 border-transparent hover:bg-amber-300",
        outline: "bg-transparent text-amber-300 border-amber-600 hover:bg-amber-950/40",
        ghost: "bg-transparent text-amber-300 border-transparent hover:bg-amber-950/40"
      },
      danger: {
        focusRing: "focus:ring-red-500",
        solid: "bg-red-500 text-white border-transparent hover:bg-red-400",
        outline: "bg-transparent text-red-300 border-red-600 hover:bg-red-950/40",
        ghost: "bg-transparent text-red-300 border-transparent hover:bg-red-950/40"
      },
      info: {
        focusRing: "focus:ring-sky-500",
        solid: "bg-sky-500 text-slate-950 border-transparent hover:bg-sky-400",
        outline: "bg-transparent text-sky-300 border-sky-600 hover:bg-sky-950/40",
        ghost: "bg-transparent text-sky-300 border-transparent hover:bg-sky-950/40"
      },
      neutral: {
        focusRing: "focus:ring-zinc-500",
        solid: "bg-zinc-200 text-zinc-900 border-transparent hover:bg-zinc-100",
        outline: "bg-transparent text-zinc-200 border-zinc-600 hover:bg-zinc-800",
        ghost: "bg-transparent text-zinc-200 border-transparent hover:bg-zinc-800"
      }
    };

    return (theme === "dark" ? dark : light)[intent];
  }

  private syncDisabled(): void {
    if (!this.buttonEl) return;
    this.buttonEl.disabled = this.hasAttribute("disabled");
  }

  private syncType(): void {
    if (!this.buttonEl) return;
    const type = (this.getAttribute("type") || "button") as ArkButtonType;
    this.buttonEl.type = type === "submit" || type === "reset" ? type : "button";
  }

  private computeClasses(): string {
    const base = "inline-flex items-center justify-center rounded-md border font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50";
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const theme = this.getTheme();
    const { styleVariant, intent } = this.resolveVariantAndIntent();
    const palette = this.getPalette(theme, intent);

    const variantClasses: Record<ArkStyleVariant, string> = {
      solid: palette.solid,
      outline: palette.outline,
      ghost: palette.ghost
    };

    const sizes: Record<ArkSize, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-4 text-lg"
    };

    const custom = this.getAttribute("class") || "";

    return [base, palette.focusRing, variantClasses[styleVariant], sizes[size] ?? sizes.md, custom]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private applyCustomColors(): void {
    if (!this.buttonEl) return;

    this.buttonEl.style.backgroundColor = "";
    this.buttonEl.style.borderColor = "";
    this.buttonEl.style.color = "";

    const color = this.getAttribute("color")?.trim();
    if (!color) return;

    const textColor = this.getAttribute("text-color")?.trim();
    const { styleVariant } = this.resolveVariantAndIntent();

    if (styleVariant === "solid") {
      this.buttonEl.style.backgroundColor = color;
      this.buttonEl.style.borderColor = color;
      this.buttonEl.style.color = textColor || "#ffffff";
      return;
    }

    this.buttonEl.style.borderColor = color;
    this.buttonEl.style.color = textColor || color;
  }

  private render(): void {
    const button = document.createElement("button");
    button.setAttribute("part", "button");
    button.className = this.computeClasses();

    while (this.firstChild) {
      button.appendChild(this.firstChild);
    }

    this.appendChild(button);
    this.buttonEl = button;
  }

  private updateAppearance(): void {
    if (!this.buttonEl) return;
    this.buttonEl.className = this.computeClasses();
    this.applyCustomColors();
  }
}

export default ArkButton;
