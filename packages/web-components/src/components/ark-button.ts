import "../styles/tailwind.css";
import type { ArkButtonType, ArkRounded, ArkSize, ArkStyleVariant, ArkIntent, ArkThemeSelected } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkButtonPalette = {
  focusRing: string;
  solid: string;
  outline: string;
  ghost: string;
};

const SPINNER_SVG = "<svg class=\"h-[1em] w-[1em] animate-spin\" viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><circle class=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"4\"></circle><path class=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z\"></path></svg>";

export class ArkButton extends HTMLElement {
  static readonly tagName = "ark-button";

  private controlEl: HTMLButtonElement | HTMLAnchorElement | null = null;
  private spinnerEl: HTMLSpanElement | null = null;

  static get observedAttributes (): string[] {
    return ["disabled", "type", "variant", "size", "intent", "theme", "color", "text-color", "class", "rounded", "loading", "icon-only", "full-width", "href", "target", "testid"];
  }

  constructor () {
    super();
    // Um botão desabilitado não dispara click, mas o host ainda dispararia:
    // bloqueia na captura para listeners externos em <ark-button> não vazarem.
    this.addEventListener(
      "click",
      (event) => {
        if (this.hasAttribute("disabled") || this.hasAttribute("loading")) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      { capture: true }
    );
  }

  connectedCallback (): void {
    if (!this.controlEl) {
      this.render();
    }

    this.syncDisabled();
    this.syncType();
    this.updateAppearance();
  }

  attributeChangedCallback (name: string): void {
    if (!this.controlEl) return;

    if (name === "href" || name === "target") {
      this.syncControlTag();
      return;
    }

    if (name === "disabled" || name === "loading") {
      this.syncDisabled();
      this.updateAppearance();
      return;
    }

    if (name === "type") {
      this.syncType();
      return;
    }

    this.updateAppearance();
  }

  private getTheme (): ArkThemeSelected {
    const theme = (this.getAttribute("theme") || "auto").toLowerCase();
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  private normalizeIntent (value: string | null): ArkIntent {
    const intent = (value || "").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
      return intent;
    }
    return "primary";
  }

  private resolveVariantAndIntent (): { styleVariant: ArkStyleVariant; intent: ArkIntent } {
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

  private getPalette (theme: ArkThemeSelected, intent: ArkIntent): ArkButtonPalette {
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

  private isDisabled (): boolean {
    return this.hasAttribute("disabled") || this.hasAttribute("loading");
  }

  private syncDisabled (): void {
    if (!this.controlEl) return;

    const disabled = this.isDisabled();
    this.controlEl.setAttribute("aria-busy", this.hasAttribute("loading") ? "true" : "false");

    if (this.controlEl instanceof HTMLButtonElement) {
      this.controlEl.disabled = disabled;
      return;
    }

    // Âncora não tem "disabled": remove o href e sinaliza via aria.
    if (disabled) {
      this.controlEl.removeAttribute("href");
      this.controlEl.setAttribute("aria-disabled", "true");
      this.controlEl.setAttribute("tabindex", "-1");
    } else {
      this.controlEl.setAttribute("href", this.getAttribute("href") || "");
      this.controlEl.removeAttribute("aria-disabled");
      this.controlEl.removeAttribute("tabindex");
    }
  }

  private syncType (): void {
    if (!(this.controlEl instanceof HTMLButtonElement)) return;
    const type = (this.getAttribute("type") || "button") as ArkButtonType;
    this.controlEl.type = type === "submit" || type === "reset" ? type : "button";
  }

  private computeClasses (): string {
    const base = "inline-flex items-center justify-center gap-2 border font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";
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

    // Padding simétrico para botão só de ícone (quadrado; vira círculo com rounded="full").
    const iconOnlySizes: Record<ArkSize, string> = {
      sm: "p-1.5 text-xs",
      md: "p-2 text-sm",
      lg: "p-3 text-base",
      xl: "p-4 text-lg"
    };

    const roundedMap: Record<ArkRounded, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    };
    const rounded = (this.getAttribute("rounded") || "md").toLowerCase() as ArkRounded;

    const iconOnly = this.hasAttribute("icon-only");
    const sizeClasses = iconOnly ? iconOnlySizes[size] ?? iconOnlySizes.md : sizes[size] ?? sizes.md;
    const fullWidth = this.hasAttribute("full-width") ? "w-full" : "";

    const custom = this.getAttribute("class") || "";

    return [base, roundedMap[rounded] ?? roundedMap.md, palette.focusRing, variantClasses[styleVariant], sizeClasses, fullWidth, custom]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private applyCustomColors (): void {
    if (!this.controlEl) return;

    this.controlEl.style.backgroundColor = "";
    this.controlEl.style.borderColor = "";
    this.controlEl.style.color = "";

    const color = this.getAttribute("color")?.trim();
    if (!color) return;

    const textColor = this.getAttribute("text-color")?.trim();
    const { styleVariant } = this.resolveVariantAndIntent();

    if (styleVariant === "solid") {
      this.controlEl.style.backgroundColor = color;
      this.controlEl.style.borderColor = color;
      this.controlEl.style.color = textColor || "#ffffff";
      return;
    }

    this.controlEl.style.borderColor = color;
    this.controlEl.style.color = textColor || color;
  }

  private syncLoading (): void {
    if (!this.controlEl) return;

    const loading = this.hasAttribute("loading");

    if (loading && !this.spinnerEl) {
      const spinner = document.createElement("span");
      spinner.setAttribute("part", "spinner");
      spinner.setAttribute("aria-hidden", "true");
      spinner.className = "inline-flex items-center";
      spinner.innerHTML = SPINNER_SVG;
      this.controlEl.prepend(spinner);
      this.spinnerEl = spinner;
      return;
    }

    if (!loading && this.spinnerEl) {
      this.spinnerEl.remove();
      this.spinnerEl = null;
    }
  }

  private createControl (): HTMLButtonElement | HTMLAnchorElement {
    const href = this.getAttribute("href");

    if (href !== null) {
      const anchor = document.createElement("a");
      anchor.setAttribute("part", "button");
      anchor.setAttribute("role", "button");
      anchor.href = href;
      const target = this.getAttribute("target");
      if (target) {
        anchor.target = target;
        if (target === "_blank") {
          anchor.rel = "noopener noreferrer";
        }
      }
      return anchor;
    }

    const button = document.createElement("button");
    button.setAttribute("part", "button");
    return button;
  }

  private render (): void {
    const control = this.createControl();
    control.className = this.computeClasses();

    while (this.firstChild) {
      control.appendChild(this.firstChild);
    }

    this.appendChild(control);
    this.controlEl = control;
    this.updateAppearance();
  }

  // Troca <button> <-> <a> quando href entra/sai, preservando o conteúdo.
  private syncControlTag (): void {
    if (!this.controlEl) return;

    const wantsAnchor = this.getAttribute("href") !== null;
    const isAnchor = this.controlEl instanceof HTMLAnchorElement;

    if (wantsAnchor !== isAnchor) {
      if (this.spinnerEl) {
        this.spinnerEl.remove();
        this.spinnerEl = null;
      }

      const previous = this.controlEl;
      const next = this.createControl();
      while (previous.firstChild) {
        next.appendChild(previous.firstChild);
      }
      previous.remove();
      this.appendChild(next);
      this.controlEl = next;
      this.syncType();
    } else if (isAnchor) {
      const target = this.getAttribute("target");
      if (target) {
        this.controlEl.setAttribute("target", target);
        if (target === "_blank") {
          this.controlEl.setAttribute("rel", "noopener noreferrer");
        }
      } else {
        this.controlEl.removeAttribute("target");
        this.controlEl.removeAttribute("rel");
      }
    }

    this.syncDisabled();
    this.updateAppearance();
  }

  private updateAppearance (): void {
    if (!this.controlEl) return;
    this.controlEl.className = this.computeClasses();
    this.style.display = this.hasAttribute("full-width") ? "block" : "";
    this.applyCustomColors();
    this.syncLoading();

    applyTestHooks(this, "button", this.controlEl);
    if (this.spinnerEl) {
      applyTestHooks(this, "button", this.spinnerEl, "spinner");
    }
  }
}

export default ArkButton;
