import "../styles/tailwind.css";
import type { ArkIntent, ArkRounded, ArkSize, ArkThemeSelected } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

const INPUT_TYPES = ["text", "password", "email", "number", "tel", "url", "search"];

let arkInputIdCounter = 0;

/**
 * Campo de texto padronizado da família Ark. Serve tanto de componente público
 * quanto de base visual para orquestradores (ark-datepicker etc.), que colocam
 * seus botões na área de sufixo (`slot="suffix"`) e acessam o campo nativo via
 * `inputElement`/`focus()`.
 */
export class ArkInput extends HTMLElement {
  static readonly tagName = "ark-input";

  private inputEl: HTMLInputElement | null = null;
  private labelEl: HTMLLabelElement | null = null;
  private suffixEl: HTMLSpanElement | null = null;
  private messageEl: HTMLParagraphElement | null = null;

  static get observedAttributes (): string[] {
    return ["type", "label", "placeholder", "value", "name", "size", "intent", "theme", "rounded", "helper", "error", "error-message", "disabled", "required", "readonly", "testid"];
  }

  connectedCallback (): void {
    if (!this.inputEl) {
      this.render();
    }
    this.updateAppearance();
  }

  attributeChangedCallback (name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.inputEl) return;

    if (name === "value") {
      this.inputEl.value = newValue ?? "";
      return;
    }

    this.updateAppearance();
  }

  /** O <input> nativo interno, para composição por outros componentes. */
  get inputElement (): HTMLInputElement | null {
    return this.inputEl;
  }

  get value (): string {
    return this.inputEl?.value ?? this.getAttribute("value") ?? "";
  }

  set value (next: string) {
    if (this.inputEl) {
      this.inputEl.value = next;
    } else {
      this.setAttribute("value", next);
    }
  }

  focus (options?: FocusOptions): void {
    this.inputEl?.focus(options);
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

  private render (): void {
    const id = this.getAttribute("id") ? `${this.getAttribute("id")}-input` : `ark-input-${++arkInputIdCounter}`;

    const label = document.createElement("label");
    label.htmlFor = id;

    const wrapper = document.createElement("div");
    wrapper.className = "relative";

    const input = document.createElement("input");
    input.id = id;
    input.value = this.getAttribute("value") ?? "";

    const suffix = document.createElement("span");
    // Área de sufixo: recebe os filhos declarados com slot="suffix" (light DOM).
    const slotted = Array.from(this.children).filter((child) => child.getAttribute("slot") === "suffix");
    for (const child of slotted) {
      suffix.appendChild(child);
    }

    const message = document.createElement("p");

    wrapper.appendChild(input);
    wrapper.appendChild(suffix);
    this.appendChild(label);
    this.appendChild(wrapper);
    this.appendChild(message);

    this.style.display = "inline-block";
    this.inputEl = input;
    this.labelEl = label;
    this.suffixEl = suffix;
    this.messageEl = message;
  }

  private updateAppearance (): void {
    if (!this.inputEl || !this.labelEl || !this.suffixEl || !this.messageEl) return;

    const theme = this.getTheme();
    const intent = this.getIntent();
    const error = this.hasAttribute("error") || this.hasAttribute("error-message");
    const hasSuffix = this.suffixEl.childNodes.length > 0;

    const type = (this.getAttribute("type") || "text").toLowerCase();
    this.inputEl.type = INPUT_TYPES.includes(type) ? type : "text";
    this.inputEl.placeholder = this.getAttribute("placeholder") || "";
    this.inputEl.name = this.getAttribute("name") || "";
    this.inputEl.disabled = this.hasAttribute("disabled");
    this.inputEl.required = this.hasAttribute("required");
    this.inputEl.readOnly = this.hasAttribute("readonly");

    const sizes: Record<ArkSize, { input: string; label: string; suffixPad: string }> = {
      sm: { input: "px-2.5 py-1.5 text-xs", label: "text-[11px]", suffixPad: "pr-8" },
      md: { input: "px-3 py-2 text-sm", label: "text-xs", suffixPad: "pr-9" },
      lg: { input: "px-4 py-2.5 text-base", label: "text-sm", suffixPad: "pr-10" },
      xl: { input: "px-5 py-3 text-lg", label: "text-base", suffixPad: "pr-12" }
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    const roundedMap: Record<ArkRounded, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full"
    };
    const rounded = roundedMap[(this.getAttribute("rounded") || "lg").toLowerCase() as ArkRounded] ?? roundedMap.lg;

    const focusRings: Record<ArkIntent, string> = {
      primary: theme === "dark" ? "focus:ring-slate-500" : "focus:ring-slate-400",
      secondary: theme === "dark" ? "focus:ring-slate-500" : "focus:ring-slate-400",
      success: theme === "dark" ? "focus:ring-emerald-500" : "focus:ring-emerald-400",
      warning: theme === "dark" ? "focus:ring-amber-500" : "focus:ring-amber-400",
      danger: theme === "dark" ? "focus:ring-red-500" : "focus:ring-red-400",
      info: theme === "dark" ? "focus:ring-sky-500" : "focus:ring-sky-400",
      neutral: theme === "dark" ? "focus:ring-zinc-500" : "focus:ring-zinc-400"
    };
    const focusRing = error ? focusRings.danger : focusRings[intent];

    const surface = theme === "dark"
      ? "border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
      : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400";
    const border = error ? "border-red-500" : "";

    this.inputEl.className = [
      "w-full border transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      rounded,
      size.input,
      hasSuffix ? size.suffixPad : "",
      surface,
      border,
      focusRing
    ].join(" ").trim().replace(/\s+/g, " ");

    // Label
    const labelText = this.getAttribute("label") || "";
    this.labelEl.textContent = labelText;
    this.labelEl.hidden = !labelText;
    this.labelEl.className = [
      "mb-1 block font-medium",
      size.label,
      theme === "dark" ? "text-slate-300" : "text-slate-700"
    ].join(" ");

    // Sufixo
    this.suffixEl.hidden = !hasSuffix;
    this.suffixEl.className = "absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1";

    // Mensagem (erro tem precedência sobre helper)
    const errorMessage = this.getAttribute("error-message") || "";
    const helper = this.getAttribute("helper") || "";
    const message = errorMessage || helper;
    this.messageEl.textContent = message;
    this.messageEl.hidden = !message;
    this.messageEl.className = [
      "mt-1 text-xs",
      errorMessage
        ? (theme === "dark" ? "text-red-400" : "text-red-600")
        : (theme === "dark" ? "text-slate-400" : "text-slate-500")
    ].join(" ");

    if (message) {
      this.messageEl.id = this.messageEl.id || `${this.inputEl.id}-message`;
      this.inputEl.setAttribute("aria-describedby", this.messageEl.id);
    } else {
      this.inputEl.removeAttribute("aria-describedby");
    }
    this.inputEl.setAttribute("aria-invalid", error ? "true" : "false");

    applyTestHooks(this, "input", this.inputEl);
    applyTestHooks(this, "input", this.labelEl, "label");
    applyTestHooks(this, "input", this.suffixEl, "suffix");
    applyTestHooks(this, "input", this.messageEl, errorMessage ? "error" : "helper");
  }
}

export default ArkInput;
