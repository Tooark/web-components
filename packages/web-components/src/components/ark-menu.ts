import { type ArkAnchorRect, coerceBooleanAttr, positionAnchored } from "@tooark/core";
import type { ArkMenuItem } from "./ark-menu-item";
import { applyTestHooks } from "./test-hooks";

/** Atributos do menu propagados a cada item. */
const PROPAGATED_ATTRS = ["size", "theme"];

/** Contador para ids gerados (do menu, para `aria-controls`; do gatilho, para `aria-labelledby`). */
let menuSeq = 0;

/**
 * Menu suspenso ou de contexto. O PRÓPRIO host é o painel (`role="menu"`),
 * aberto como `popover="auto"` (top layer, light dismiss e Esc nativos, sem
 * portal nem z-index): os itens `ark-menu-item` do usuário ficam onde estão.
 * O gatilho é referenciado por `for="<id>"`: o componente só escreve `aria-*`
 * nele (haspopup, expanded, controls), escuta clique e setas, e nomeia o menu
 * por ele. `openAt(x, y)` abre num ponto (menu de contexto).
 *
 * Posicionado por JS (`positionAnchored` de core) a partir do
 * `getBoundingClientRect()` do gatilho, com flip quando não cabe. A entrada e
 * a saída são transições CSS em components.css, porque o light dismiss de um
 * popover auto não pode ser interceptado por JS para animar antes de esconder.
 */
export class ArkMenu extends HTMLElement {
  static readonly tagName = "ark-menu";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private childObserver: MutationObserver | null = null;
  private triggerObserver: MutationObserver | null = null;
  /** Gatilho com o `aria-*` e os listeners do componente, para limpar ao trocar ou desconectar. */
  private trigger: HTMLElement | null = null;
  /** Estado real do popover; `open` é refletido a partir dele. */
  private isOpen = false;
  private syncingOpen = false;
  private disposePosition: (() => void) | null = null;
  /** Ponto de `openAt`, usado como âncora no lugar do gatilho enquanto aberto. */
  private pointAnchor: ArkAnchorRect | null = null;
  /** Com o menu aberto, o pointerdown no gatilho já fecha por light dismiss; o click que segue não deve reabrir. */
  private suppressTriggerClick = false;

  static get observedAttributes(): string[] {
    return ["for", "open", "align", "direction", "size", "theme", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("ark-select", this.handleItemSelect);
    this.addEventListener("beforetoggle", this.handleBeforeToggle);
    this.addEventListener("toggle", this.handleToggle);
  }

  connectedCallback(): void {
    if (!this.id) this.id = `ark-menu-${++menuSeq}`;
    if (!this.childObserver) {
      this.childObserver = new MutationObserver(() => this.syncItems());
      this.childObserver.observe(this, { childList: true, subtree: true });
    }
    this.updateAppearance();
    this.syncItems();
    this.resolveTrigger();
    if (this.hasAttribute("open")) this.show();
  }

  disconnectedCallback(): void {
    this.childObserver?.disconnect();
    this.childObserver = null;
    this.triggerObserver?.disconnect();
    this.triggerObserver = null;
    this.wireTrigger(null);
    // Fora do DOM o navegador já escondeu o popover, sem eventos.
    this.disposePosition?.();
    this.disposePosition = null;
    document.removeEventListener("pointerdown", this.handleOutsidePointer, true);
    this.isOpen = false;
    this.pointAnchor = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;

    if (name === "for") {
      this.resolveTrigger();
      return;
    }
    if (name === "open") {
      if (this.syncingOpen) return;
      if (this.hasAttribute("open")) {
        this.show();
      } else {
        this.hide();
      }
      return;
    }

    this.updateAppearance();
    this.syncItems();
    if (this.isOpen && (name === "align" || name === "direction")) this.place();
  }

  /** Aberto (atributo `open`, refletido do estado do popover). */
  get open(): boolean {
    return this.isOpen;
  }

  set open(value: boolean | string | null | undefined) {
    const next = coerceBooleanAttr(value);
    if (next) {
      this.show();
    } else {
      this.hide();
    }
  }

  /** Abre ancorado ao gatilho (`for`). */
  show(): void {
    if (this.isOpen || !this.isConnected) return;
    this.pointAnchor = null;
    this.setPopoverMode("auto");
    this.showNow();
  }

  /** Fecha; o foco volta ao gatilho se estava no menu. */
  hide(): void {
    if (!this.isOpen) return;
    try {
      this.hidePopover();
    } catch {
      // Já escondido (light dismiss): só sincroniza o estado.
    }
    this.syncOpenState(false);
  }

  /**
   * Abre num ponto da viewport (menu de contexto), reposicionando para caber. Enquanto aberto assim o popover é
   * `manual`, com o fechamento por clique fora feito pelo componente: no Mac o `contextmenu` dispara no
   * mousedown e o pointerup seguinte faria o light dismiss fechar o menu na hora.
   */
  openAt(x: number, y: number): void {
    if (!this.isConnected) return;
    this.pointAnchor = { x, y, width: 0, height: 0 };
    if (this.isOpen) {
      this.place();
      return;
    }
    this.setPopoverMode("manual");
    document.addEventListener("pointerdown", this.handleOutsidePointer, true);
    this.showNow();
  }

  // --- Estado do popover ---

  private setPopoverMode(mode: "auto" | "manual"): void {
    if (this.getAttribute("popover") !== mode) this.setAttribute("popover", mode);
  }

  private showNow(): void {
    try {
      this.showPopover();
    } catch {
      return;
    }
    this.syncOpenState(true);
  }

  /** Único ponto que muda o estado: chamado por show/hide e pelo `toggle` (light dismiss, popovertarget). */
  private syncOpenState(open: boolean): void {
    if (open === this.isOpen) return;
    this.isOpen = open;
    this.syncingOpen = true;
    this.toggleAttribute("open", open);
    this.syncingOpen = false;
    this.trigger?.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      this.place();
      this.focusItem(this.enabledItems()[0]);
      this.dispatchEvent(new CustomEvent("ark-open", { bubbles: true, composed: true }));
      return;
    }

    this.disposePosition?.();
    this.disposePosition = null;
    this.pointAnchor = null;
    document.removeEventListener("pointerdown", this.handleOutsidePointer, true);
    this.setPopoverMode("auto");

    // Foco de volta ao gatilho quando estava no menu (ou em lugar nenhum), como o Esc nativo faria.
    const active = document.activeElement;
    if ((!active || active === document.body || this.contains(active)) && this.trigger?.isConnected) {
      this.trigger.focus();
    }
    this.dispatchEvent(new CustomEvent("ark-close", { bubbles: true, composed: true }));
  }

  // O popover já está visível no microtask seguinte ao beforetoggle, antes da primeira pintura: mede e posiciona
  // também quando quem abriu foi o navegador (popovertarget) e não show().
  private readonly handleBeforeToggle = (event: Event): void => {
    if ((event as ToggleEvent).newState !== "open") return;
    queueMicrotask(() => {
      if (this.isPopoverOpen()) this.place();
    });
  };

  private readonly handleToggle = (event: Event): void => {
    this.syncOpenState((event as ToggleEvent).newState === "open");
  };

  private isPopoverOpen(): boolean {
    try {
      return this.matches(":popover-open");
    } catch {
      return false;
    }
  }

  private place(): void {
    this.disposePosition?.();
    this.disposePosition = null;
    const anchor = this.pointAnchor ?? this.trigger;
    if (!anchor) return;

    const side = (this.getAttribute("direction") || "").toLowerCase() === "up" ? "top" : "bottom";
    const align = (this.getAttribute("align") || "").toLowerCase() === "end" ? "end" : "start";
    this.disposePosition = positionAnchored(this, anchor, { side, align, offset: this.pointAnchor ? 0 : 4 });
  }

  // Só no modo manual (openAt): clique fora fecha, como o light dismiss faria.
  private readonly handleOutsidePointer = (event: Event): void => {
    const target = event.target;
    if (target instanceof Node && this.contains(target)) return;
    this.hide();
  };

  // --- Gatilho ---

  private resolveTrigger(): void {
    const id = this.getAttribute("for");
    const root = this.getRootNode() as Document | ShadowRoot;
    const found = id && typeof root.getElementById === "function" ? root.getElementById(id) : null;
    this.wireTrigger(found instanceof HTMLElement ? found : null);

    if (id && !found) {
      // O gatilho pode montar depois do menu (frameworks): observa a raiz até ele aparecer.
      if (!this.triggerObserver) {
        this.triggerObserver = new MutationObserver(() => this.resolveTrigger());
        this.triggerObserver.observe(root, { childList: true, subtree: true });
      }
      return;
    }
    this.triggerObserver?.disconnect();
    this.triggerObserver = null;
  }

  private wireTrigger(next: HTMLElement | null): void {
    const current = this.trigger;
    if (next === current) return;

    if (current) {
      current.removeEventListener("click", this.handleTriggerClick);
      current.removeEventListener("keydown", this.handleTriggerKeydown);
      current.removeEventListener("pointerdown", this.handleTriggerPointerdown);
      current.removeAttribute("aria-haspopup");
      current.removeAttribute("aria-expanded");
      current.removeAttribute("aria-controls");
      if (this.getAttribute("aria-labelledby") === current.id) this.removeAttribute("aria-labelledby");
    }

    this.trigger = next;
    if (!next) return;

    // Exceção ARIA das regras transversais: só aria-* (e um id quando faltar) no gatilho do usuário.
    if (!next.id) next.id = `ark-menu-${++menuSeq}-trigger`;
    next.setAttribute("aria-haspopup", "menu");
    next.setAttribute("aria-expanded", this.isOpen ? "true" : "false");
    next.setAttribute("aria-controls", this.id);
    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
      this.setAttribute("aria-labelledby", next.id);
    }
    next.addEventListener("click", this.handleTriggerClick);
    next.addEventListener("keydown", this.handleTriggerKeydown);
    next.addEventListener("pointerdown", this.handleTriggerPointerdown);
  }

  private readonly handleTriggerPointerdown = (): void => {
    this.suppressTriggerClick = this.isOpen;
  };

  private readonly handleTriggerClick = (): void => {
    const suppress = this.suppressTriggerClick;
    this.suppressTriggerClick = false;
    if (this.isOpen) {
      this.hide();
      return;
    }
    if (suppress) return;
    this.show();
  };

  // Setas no gatilho abrem já com o foco no primeiro (ou último) item.
  private readonly handleTriggerKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!this.isOpen) this.show();
    const items = this.enabledItems();
    this.focusItem(event.key === "ArrowUp" ? items[items.length - 1] : items[0]);
  };

  // --- Itens ---

  private getItems(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("ark-menu-item")).filter(
      (item) => item.closest("ark-menu") === this
    );
  }

  private enabledItems(): HTMLElement[] {
    return this.getItems().filter(
      (item) => !item.hasAttribute("disabled") && !item.hasAttribute("divider") && !item.hasAttribute("static")
    );
  }

  private focusItem(item: HTMLElement | undefined): void {
    item?.focus();
  }

  /** Propaga size/theme aos itens depois de mudanças nos filhos ou nos atributos. */
  private syncItems(): void {
    for (const item of this.getItems()) {
      for (const name of PROPAGATED_ATTRS) {
        const value = this.getAttribute(name);
        if (value === null) {
          item.removeAttribute(name);
        } else if (item.getAttribute(name) !== value) {
          item.setAttribute(name, value);
        }
      }
    }
  }

  // O ark-select do item não vaza: o menu consolida, publica o próprio e fecha em seguida. Imediata porque
  // quem escuta no próprio host (wrappers) foi registrado depois deste listener e ainda receberia o do item.
  private readonly handleItemSelect = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target || target === this || target.tagName.toLowerCase() !== "ark-menu-item") return;
    event.stopImmediatePropagation();

    const value = (target as ArkMenuItem).value ?? target.getAttribute("value") ?? "";
    this.dispatchEvent(new CustomEvent("ark-select", { detail: { value }, bubbles: true, composed: true }));
    this.hide();
  };

  // Setas com ciclo, Home e End entre os itens habilitados; Esc fecha; Tab fecha e segue do gatilho.
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.hide();
      return;
    }
    if (event.key === "Tab") {
      this.hide();
      return;
    }

    const items = this.enabledItems();
    if (items.length === 0) return;
    const current = (event.target as HTMLElement | null)?.closest<HTMLElement>("ark-menu-item") ?? null;
    const index = current ? items.indexOf(current) : -1;

    let next: HTMLElement | undefined;
    if (event.key === "ArrowDown") next = index < 0 ? items[0] : items[(index + 1) % items.length];
    else if (event.key === "ArrowUp")
      next = index < 0 ? items[items.length - 1] : items[(index - 1 + items.length) % items.length];
    else if (event.key === "Home") next = items[0];
    else if (event.key === "End") next = items[items.length - 1];
    if (!next) return;

    event.preventDefault();
    this.focusItem(next);
  };

  // --- Aparência ---

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
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "auto");
    this.setAttribute("role", "menu");
    // Focável por script; os itens é que recebem o foco.
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "-1");

    // Redefine o que o UA dá a [popover] (inset, margin, border, padding, overflow, color, background); left/top
    // vêm inline do posicionamento e o display, com as transições, do components.css.
    this.applyOwnClasses(
      "ark:fixed ark:inset-auto ark:m-0 ark:min-w-40 ark:max-w-xs ark:max-h-[calc(100vh-1rem)] ark:overflow-y-auto ark:overscroll-contain ark:rounded-lg ark:border ark:border-border ark:bg-surface ark:p-1 ark:text-fg ark:shadow-lg ark:outline-none".split(
        " "
      )
    );

    applyTestHooks(this, "menu", this);
  }
}

export default ArkMenu;
