import { type ArkNavVariant, type ArkSize, coerceBooleanAttr } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Chevron do cabeçalho expansível (chrome próprio do componente); gira 180° quando o grupo está aberto. */
const CHEVRON_SVG = `
  <svg class="ark:h-3.5 ark:w-3.5 ark:shrink-0 ark:transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 7.5l5 5 5-5"></path>
  </svg>`;

/** Contador para o id do cabeçalho, que o `aria-labelledby` do grupo referencia. */
let navGroupSeq = 0;

/**
 * Seção de um ark-nav. O PRÓPRIO host é o grupo (`role="group"`, nomeado pelo
 * cabeçalho); os `ark-nav-item` do usuário ficam onde estão. `label` cria o
 * cabeçalho num nó próprio: um título de seção ou, com `expandable`, um botão
 * (`aria-expanded`) que abre e fecha os itens (`open`, refletido) e emite
 * `ark-toggle`. No trilho (sidebar recolhida) o cabeçalho some e o grupo vira
 * uma faixa separada por uma linha, com todos os itens à mostra; no navbar e
 * no tabbar o grupo não tem caixa (`display: contents`) e os itens entram na
 * barra. Tamanho e apresentação chegam propagados do ark-nav.
 */
export class ArkNavGroup extends HTMLElementBase {
  static readonly tagName = "ark-nav-group";

  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Cabeçalho próprio: `div` (título) ou `button` (expansível). */
  private headingEl: HTMLElement | null = null;
  private readonly headingId = `ark-nav-group-${++navGroupSeq}-heading`;
  /** `aria-labelledby` que o próprio componente escreveu, para não apagar um do usuário. */
  private appliedLabelledBy: string | null = null;

  static get observedAttributes(): string[] {
    return ["label", "expandable", "open", "variant", "size", "theme", "data-ark-rail", "class", "testid"];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    this.updateAppearance();
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  /** Texto do cabeçalho; sem ele o grupo não tem cabeçalho nem nome. */
  get label(): string | null {
    return this.getAttribute("label");
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value);
  }

  /** O cabeçalho é um botão que abre e fecha os itens. */
  get expandable(): boolean {
    return this.hasAttribute("expandable");
  }

  set expandable(value: boolean | string | null | undefined) {
    this.toggleAttribute("expandable", coerceBooleanAttr(value));
  }

  /** Itens à mostra (só importa com `expandable`). */
  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean | string | null | undefined) {
    this.toggleAttribute("open", coerceBooleanAttr(value));
  }

  /** Abre ou fecha um grupo expansível e emite `ark-toggle` com `detail: { open }`. */
  toggle(): void {
    if (!this.expandable) return;
    const open = !this.open;
    this.toggleAttribute("open", open);
    this.dispatchEvent(new CustomEvent("ark-toggle", { detail: { open }, bubbles: true, composed: true }));
  }

  private getVariant(): ArkNavVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "navbar" || variant === "tabbar" ? variant : "sidebar";
  }

  /** Trilho: a sidebar recolhida só com ícones (o ark-nav propaga `data-ark-rail`). */
  private isRail(): boolean {
    return this.hasAttribute("data-ark-rail") && this.getVariant() === "sidebar";
  }

  // Cabeçalho próprio no início do host: div de título ou botão expansível; recriado quando troca de tipo.
  private syncHeading(label: string | null, expandable: boolean, visible: boolean): void {
    if (label === null) {
      this.headingEl?.remove();
      this.headingEl = null;
      return;
    }

    const tag = expandable ? "button" : "div";
    if (this.headingEl && this.headingEl.tagName.toLowerCase() !== tag) {
      this.headingEl.remove();
      this.headingEl = null;
    }
    if (!this.headingEl) {
      const heading = document.createElement(tag);
      heading.id = this.headingId;
      heading.setAttribute("data-ark-chrome", "heading");
      if (heading instanceof HTMLButtonElement) {
        heading.type = "button";
        heading.addEventListener("click", () => this.toggle());
      }
      this.prepend(heading);
      this.headingEl = heading;
    }

    const heading = this.headingEl;
    // Texto num span próprio para o chevron do botão ficar ao lado sem reescrever o nó inteiro a cada mudança.
    if (!heading.firstElementChild) {
      heading.replaceChildren(document.createElement("span"));
      if (expandable) heading.insertAdjacentHTML("beforeend", CHEVRON_SVG);
    }
    (heading.firstElementChild as HTMLElement).textContent = label;

    const sizes: Record<ArkSize, string> = {
      xs: "ark:text-2xs",
      sm: "ark:text-2xs",
      md: "ark:text-2xs",
      lg: "ark:text-xs",
      xl: "ark:text-xs"
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;
    const text = `ark:font-semibold ark:tracking-wide ark:text-fg-muted ark:uppercase ark:select-none ${size}`;

    if (!visible) {
      heading.className = "ark:hidden";
    } else if (expandable) {
      heading.className = `ark:flex ark:w-full ark:cursor-pointer ark:items-center ark:justify-between ark:gap-2 ark:rounded-md ark:px-3 ark:py-1.5 ark:transition-colors ark:outline-none ark:ring-inset ark:hover:bg-surface-muted ark:hover:text-fg ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring ${text}`;
    } else {
      heading.className = `ark:px-3 ark:pt-3 ark:pb-1 ${text}`;
    }

    if (expandable) {
      const open = this.open;
      heading.setAttribute("aria-expanded", open ? "true" : "false");
      heading.querySelector("svg")?.classList.toggle("ark:rotate-180", open);
    } else {
      heading.removeAttribute("aria-expanded");
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
    const variant = this.getVariant();
    const rail = this.isRail();
    const label = this.getAttribute("label");

    this.setAttribute("role", "group");
    // O cabeçalho só aparece na sidebar expandida; nas barras e no trilho os itens entram soltos.
    this.syncHeading(label, this.expandable, variant === "sidebar" && !rail);

    // Nome acessível: o cabeçalho (mesmo oculto no trilho, o aria-labelledby o lê); sem ele um aria-label do usuário fica.
    if (label !== null && this.headingEl) {
      if (this.getAttribute("aria-labelledby") !== this.headingId) this.setAttribute("aria-labelledby", this.headingId);
      this.appliedLabelledBy = this.headingId;
    } else if (this.appliedLabelledBy && this.getAttribute("aria-labelledby") === this.appliedLabelledBy) {
      this.removeAttribute("aria-labelledby");
      this.appliedLabelledBy = null;
    }

    let host: string;
    if (variant !== "sidebar") {
      host = "ark:contents";
    } else if (rail) {
      host = "ark:mt-1 ark:flex ark:shrink-0 ark:flex-col ark:gap-0.5 ark:border-t ark:border-border ark:pt-1";
    } else {
      host = "ark:flex ark:shrink-0 ark:flex-col ark:gap-0.5";
    }
    this.applyOwnClasses(host.split(" "));

    applyTestHooks(this, "nav-group", this);
    if (this.headingEl) applyTestHooks(this, "nav-group", this.headingEl, "heading");
  }
}

export default ArkNavGroup;
