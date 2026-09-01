import "../styles/tailwind.css";
import type { ArkThemeSelected } from "@tooark/core";
import { ArkToggle } from "./ark-toggle";
import { applyTestHooks } from "./test-hooks";

export class ArkToggleGroup extends HTMLElement {
  static readonly tagName = "ark-toggle-group";

  private wrapperEl: HTMLDivElement | null = null;
  private observer: MutationObserver | null = null;
  private syncingValue = false;

  static get observedAttributes (): string[] {
    return ["value", "multiple", "disabled", "size", "intent", "theme", "class", "testid"];
  }

  connectedCallback (): void {
    if (!this.wrapperEl) {
      this.render();
    }

    if (!this.observer) {
      this.observer = new MutationObserver(() => this.syncToggles());
      this.observer.observe(this, { childList: true, subtree: true });
    }

    this.updateAppearance();
    this.syncToggles();
  }

  disconnectedCallback (): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback (name: string): void {
    if (!this.wrapperEl) return;

    this.updateAppearance();

    if (name === "value" && !this.syncingValue) {
      this.applyValueToToggles();
    } else if (name !== "value") {
      this.syncToggles();
    }
  }

  get value (): string {
    return this.getAttribute("value") || "";
  }

  get values (): string[] {
    return this.value.split(",").map((v) => v.trim()).filter(Boolean);
  }

  private isMultiple (): boolean {
    return this.hasAttribute("multiple");
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

  private getToggles (): ArkToggle[] {
    return Array.from(this.querySelectorAll("ark-toggle")) as ArkToggle[];
  }

  private render (): void {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("part", "group");
    wrapper.setAttribute("role", "group");
    wrapper.addEventListener("change", (event) => this.handleToggleChange(event));

    while (this.firstChild) {
      wrapper.appendChild(this.firstChild);
    }

    this.appendChild(wrapper);
    this.wrapperEl = wrapper;
  }

  private handleToggleChange (event: Event): void {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName.toLowerCase() !== "ark-toggle") return;

    // O evento do item não vaza; o grupo publica o próprio "change" consolidado.
    event.stopPropagation();

    const toggle = target as ArkToggle;

    if (!this.isMultiple() && toggle.pressed) {
      this.getToggles().forEach((other) => {
        if (other !== toggle && other.pressed) {
          other.pressed = false;
        }
      });
    }

    const pressedValues = this.getToggles().filter((t) => t.pressed).map((t) => t.value).filter(Boolean);
    const nextValue = this.isMultiple() ? pressedValues.join(",") : pressedValues[0] || "";

    this.syncingValue = true;
    if (nextValue) {
      this.setAttribute("value", nextValue);
    } else {
      this.removeAttribute("value");
    }
    this.syncingValue = false;

    this.dispatchEvent(new CustomEvent("change", {
      detail: this.isMultiple() ? { values: pressedValues } : { value: nextValue },
      bubbles: true,
      composed: true
    }));
  }

  private applyValueToToggles (): void {
    const values = this.values;
    this.getToggles().forEach((toggle) => {
      toggle.pressed = values.includes(toggle.value);
    });
  }

  // Propaga size/intent/theme/disabled do grupo para os itens.
  private syncToggles (): void {
    const size = this.getAttribute("size");
    const intent = this.getAttribute("intent");
    const theme = this.getAttribute("theme");
    const disabled = this.hasAttribute("disabled");

    this.getToggles().forEach((toggle) => {
      if (size) toggle.setAttribute("size", size);
      if (intent) toggle.setAttribute("intent", intent);
      if (theme) toggle.setAttribute("theme", theme);
      if (disabled) {
        toggle.setAttribute("disabled", "");
        toggle.dataset.groupDisabled = "true";
      } else if (toggle.dataset.groupDisabled) {
        // Só remove o "disabled" que o próprio grupo aplicou; preserva o individual.
        toggle.removeAttribute("disabled");
        delete toggle.dataset.groupDisabled;
      }
    });

    if (this.hasAttribute("value")) {
      this.applyValueToToggles();
    }
  }

  private updateAppearance (): void {
    if (!this.wrapperEl) return;

    const theme = this.getTheme();
    const custom = this.getAttribute("class") || "";

    this.wrapperEl.className = [
      "inline-flex items-center gap-1 rounded-lg p-1",
      theme === "dark" ? "bg-slate-800" : "bg-slate-100",
      custom
    ].join(" ").trim();

    applyTestHooks(this, "toggle-group", this.wrapperEl);
  }
}

export default ArkToggleGroup;
