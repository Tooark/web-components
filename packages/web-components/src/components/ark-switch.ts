import { type ArkIntent, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

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

const CHECK_SVG =
  '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5l2.5 2.5 4.5-5"></path></svg>';
const CROSS_SVG =
  '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l6 6M9 3L3 9"></path></svg>';

/**
 * Interruptor liga/desliga com trilho e polegar. O trilho é um <button>
 * `role="switch"`; um checkbox oculto espelha o estado para o formulário,
 * submetendo `name`/`value` apenas quando marcado. Tem tabela de proporções
 * própria, em vez da escala de altura dos demais controles.
 */
export class ArkSwitch extends HTMLElement {
  static readonly tagName = "ark-switch";

  private trackEl: HTMLButtonElement | null = null;
  private thumbEl: HTMLSpanElement | null = null;
  private labelOnEl: HTMLSpanElement | null = null;
  private labelOffEl: HTMLSpanElement | null = null;
  private inputEl: HTMLInputElement | null = null;

  static get observedAttributes(): string[] {
    return [
      "checked",
      "disabled",
      "size",
      "intent",
      "theme",
      "color",
      "labels",
      "label-on",
      "label-off",
      "icons",
      "name",
      "value",
      "label",
      "aria-label",
      "testid"
    ];
  }

  connectedCallback(): void {
    if (!this.trackEl) {
      this.render();
    }

    this.updateAppearance();
  }

  attributeChangedCallback(): void {
    if (!this.trackEl) return;
    this.updateAppearance();
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean | string | null | undefined) {
    if (coerceBooleanAttr(value)) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  toggle(): void {
    if (this.hasAttribute("disabled")) return;

    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true
      })
    );
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

  private getPalette(intent: ArkIntent): ArkSwitchPalette {
    const palettes: Record<ArkIntent, ArkSwitchPalette> = {
      primary: {
        focusRing: "ark:focus-visible:ring-primary-ring",
        onTrack: "ark:bg-primary",
        thumbOn: "ark:bg-primary-fg",
        iconOn: "ark:text-primary",
        labelOn: "ark:text-primary-fg"
      },
      secondary: {
        focusRing: "ark:focus-visible:ring-secondary-ring",
        onTrack: "ark:bg-secondary",
        thumbOn: "ark:bg-secondary-fg",
        iconOn: "ark:text-secondary",
        labelOn: "ark:text-secondary-fg"
      },
      success: {
        focusRing: "ark:focus-visible:ring-success-ring",
        onTrack: "ark:bg-success",
        thumbOn: "ark:bg-success-fg",
        iconOn: "ark:text-success",
        labelOn: "ark:text-success-fg"
      },
      warning: {
        focusRing: "ark:focus-visible:ring-warning-ring",
        onTrack: "ark:bg-warning",
        thumbOn: "ark:bg-warning-fg",
        iconOn: "ark:text-warning",
        labelOn: "ark:text-warning-fg"
      },
      danger: {
        focusRing: "ark:focus-visible:ring-danger-ring",
        onTrack: "ark:bg-danger",
        thumbOn: "ark:bg-danger-fg",
        iconOn: "ark:text-danger",
        labelOn: "ark:text-danger-fg"
      },
      info: {
        focusRing: "ark:focus-visible:ring-info-ring",
        onTrack: "ark:bg-info",
        thumbOn: "ark:bg-info-fg",
        iconOn: "ark:text-info",
        labelOn: "ark:text-info-fg"
      },
      neutral: {
        focusRing: "ark:focus-visible:ring-neutral-ring",
        onTrack: "ark:bg-neutral",
        thumbOn: "ark:bg-neutral-fg",
        iconOn: "ark:text-neutral",
        labelOn: "ark:text-neutral-fg"
      }
    };

    return palettes[intent];
  }

  private getSizing(): ArkSwitchSizing {
    const size = (this.getAttribute("size") || "md").toLowerCase() as ArkSize;

    const sizes: Record<ArkSize, ArkSwitchSizing> = {
      xs: {
        track: "ark:h-3.5 ark:w-6",
        trackLabels: "ark:h-3.5 ark:w-10",
        thumb: "ark:h-2.5 ark:w-2.5",
        translate: "ark:translate-x-2.5",
        translateLabels: "ark:translate-x-[1.625rem]",
        icon: "ark:h-1.5 ark:w-1.5",
        label: "ark:text-[6px]"
      },
      sm: {
        track: "ark:h-4 ark:w-7",
        trackLabels: "ark:h-4 ark:w-12",
        thumb: "ark:h-3 ark:w-3",
        translate: "ark:translate-x-3",
        translateLabels: "ark:translate-x-8",
        icon: "ark:h-2 ark:w-2",
        label: "ark:text-[7px]"
      },
      md: {
        track: "ark:h-6 ark:w-11",
        trackLabels: "ark:h-6 ark:w-16",
        thumb: "ark:h-5 ark:w-5",
        translate: "ark:translate-x-5",
        translateLabels: "ark:translate-x-10",
        icon: "ark:h-2.5 ark:w-2.5",
        label: "ark:text-[9px]"
      },
      lg: {
        track: "ark:h-7 ark:w-12",
        trackLabels: "ark:h-7 ark:w-20",
        thumb: "ark:h-6 ark:w-6",
        translate: "ark:translate-x-5",
        translateLabels: "ark:translate-x-[3.25rem]",
        icon: "ark:h-3 ark:w-3",
        label: "ark:text-[11px]"
      },
      xl: {
        track: "ark:h-8 ark:w-14",
        trackLabels: "ark:h-8 ark:w-24",
        thumb: "ark:h-7 ark:w-7",
        translate: "ark:translate-x-6",
        translateLabels: "ark:translate-x-16",
        icon: "ark:h-3.5 ark:w-3.5",
        label: "ark:text-xs"
      }
    };

    return sizes[size] ?? sizes.md;
  }

  private render(): void {
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

  private updateAppearance(): void {
    if (!this.trackEl || !this.thumbEl || !this.labelOnEl || !this.labelOffEl || !this.inputEl) return;

    const palette = this.getPalette(this.getIntent());
    const sizing = this.getSizing();
    const checked = this.checked;
    const disabled = this.hasAttribute("disabled");
    const labels = this.hasAttribute("labels");
    const icons = this.hasAttribute("icons");
    const color = this.getAttribute("color")?.trim();

    const offTrack = "ark:bg-muted";
    const labelOffColor = "ark:text-fg-muted";

    this.trackEl.className = [
      "ark:relative ark:inline-flex ark:shrink-0 ark:cursor-pointer ark:items-center ark:rounded-full ark:border-2 ark:border-transparent ark:transition-colors ark:focus:outline-none ark:focus-visible:ring-2 ark:focus-visible:ring-offset-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
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
      "ark:pointer-events-none ark:inline-flex ark:items-center ark:justify-center ark:rounded-full ark:shadow ark:transition-transform",
      sizing.thumb,
      checked ? palette.thumbOn : "ark:bg-white",
      checked ? palette.iconOn : "ark:text-fg-placeholder",
      checked ? (labels ? sizing.translateLabels : sizing.translate) : "ark:translate-x-0"
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

    const labelBase =
      "ark:pointer-events-none ark:absolute ark:top-0 ark:flex ark:h-full ark:items-center ark:font-bold ark:uppercase ark:tracking-wide ark:transition-opacity ark:select-none";
    this.labelOnEl.className = [
      labelBase,
      "ark:left-0 ark:pl-2",
      sizing.label,
      palette.labelOn,
      labels && checked ? "ark:opacity-100" : "ark:opacity-0"
    ].join(" ");
    this.labelOffEl.className = [
      labelBase,
      "ark:right-0 ark:pr-2",
      sizing.label,
      labelOffColor,
      labels && !checked ? "ark:opacity-100" : "ark:opacity-0"
    ].join(" ");
    this.labelOnEl.textContent = this.getAttribute("label-on") || "ON";
    this.labelOffEl.textContent = this.getAttribute("label-off") || "OFF";

    this.inputEl.checked = checked;
    this.inputEl.disabled = disabled;
    this.inputEl.name = this.getAttribute("name") || "";
    this.inputEl.value = this.getAttribute("value") || "on";

    applyTestHooks(this, "switch", this.trackEl);
    applyTestHooks(this, "switch", this.thumbEl, "thumb");
    applyTestHooks(this, "switch", this.labelOnEl, "label-on");
    applyTestHooks(this, "switch", this.labelOffEl, "label-off");
    applyTestHooks(this, "switch", this.inputEl, "input");
  }
}

export default ArkSwitch;
