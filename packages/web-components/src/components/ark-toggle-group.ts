import type { ArkToggle } from "./ark-toggle";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/**
 * Segmented control de ark-toggle. O PRÓPRIO host é o container
 * (`role="group"` + classes): os itens do usuário ficam onde estão, então
 * frameworks podem adicionar/remover toggles livremente.
 */
export class ArkToggleGroup extends HTMLElementBase {
  static readonly tagName = "ark-toggle-group";

  private observer: MutationObserver | null = null;
  private syncingValue = false;
  private ownClasses: string[] = [];
  private syncingClass = false;

  static get observedAttributes(): string[] {
    return ["value", "multiple", "disabled", "size", "intent", "theme", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("change", this.handleToggleChange);
  }

  connectedCallback(): void {
    if (!this.observer) {
      this.observer = new MutationObserver(() => this.syncToggles());
      this.observer.observe(this, { childList: true, subtree: true });
    }

    this.updateAppearance();
    this.syncToggles();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;

    this.updateAppearance();

    if (name === "value" && !this.syncingValue) {
      this.applyValueToToggles();
    } else if (name !== "value") {
      this.syncToggles();
    }
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(next: string) {
    if (next) {
      this.setAttribute("value", next);
    } else {
      this.removeAttribute("value");
    }
  }

  get values(): string[] {
    return this.value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }

  private isMultiple(): boolean {
    return this.hasAttribute("multiple");
  }

  private getToggles(): ArkToggle[] {
    return Array.from(this.querySelectorAll("ark-toggle")) as ArkToggle[];
  }

  private readonly handleToggleChange = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target || target === this || target.tagName.toLowerCase() !== "ark-toggle") return;

    // O evento do item não vaza; o grupo publica o próprio "change" consolidado. Imediata porque quem escuta
    // no próprio host (wrappers) foi registrado depois deste listener e ainda receberia o do item.
    event.stopImmediatePropagation();

    const toggle = target as ArkToggle;

    if (!this.isMultiple() && toggle.pressed) {
      this.getToggles().forEach((other) => {
        if (other !== toggle && other.pressed) {
          other.pressed = false;
        }
      });
    }

    const pressedValues = this.getToggles()
      .filter((t) => t.pressed)
      .map((t) => t.value)
      .filter(Boolean);
    const nextValue = this.isMultiple() ? pressedValues.join(",") : pressedValues[0] || "";

    this.syncingValue = true;
    if (nextValue) {
      this.setAttribute("value", nextValue);
    } else {
      this.removeAttribute("value");
    }
    this.syncingValue = false;

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: this.isMultiple() ? { values: pressedValues } : { value: nextValue },
        bubbles: true,
        composed: true
      })
    );
  };

  private applyValueToToggles(): void {
    const values = this.values;
    this.getToggles().forEach((toggle) => {
      toggle.pressed = values.includes(toggle.value);
    });
  }

  /** Propaga size/intent/theme/disabled do grupo para os itens. */
  private syncToggles(): void {
    const size = this.getAttribute("size");
    const intent = this.getAttribute("intent");
    const theme = this.getAttribute("theme");
    const disabled = this.hasAttribute("disabled");

    this.getToggles().forEach((toggle) => {
      if (size) toggle.setAttribute("size", size);
      if (intent) toggle.setAttribute("intent", intent);
      if (theme) toggle.setAttribute("theme", theme);
      if (disabled) {
        // Um item já desabilitado por conta própria não leva a marca do grupo, senão ela apagaria o individual.
        if (!toggle.hasAttribute("disabled")) {
          toggle.setAttribute("disabled", "");
          toggle.dataset.groupDisabled = "true";
        }
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
    this.setAttribute("role", "group");
    this.applyOwnClasses(
      "ark:inline-flex ark:items-center ark:gap-1 ark:rounded-lg ark:bg-surface-muted ark:p-1".split(/\s+/)
    );

    applyTestHooks(this, "toggle-group", this);
  }
}

export default ArkToggleGroup;
