import "../styles/tailwind.css";
import type { ArkSize, ArkIntent, ArkThemeSelected } from "@tooark/core";

type ArkSwitchPalette = {
  focusRing: string;
  onTrack: string;
  thumbOn: string;
  iconOn: string;
  labelOn: string;
};

type ArkSwitchSizing = {
  track: string;
  trackLabels: string;
  thumb: string;
  translate: string;
  translateLabels: string;
  icon: string;
  label: string;
};

const CHECK_SVG = "<svg viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2.5 6.5l2.5 2.5 4.5-5\"></path></svg>";
const CROSS_SVG = "<svg viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 3l6 6M9 3L3 9\"></path></svg>";

export class ArkSwitch extends HTMLElement {
  static readonly tagName = "ark-switch";

  private trackEl: HTMLButtonElement | null = null;
  private thumbEl: HTMLSpanElement | null = null;
  private labelOnEl: HTMLSpanElement | null = null;
  private labelOffEl: HTMLSpanElement | null = null;
  private inputEl: HTMLInputElement | null = null;

  static get observedAttributes (): string[] {
    return ["checked", "disabled", "size", "intent", "theme", "color", "labels", "label-on", "label-off", "icons", "name", "value", "label", "aria-label"];
  }

  connectedCallback (): void {
    if (!this.trackEl) {
      this.render();
    }

    this.updateAppearance();
  }

  attributeChangedCallback (): void {
    if (!this.trackEl) return;
    this.updateAppearance();
  }

  get checked (): boolean {
    return this.hasAttribute("checked");
  }

  set checked (value: boolean) {
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  toggle (): void {
    if (this.hasAttribute("disabled")) return;

    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true
    }));
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

  private getPalette (theme: ArkThemeSelected, intent: ArkIntent): ArkSwitchPalette {
    const light: Record<ArkIntent, ArkSwitchPalette> = {
      primary: { focusRing: "focus-visible:ring-slate-400", onTrack: "bg-slate-900", thumbOn: "bg-white", iconOn: "text-slate-900", labelOn: "text-white" },
      secondary: { focusRing: "focus-visible:ring-slate-400", onTrack: "bg-slate-600", thumbOn: "bg-white", iconOn: "text-slate-600", labelOn: "text-white" },
      success: { focusRing: "focus-visible:ring-emerald-400", onTrack: "bg-emerald-600", thumbOn: "bg-white", iconOn: "text-emerald-600", labelOn: "text-white" },
      warning: { focusRing: "focus-visible:ring-amber-400", onTrack: "bg-amber-500", thumbOn: "bg-white", iconOn: "text-amber-500", labelOn: "text-slate-900" },
      danger: { focusRing: "focus-visible:ring-red-400", onTrack: "bg-red-600", thumbOn: "bg-white", iconOn: "text-red-600", labelOn: "text-white" },
      info: { focusRing: "focus-visible:ring-sky-400", onTrack: "bg-sky-600", thumbOn: "bg-white", iconOn: "text-sky-600", labelOn: "text-white" },
      neutral: { focusRing: "focus-visible:ring-zinc-400", onTrack: "bg-zinc-700", thumbOn: "bg-white", iconOn: "text-zinc-700", labelOn: "text-white" }
    };

    const dark: Record<ArkIntent, ArkSwitchPalette> = {
      primary: { focusRing: "focus-visible:ring-slate-500", onTrack: "bg-slate-100", thumbOn: "bg-slate-900", iconOn: "text-slate-100", labelOn: "text-slate-900" },
      secondary: { focusRing: "focus-visible:ring-slate-500", onTrack: "bg-slate-500", thumbOn: "bg-white", iconOn: "text-slate-500", labelOn: "text-white" },
      success: { focusRing: "focus-visible:ring-emerald-500", onTrack: "bg-emerald-500", thumbOn: "bg-white", iconOn: "text-emerald-500", labelOn: "text-white" },
      warning: { focusRing: "focus-visible:ring-amber-500", onTrack: "bg-amber-400", thumbOn: "bg-white", iconOn: "text-amber-500", labelOn: "text-slate-900" },
      danger: { focusRing: "focus-visible:ring-red-500", onTrack: "bg-red-500", thumbOn: "bg-white", iconOn: "text-red-500", labelOn: "text-white" },
      info: { focusRing: "focus-visible:ring-sky-500", onTrack: "bg-sky-500", thumbOn: "bg-white", iconOn: "text-sky-500", labelOn: "text-white" },
      neutral: { focusRing: "focus-visible:ring-zinc-500", onTrack: "bg-zinc-300", thumbOn: "bg-zinc-800", iconOn: "text-zinc-200", labelOn: "text-zinc-900" }
    };

    return (theme === "dark" ? dark : light)[intent];
  }

  private getSizing (): ArkSwitchSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;

    const sizes: Record<ArkSize, ArkSwitchSizing> = {
      sm: { track: "h-4 w-7", trackLabels: "h-4 w-12", thumb: "h-3 w-3", translate: "translate-x-3", translateLabels: "translate-x-8", icon: "h-2 w-2", label: "text-[7px]" },
      md: { track: "h-6 w-11", trackLabels: "h-6 w-16", thumb: "h-5 w-5", translate: "translate-x-5", translateLabels: "translate-x-10", icon: "h-2.5 w-2.5", label: "text-[9px]" },
      lg: { track: "h-7 w-12", trackLabels: "h-7 w-20", thumb: "h-6 w-6", translate: "translate-x-5", translateLabels: "translate-x-[3.25rem]", icon: "h-3 w-3", label: "text-[11px]" },
      xl: { track: "h-8 w-14", trackLabels: "h-8 w-24", thumb: "h-7 w-7", translate: "translate-x-6", translateLabels: "translate-x-16", icon: "h-3.5 w-3.5", label: "text-xs" }
    };

    return sizes[size] ?? sizes.md;
  }

  private render (): void {
    const track = document.createElement("button");
    track.type = "button";
    track.setAttribute("part", "switch");
    track.setAttribute("role", "switch");
    track.addEventListener("click", () => this.toggle());

    const labelOn = document.createElement("span");
    labelOn.setAttribute("part", "label-on");
    labelOn.setAttribute("aria-hidden", "true");

    const labelOff = document.createElement("span");
    labelOff.setAttribute("part", "label-off");
    labelOff.setAttribute("aria-hidden", "true");

    const thumb = document.createElement("span");
    thumb.setAttribute("part", "thumb");
    thumb.setAttribute("aria-hidden", "true");

    // Checkbox oculto para participação em formulários (submete quando checked).
    const input = document.createElement("input");
    input.type = "checkbox";
    input.hidden = true;
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");

    track.appendChild(labelOn);
    track.appendChild(labelOff);
    track.appendChild(thumb);
    this.appendChild(track);
    this.appendChild(input);

    this.trackEl = track;
    this.thumbEl = thumb;
    this.labelOnEl = labelOn;
    this.labelOffEl = labelOff;
    this.inputEl = input;
  }

  private updateAppearance (): void {
    if (!this.trackEl || !this.thumbEl || !this.labelOnEl || !this.labelOffEl || !this.inputEl) return;

    const theme = this.getTheme();
    const palette = this.getPalette(theme, this.getIntent());
    const sizing = this.getSizing();
    const checked = this.checked;
    const disabled = this.hasAttribute("disabled");
    const labels = this.hasAttribute("labels");
    const icons = this.hasAttribute("icons");
    const color = this.getAttribute("color")?.trim();

    const offTrack = theme === "dark" ? "bg-slate-600" : "bg-slate-300";
    const labelOffColor = theme === "dark" ? "text-slate-300" : "text-slate-600";

    this.trackEl.className = [
      "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      palette.focusRing,
      labels ? sizing.trackLabels : sizing.track,
      checked ? palette.onTrack : offTrack
    ].join(" ");

    this.trackEl.setAttribute("aria-checked", checked ? "true" : "false");
    this.trackEl.disabled = disabled;
    this.trackEl.style.backgroundColor = checked && color ? color : "";

    const label = this.getAttribute("aria-label") || this.getAttribute("label");
    if (label) {
      this.trackEl.setAttribute("aria-label", label);
    } else {
      this.trackEl.removeAttribute("aria-label");
    }

    this.thumbEl.className = [
      "pointer-events-none inline-flex items-center justify-center rounded-full shadow transition-transform",
      sizing.thumb,
      checked ? palette.thumbOn : "bg-white",
      checked ? palette.iconOn : "text-slate-400",
      checked ? (labels ? sizing.translateLabels : sizing.translate) : "translate-x-0"
    ].join(" ");
    this.thumbEl.style.color = checked && color ? color : "";

    if (icons) {
      const svg = checked ? CHECK_SVG : CROSS_SVG;
      if (this.thumbEl.dataset.icon !== (checked ? "check" : "cross")) {
        this.thumbEl.innerHTML = svg.replace("<svg ", `<svg class="${sizing.icon}" `);
        this.thumbEl.dataset.icon = checked ? "check" : "cross";
      } else {
        const svgEl = this.thumbEl.querySelector("svg");
        if (svgEl) svgEl.setAttribute("class", sizing.icon);
      }
    } else if (this.thumbEl.dataset.icon) {
      this.thumbEl.innerHTML = "";
      delete this.thumbEl.dataset.icon;
    }

    const labelBase = "pointer-events-none absolute top-0 flex h-full items-center font-bold uppercase tracking-wide transition-opacity select-none";
    this.labelOnEl.className = [labelBase, "left-0 pl-2", sizing.label, palette.labelOn, labels && checked ? "opacity-100" : "opacity-0"].join(" ");
    this.labelOffEl.className = [labelBase, "right-0 pr-2", sizing.label, labelOffColor, labels && !checked ? "opacity-100" : "opacity-0"].join(" ");
    this.labelOnEl.textContent = this.getAttribute("label-on") || "ON";
    this.labelOffEl.textContent = this.getAttribute("label-off") || "OFF";

    this.inputEl.checked = checked;
    this.inputEl.disabled = disabled;
    this.inputEl.name = this.getAttribute("name") || "";
    this.inputEl.value = this.getAttribute("value") || "on";
  }
}

export default ArkSwitch;
