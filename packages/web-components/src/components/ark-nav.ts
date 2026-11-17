import {
  type ArkIntent,
  type ArkLocale,
  type ArkNavCollapsible,
  type ArkNavSide,
  type ArkNavVariant,
  type ArkSize,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Atributos do nav propagados a cada item e grupo. */
const PROPAGATED_ATTRS = ["variant", "size", "intent", "theme"];

/** Chevron do botão de recolher (chrome próprio do componente), apontando para a borda em que a sidebar encosta. */
const CHEVRON_SVG = `
  <svg class="ark:h-4 ark:w-4 ark:shrink-0 ark:transition-transform" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12.5 5l-5 5 5 5"></path>
  </svg>`;

/**
 * Navegação do app. O PRÓPRIO host é o `role="navigation"` (classes, largura,
 * borda): os `ark-nav-item` e `ark-nav-group` do usuário ficam onde estão, um
 * filho `slot="header"` (logo) vai ao início e um `slot="footer"` (avatar,
 * seletor) ao fim, por CSS. Três apresentações: `sidebar` (coluna, padrão),
 * `navbar` (barra horizontal) e `tabbar` (abas de rodapé, ícone sobre o
 * texto). Na sidebar o cabeçalho, o rodapé e o botão de recolher ficam presos
 * nas pontas e só os itens rolam entre eles. Recolhida (`collapsed`) ela vira
 * um trilho de ícones ou, com `collapsible="hidden"`, só o logo e o botão de
 * expandir; `collapsible` também desenha o botão de recolher e o clique nele
 * emite `ark-collapse`. A navbar recolhida fica só com ícones (sem botão).
 * `value` marca o item atual pelo `value` (ou `href`) dele; o `ark-navigate`
 * cancelável de cada item sobe pelo host sem ser consolidado. O app posiciona
 * o componente (grid, `position: fixed` no tabbar): ele não faz layout de
 * página.
 */
export class ArkNav extends HTMLElementBase {
  static readonly tagName = "ark-nav";

  private observer: MutationObserver | null = null;
  private toggleEl: HTMLButtonElement | null = null;
  private toggleLabelEl: HTMLSpanElement | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** `aria-label` que o próprio componente escreveu a partir de `label`, para não apagar um do usuário. */
  private appliedLabel: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "variant",
      "side",
      "value",
      "collapsed",
      "collapsible",
      "label",
      "size",
      "intent",
      "theme",
      "lang",
      "locale-json",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.observer) {
      // Itens, grupos e slots que chegam depois (frameworks) ganham os atributos propagados e os hooks.
      this.observer = new MutationObserver(() => this.syncChildren());
      this.observer.observe(this, { childList: true, subtree: true });
    }
    this.updateAppearance();
    this.syncChildren();
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
    this.syncChildren();
  }

  /** sidebar (coluna), navbar (barra) ou tabbar (abas de rodapé). Padrão: "sidebar". */
  get variant(): ArkNavVariant {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "navbar" || variant === "tabbar" ? variant : "sidebar";
  }

  set variant(value: ArkNavVariant | null | undefined) {
    reflectAttr(this, "variant", value);
  }

  /** Borda em que a sidebar encosta (borda desenhada e direção do chevron). Padrão: "left". */
  get side(): ArkNavSide {
    return (this.getAttribute("side") || "").toLowerCase() === "right" ? "right" : "left";
  }

  set side(value: ArkNavSide | null | undefined) {
    reflectAttr(this, "side", value);
  }

  /** `value` (ou `href`) do item atual; sem o atributo cada item mantém o próprio `current`. */
  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value);
  }

  /** Sidebar recolhida (atributo `collapsed`). */
  get collapsed(): boolean {
    return this.hasAttribute("collapsed");
  }

  set collapsed(value: boolean | string | null | undefined) {
    this.toggleAttribute("collapsed", coerceBooleanAttr(value));
  }

  /** Botão de recolher e o que resta recolhida: "rail" (ícones) ou "hidden" (só o logo). `null` sem o atributo. */
  get collapsible(): ArkNavCollapsible | null {
    if (!this.hasAttribute("collapsible")) return null;
    return (this.getAttribute("collapsible") || "").toLowerCase() === "hidden" ? "hidden" : "rail";
  }

  set collapsible(value: ArkNavCollapsible | boolean | string | null | undefined) {
    // true/"" ligam o trilho (como o atributo vazio); false e null tiram o botão.
    if (value === null || value === undefined || value === false) {
      this.removeAttribute("collapsible");
    } else {
      this.setAttribute("collapsible", value === true ? "" : String(value));
    }
  }

  /** Nome acessível da navegação (`aria-label`), para distinguir vários `role="navigation"` na página. */
  get label(): string | null {
    return this.getAttribute("label");
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value);
  }

  /** Recolhe ou expande a sidebar e emite `ark-collapse` com `detail: { collapsed }`, como o botão faz. */
  toggle(): void {
    const collapsed = !this.collapsed;
    this.toggleAttribute("collapsed", collapsed);
    this.dispatchEvent(new CustomEvent("ark-collapse", { detail: { collapsed }, bubbles: true, composed: true }));
  }

  // --- Estado ---

  /** Trilho (só ícones): a sidebar recolhida sem `collapsible="hidden"`, ou a navbar recolhida; o tabbar não recolhe. */
  private isRail(): boolean {
    if (!this.collapsed) return false;
    const variant = this.variant;
    if (variant === "tabbar") return false;
    return variant === "navbar" || this.collapsible !== "hidden";
  }

  /** Só o cabeçalho e o botão: sidebar recolhida com `collapsible="hidden"`. */
  private isHidden(): boolean {
    return this.variant === "sidebar" && this.collapsed && this.collapsible === "hidden";
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getItems(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("ark-nav-item")).filter(
      (item) => item.closest("ark-nav") === this
    );
  }

  private getGroups(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("ark-nav-group")).filter(
      (group) => group.closest("ark-nav") === this
    );
  }

  /** Propaga variant/size/intent/theme e o estado de trilho a itens e grupos, marca o atual e os slots. */
  private syncChildren(): void {
    const rail = this.isRail();
    const value = this.getAttribute("value");
    const items = this.getItems();

    for (const el of [...items, ...this.getGroups()]) {
      for (const name of PROPAGATED_ATTRS) {
        const next = this.getAttribute(name);
        if (next === null) {
          el.removeAttribute(name);
        } else if (el.getAttribute(name) !== next) {
          el.setAttribute(name, next);
        }
      }
      if (el.hasAttribute("data-ark-rail") !== rail) el.toggleAttribute("data-ark-rail", rail);
    }

    // Com `value`, o nav é a fonte do item atual: o item cujo value (ou href) coincide ganha `current`.
    if (value !== null) {
      for (const item of items) {
        const own = item.getAttribute("value") ?? item.getAttribute("href") ?? "";
        const current = value !== "" && own === value;
        if (item.hasAttribute("current") !== current) item.toggleAttribute("current", current);
      }
    }

    const header = this.querySelector<HTMLElement>(':scope > [slot="header"]');
    if (header) applyTestHooks(this, "nav", header, "header");
    const footer = this.querySelector<HTMLElement>(':scope > [slot="footer"]');
    if (footer) applyTestHooks(this, "nav", footer, "footer");
  }

  // --- Aparência ---

  // Botão de recolher: nó próprio ao fim do host (o CSS o põe depois do rodapé), só na sidebar com `collapsible`.
  private syncToggle(active: boolean, collapsed: boolean, ring: string): void {
    if (!active) {
      this.toggleEl?.remove();
      this.toggleEl = null;
      this.toggleLabelEl = null;
      return;
    }

    if (!this.toggleEl) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-ark-chrome", "toggle");
      button.innerHTML = CHEVRON_SVG;
      const label = document.createElement("span");
      button.appendChild(label);
      button.addEventListener("click", () => this.toggle());
      this.appendChild(button);
      this.toggleEl = button;
      this.toggleLabelEl = label;
    }

    const locale = this.getLocale();
    const text = collapsed ? locale.expand : locale.collapse;
    const sizes: Record<ArkSize, string> = {
      xs: "ark:min-h-(--ark-size-xs) ark:gap-2 ark:px-2 ark:text-xs",
      sm: "ark:min-h-(--ark-size-sm) ark:gap-2 ark:px-2.5 ark:text-xs",
      md: "ark:min-h-(--ark-size-md) ark:gap-3 ark:px-3 ark:text-sm",
      lg: "ark:min-h-(--ark-size-lg) ark:gap-3 ark:px-3.5 ark:text-base",
      xl: "ark:min-h-(--ark-size-xl) ark:gap-3 ark:px-4 ark:text-lg"
    };
    const size = sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;

    this.toggleEl.className = [
      "ark:flex ark:w-full ark:shrink-0 ark:cursor-pointer ark:items-center ark:rounded-md ark:font-medium ark:text-fg-muted ark:transition-colors ark:outline-none ark:ring-inset ark:hover:bg-surface-muted ark:hover:text-fg ark:focus-visible:ring-2",
      ring,
      size,
      collapsed ? "ark:justify-center ark:gap-0 ark:px-0" : ""
    ]
      .join(" ")
      .trim();
    this.toggleEl.setAttribute("aria-label", text);
    this.toggleEl.title = text;
    this.toggleEl.setAttribute("aria-expanded", collapsed ? "false" : "true");
    // O chevron aponta para onde a sidebar vai: para a própria borda ao recolher, para o conteúdo ao expandir.
    const towardsEdge = this.side === "left" ? !collapsed : collapsed;
    this.toggleEl.querySelector("svg")?.classList.toggle("ark:rotate-180", !towardsEdge);

    if (this.toggleLabelEl) {
      this.toggleLabelEl.textContent = text;
      this.toggleLabelEl.className = collapsed ? "ark:hidden" : "ark:truncate";
    }
  }

  private computeClasses(): string[] {
    const variant = this.variant;
    const base = "ark:relative ark:flex ark:border-border ark:bg-surface ark:text-fg";

    if (variant === "navbar") {
      return `${base} ark:flex-row ark:items-center ark:gap-1 ark:overflow-x-auto ark:border-b ark:px-3 ark:py-1.5`.split(
        " "
      );
    }
    if (variant === "tabbar") {
      return `${base} ark:flex-row ark:items-stretch ark:border-t`.split(" ");
    }

    // Sidebar: coluna rolável; a largura vem das custom properties (components.css), com transição pelos tokens.
    return [
      base,
      "ark:shrink-0 ark:flex-col ark:gap-0.5 ark:overflow-x-hidden ark:overflow-y-auto ark:overscroll-contain ark:p-2",
      this.side === "right" ? "ark:border-l" : "ark:border-r",
      this.collapsed ? "ark:w-(--ark-nav-rail-width)" : "ark:w-(--ark-nav-width)"
    ]
      .join(" ")
      .split(" ");
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
    const variant = this.variant;
    const collapsed = this.collapsed;

    this.setAttribute("role", "navigation");
    const label = this.getAttribute("label");
    if (label) {
      if (this.getAttribute("aria-label") !== label) this.setAttribute("aria-label", label);
      this.appliedLabel = label;
    } else if (this.appliedLabel !== null && this.getAttribute("aria-label") === this.appliedLabel) {
      this.removeAttribute("aria-label");
      this.appliedLabel = null;
    }

    // Estado para o components.css (ordem dos slots, largura, o que some em `hidden`).
    this.setAttribute("data-ark-variant", variant);
    this.setAttribute("data-ark-side", this.side);
    this.toggleAttribute("data-ark-rail", this.isRail());
    this.toggleAttribute("data-ark-hidden", this.isHidden());

    this.syncToggle(variant === "sidebar" && this.collapsible !== null, collapsed, this.ringClass());

    this.applyOwnClasses(this.computeClasses());

    applyTestHooks(this, "nav", this);
    if (this.toggleEl) applyTestHooks(this, "nav", this.toggleEl, "toggle");
  }

  // Anel de foco do botão de recolher no intent do nav (strings completas, para o Tailwind gerá-las).
  private ringClass(): string {
    const rings: Record<ArkIntent, string> = {
      primary: "ark:ring-primary-ring",
      secondary: "ark:ring-secondary-ring",
      success: "ark:ring-success-ring",
      warning: "ark:ring-warning-ring",
      danger: "ark:ring-danger-ring",
      info: "ark:ring-info-ring",
      neutral: "ark:ring-neutral-ring"
    };
    return rings[normalizeIntent(this.getAttribute("intent"), "primary")];
  }
}

export default ArkNav;
