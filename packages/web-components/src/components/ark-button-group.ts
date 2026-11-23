import { type ArkOrientation, coerceBooleanAttr } from "@tooark/core";
import type { ArkButton } from "./ark-button";
import { releaseGroupAttrs, stampGroupAttr } from "./group-attrs";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Atributos do grupo gravados em cada botão enquanto o grupo os tem. */
const PROPAGATED_ATTRS = ["variant", "intent", "size", "rounded", "theme"];

/** Os botões que o grupo arruma: o ark-button e o ark-copy-button, que o estende. */
const BUTTONS = "ark-button, ark-copy-button";

/**
 * Grupo de botões. O PRÓPRIO host é o grupo (`role="group"` + classes) e os
 * `ark-button` do usuário ficam onde estão. Colados por padrão: cada botão
 * recebe do grupo a posição (`data-ark-group-pos`) e a direção
 * (`data-ark-group-dir`) e calcula os próprios cantos e a divisa, porque uma
 * regra do components.css perderia para o `ark:rounded-*` dele. `spaced`
 * separa os botões pelo gap do size. `variant`, `intent`, `size`, `rounded`,
 * `theme` e `disabled` do grupo valem para todos os botões. O grupo não tem
 * evento próprio: cada botão continua emitindo o clique dele.
 */
export class ArkButtonGroup extends HTMLElementBase {
  static readonly tagName = "ark-button-group";

  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Botões já arrumados, para devolver os atributos a um que saiu do grupo. */
  private known = new Set<Element>();
  /** `aria-label` que o próprio componente escreveu a partir de `label`, para não apagar um do usuário. */
  private appliedLabel: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "orientation",
      "spaced",
      "full-width",
      "disabled",
      "label",
      "variant",
      "intent",
      "size",
      "rounded",
      "theme",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.observer) {
      // Botões que entram ou saem (frameworks) refazem as posições; e um atributo que o grupo governa, regravado
      // direto num botão (um framework trocando a prop do filho), volta ao valor do grupo.
      this.observer = new MutationObserver(() => this.syncButtons());
      this.observer.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [...PROPAGATED_ATTRS, "disabled"]
      });
    }
    this.updateAppearance();
    this.syncButtons();
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
    this.syncButtons();
  }

  /** Direção da fila: horizontal ou vertical. Padrão: "horizontal". */
  get orientation(): ArkOrientation {
    return (this.getAttribute("orientation") || "").toLowerCase() === "vertical" ? "vertical" : "horizontal";
  }

  set orientation(value: string | null | undefined) {
    reflectAttr(this, "orientation", value || null);
  }

  /** Botões separados pelo gap do size, em vez de colados num contorno só. */
  get spaced(): boolean {
    return this.hasAttribute("spaced");
  }

  set spaced(value: boolean | string | null | undefined) {
    this.toggleAttribute("spaced", coerceBooleanAttr(value));
  }

  /** Desabilita todos os botões do grupo. */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Nome do grupo (vira `aria-label`). */
  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value || null);
  }

  /** Os botões deste grupo, em ordem de documento, mesmo atrás de um wrapper de framework. */
  get buttons(): ArkButton[] {
    return Array.from(this.querySelectorAll<ArkButton>(BUTTONS)).filter(
      (button) => button.closest("ark-button-group") === this
    );
  }

  /** Grava em cada botão os atributos do grupo, a posição e a direção; devolve os de quem saiu. */
  private syncButtons(): void {
    const buttons = this.buttons;
    const joined = !this.spaced;
    const vertical = this.orientation === "vertical";

    for (const gone of Array.from(this.known)) {
      if (buttons.includes(gone as ArkButton)) continue;
      releaseGroupAttrs(gone);
      this.known.delete(gone);
    }

    buttons.forEach((button, index) => {
      this.known.add(button);
      for (const name of PROPAGATED_ATTRS) stampGroupAttr(button, name, this.getAttribute(name));
      stampGroupAttr(button, "disabled", this.disabled ? "" : null);
      const position =
        buttons.length === 1 ? "only" : index === 0 ? "first" : index === buttons.length - 1 ? "last" : "middle";
      stampGroupAttr(button, "data-ark-group-pos", joined ? position : null);
      stampGroupAttr(button, "data-ark-group-dir", joined && vertical ? "vertical" : null);
    });
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
    if (this.getAttribute("role") !== "group") this.setAttribute("role", "group");

    // `label` vira aria-label; um aria-label que o usuário pôs por conta própria não é tocado.
    const label = this.getAttribute("label");
    const current = this.getAttribute("aria-label");
    if (label) {
      if (current === null || current === this.appliedLabel) {
        if (current !== label) this.setAttribute("aria-label", label);
        this.appliedLabel = label;
      }
    } else if (this.appliedLabel !== null) {
      if (current === this.appliedLabel) this.removeAttribute("aria-label");
      this.appliedLabel = null;
    }

    const gaps: Record<string, string> = {
      xs: "ark:gap-1",
      sm: "ark:gap-1.5",
      md: "ark:gap-2",
      lg: "ark:gap-2.5",
      xl: "ark:gap-3"
    };
    const gap = gaps[(this.getAttribute("size") || "md").toLowerCase()] ?? gaps.md;
    const fullWidth = this.hasAttribute("full-width");

    // isolate: os botões colados sobem no hover e no foco (z local) sem disputar com o que está fora do grupo.
    this.applyOwnClasses(
      [
        fullWidth ? "ark:flex ark:w-full" : "ark:inline-flex",
        this.orientation === "vertical" ? "ark:flex-col" : "ark:flex-row",
        "ark:isolate ark:items-stretch ark:align-middle",
        this.spaced ? gap : ""
      ]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean)
    );

    applyTestHooks(this, "button-group", this);
  }
}

export default ArkButtonGroup;
