import type { ArkTabsVariant } from "@tooark/core";
import type { ArkTab } from "./ark-tab";
import { applyTestHooks } from "./test-hooks";

/** Atributos do grupo propagados a cada aba. */
const PROPAGATED_ATTRS = ["variant", "size", "intent", "rounded", "fill", "theme", "lang", "locale-json"];

/**
 * Faixa de abas. O PRÓPRIO host é o `role="tablist"` (classes, roving
 * tabindex, teclado): as abas `ark-tab` do usuário ficam onde estão, e um
 * filho `slot="actions"` vai para o fim da faixa. Os painéis são do app: o
 * grupo só publica `change` com o `value` da aba ativa. Três variantes:
 * `underline` (padrão), `chips` e `editor` (abas fecháveis, como um editor).
 *
 * As abas são lidas por atributo, nunca por propriedade: num subárvore
 * inserido de uma vez o grupo pode rodar antes de as abas serem upgraded, e
 * uma propriedade escrita antes do upgrade esconderia o accessor da classe.
 */
export class ArkTabs extends HTMLElement {
  static readonly tagName = "ark-tabs";

  private observer: MutationObserver | null = null;
  private syncingValue = false;
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** `aria-label` que o próprio componente escreveu a partir de `label`, para não apagar um do usuário. */
  private appliedLabel: string | null = null;
  /** Posição da última aba ativa, para eleger a vizinha quando ela é removida. */
  private lastSelectedIndex = 0;

  static get observedAttributes(): string[] {
    return [
      "value",
      "variant",
      "size",
      "intent",
      "rounded",
      "fill",
      "theme",
      "label",
      "lang",
      "locale-json",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("change", this.handleTabChange);
    this.addEventListener("keydown", this.handleKeydown);
  }

  connectedCallback(): void {
    if (!this.observer) {
      this.observer = new MutationObserver(() => this.syncTabs());
      this.observer.observe(this, { childList: true, subtree: true });
    }
    this.updateAppearance();
    this.syncTabs();
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
    if (name === "value") {
      if (!this.syncingValue) this.applyValue();
    } else {
      this.syncTabs();
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

  private getVariant(): ArkTabsVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "chips" || variant === "editor" ? variant : "underline";
  }

  private getTabs(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("ark-tab"));
  }

  private isEnabled(tab: HTMLElement): boolean {
    return !tab.hasAttribute("disabled");
  }

  private getActionsEl(): HTMLElement | null {
    return this.querySelector<HTMLElement>(':scope > [slot="actions"]');
  }

  // O `change` da aba não vaza: o grupo consolida e publica o próprio, com o value ativo.
  private readonly handleTabChange = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target || target === this || target.tagName.toLowerCase() !== "ark-tab") return;
    event.stopPropagation();

    if (!this.isEnabled(target)) return;
    this.commitValue(target.getAttribute("value") || "");
  };

  private commitValue(value: string): void {
    this.syncingValue = true;
    this.setAttribute("value", value);
    this.syncingValue = false;
    this.applyValue();

    this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true, composed: true }));
  }

  // Setas, Home e End movem o foco entre abas habilitadas e já selecionam (ativação automática).
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const current = (event.target as HTMLElement | null)?.closest<HTMLElement>("ark-tab");
    if (!current || !this.contains(current)) return;

    const tabs = this.getTabs().filter((tab) => this.isEnabled(tab));
    if (tabs.length === 0) return;
    const index = tabs.indexOf(current);

    let next: HTMLElement | undefined;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    else if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    else if (event.key === "Home") next = tabs[0];
    else if (event.key === "End") next = tabs[tabs.length - 1];
    if (!next) return;

    event.preventDefault();
    next.focus();
    (next as ArkTab).select?.();
  };

  /** Reflete o `value` do grupo em cada aba e garante uma parada de Tab quando nenhuma está ativa. */
  private applyValue(): void {
    const value = this.value;
    const tabs = this.getTabs();
    let hasSelected = false;

    tabs.forEach((tab, index) => {
      const selected = value !== "" && tab.getAttribute("value") === value;
      if (selected) {
        hasSelected = true;
        this.lastSelectedIndex = index;
      }
      tab.toggleAttribute("selected", selected);
      tab.removeAttribute("data-ark-tabstop");
    });

    if (!hasSelected) {
      const fallback = tabs.find((tab) => this.isEnabled(tab));
      fallback?.setAttribute("data-ark-tabstop", "");
    }
  }

  /** Propaga variant/size/intent/theme/idioma às abas e resolve a seleção depois de mudanças nos filhos. */
  private syncTabs(): void {
    const tabs = this.getTabs();

    for (const tab of tabs) {
      for (const name of PROPAGATED_ATTRS) {
        const value = this.getAttribute(name);
        if (value === null) {
          tab.removeAttribute(name);
        } else if (tab.getAttribute(name) !== value) {
          tab.setAttribute(name, value);
        }
      }
    }

    const actions = this.getActionsEl();
    if (actions) applyTestHooks(this, "tabs", actions, "actions");

    if (tabs.length === 0) return;

    const value = this.value;
    const enabled = tabs.filter((tab) => this.isEnabled(tab));
    if (value && tabs.some((tab) => tab.getAttribute("value") === value)) {
      this.applyValue();
      return;
    }

    if (!value) {
      // Sem `value` inicial: a primeira aba habilitada fica ativa, em silêncio (não houve interação).
      const first = enabled[0];
      if (!first) return;
      this.syncingValue = true;
      this.setAttribute("value", first.getAttribute("value") || "");
      this.syncingValue = false;
      this.applyValue();
      return;
    }

    // A aba ativa saiu do DOM (fechada): a vizinha assume e o app é avisado.
    const neighbour = enabled[Math.min(this.lastSelectedIndex, enabled.length - 1)];
    if (neighbour) this.commitValue(neighbour.getAttribute("value") || "");
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
    this.setAttribute("role", "tablist");

    const label = this.getAttribute("label");
    if (label) {
      this.setAttribute("aria-label", label);
      this.appliedLabel = label;
    } else if (this.appliedLabel !== null && this.getAttribute("aria-label") === this.appliedLabel) {
      this.removeAttribute("aria-label");
      this.appliedLabel = null;
    }

    // A linha de base da faixa é um box-shadow interno: não ocupa layout e a aba ativa a cobre com a própria
    // borda (underline) ou fundo (editor), sem margens negativas que o overflow-x cortaria.
    const baseline = "ark:shadow-[inset_0_-1px_0_0_var(--ark-color-border)]";
    const variants: Record<ArkTabsVariant, string> = {
      underline: `ark:flex ark:items-end ark:gap-1 ark:overflow-x-auto ${baseline}`,
      chips: "ark:flex ark:items-center ark:gap-1 ark:overflow-x-auto",
      editor: `ark:flex ark:items-stretch ark:overflow-x-auto ark:bg-surface-muted ${baseline}`
    };
    this.applyOwnClasses(variants[this.getVariant()].split(/\s+/));

    applyTestHooks(this, "tabs", this);
  }
}

export default ArkTabs;
