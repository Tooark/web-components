import "../styles/tailwind.css";
import type { ArkSize, ArkIntent, ArkThemeSelected } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkTogglePalette = {
  focusRing: string;
  base: string;
  pressed: string;
};

export class ArkToggle extends HTMLElement {
  static readonly tagName = "ark-toggle";

  private buttonEl: HTMLButtonElement | null = null;

  static get observedAttributes (): string[] {
    return ["pressed", "disabled", "size", "intent", "theme", "value", "class", "testid"];
  }

  connectedCallback (): void {
    if (!this.buttonEl) {
      this.render();
    }

    this.updateAppearance();
  }

  attributeChangedCallback (): void {
    if (!this.buttonEl) return;
    this.updateAppearance();
  }

  get pressed (): boolean {
    return this.hasAttribute("pressed");
  }

  set pressed (value: boolean) {
    if (value) {
      this.setAttribute("pressed", "");
    } else {
      this.removeAttribute("pressed");
    }
  }

  get value (): string {
    return this.getAttribute("value") || "";
  }

  toggle (): void {
    if (this.hasAttribute("disabled")) return;

    this.pressed = !this.pressed;
    this.dispatchEvent(new CustomEvent("change", {
      detail: { pressed: this.pressed, value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  private isInGroup (): boolean {
    return this.closest("ark-toggle-group") !== null;
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

  private getIntent (): ArkIntent {
    const intent = (this.getAttribute("intent") || "").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
      return intent;
    }
    return "primary";
  }

  private getPalette (theme: ArkThemeSelected, intent: ArkIntent): ArkTogglePalette {
    // Dentro de um ark-toggle-group o visual é de segmented control:
    // fundo transparente e o item ativo "elevado" em branco.
    if (this.isInGroup()) {
      if (theme === "dark") {
        return {
          focusRing: "focus-visible:ring-slate-500",
          base: "border-transparent bg-transparent text-slate-300 hover:text-slate-100",
          pressed: "border-transparent bg-slate-700 text-white shadow-sm"
        };
      }
      return {
        focusRing: "focus-visible:ring-slate-400",
        base: "border-transparent bg-transparent text-slate-600 hover:text-slate-900",
        pressed: "border-transparent bg-white text-slate-900 shadow-sm"
      };
    }

    const light: Record<ArkIntent, ArkTogglePalette> = {
      primary: { focusRing: "focus-visible:ring-slate-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-slate-300 bg-slate-200 text-slate-900" },
      secondary: { focusRing: "focus-visible:ring-slate-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-slate-300 bg-slate-100 text-slate-700" },
      success: { focusRing: "focus-visible:ring-emerald-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-emerald-300 bg-emerald-50 text-emerald-700" },
      warning: { focusRing: "focus-visible:ring-amber-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-amber-300 bg-amber-50 text-amber-700" },
      danger: { focusRing: "focus-visible:ring-red-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-red-300 bg-red-50 text-red-700" },
      info: { focusRing: "focus-visible:ring-sky-400", base: "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-50", pressed: "border-sky-300 bg-sky-50 text-sky-700" },
      neutral: { focusRing: "focus-visible:ring-zinc-400", base: "border-zinc-300 bg-transparent text-zinc-600 hover:bg-zinc-50", pressed: "border-zinc-300 bg-zinc-200 text-zinc-900" }
    };

    const dark: Record<ArkIntent, ArkTogglePalette> = {
      primary: { focusRing: "focus-visible:ring-slate-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-slate-600 bg-slate-700 text-slate-100" },
      secondary: { focusRing: "focus-visible:ring-slate-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-slate-600 bg-slate-800 text-slate-200" },
      success: { focusRing: "focus-visible:ring-emerald-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-emerald-600 bg-emerald-950/40 text-emerald-300" },
      warning: { focusRing: "focus-visible:ring-amber-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-amber-600 bg-amber-950/40 text-amber-300" },
      danger: { focusRing: "focus-visible:ring-red-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-red-600 bg-red-950/40 text-red-300" },
      info: { focusRing: "focus-visible:ring-sky-500", base: "border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800", pressed: "border-sky-600 bg-sky-950/40 text-sky-300" },
      neutral: { focusRing: "focus-visible:ring-zinc-500", base: "border-zinc-600 bg-transparent text-zinc-300 hover:bg-zinc-800", pressed: "border-zinc-600 bg-zinc-700 text-zinc-100" }
    };

    return (theme === "dark" ? dark : light)[intent];
  }

  private computeClasses (): string {
    const base = "inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;
    const palette = this.getPalette(this.getTheme(), this.getIntent());

    const sizes: Record<ArkSize, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-4 text-lg"
    };

    const custom = this.getAttribute("class") || "";

    return [base, palette.focusRing, this.pressed ? palette.pressed : palette.base, sizes[size] ?? sizes.md, custom]
      .join(" ")
      .trim()
      .replace(/\s+/g, " ");
  }

  private render (): void {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("part", "button");
    button.addEventListener("click", () => this.toggle());

    while (this.firstChild) {
      button.appendChild(this.firstChild);
    }

    this.appendChild(button);
    this.buttonEl = button;
  }

  private updateAppearance (): void {
    if (!this.buttonEl) return;
    this.buttonEl.className = this.computeClasses();
    this.buttonEl.setAttribute("aria-pressed", this.pressed ? "true" : "false");
    this.buttonEl.disabled = this.hasAttribute("disabled");
    applyTestHooks(this, "toggle", this.buttonEl);
  }
}

export default ArkToggle;
