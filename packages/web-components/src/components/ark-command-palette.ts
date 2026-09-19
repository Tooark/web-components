import { type ArkLocale, closePopover, coerceBooleanAttr, openPopover, resolveLocale, trapFocus } from "@tooark/core";
import { ArkCommandItem } from "./ark-command-item";
import type { ArkInput } from "./ark-input";
import { applyTestHooks } from "./test-hooks";

let paletteSeq = 0;

type ArkPaletteState = "closed" | "open" | "closing";

/** Texto comparável no filtro: minúsculas, sem acentos. */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * Paleta de comandos. O PRÓPRIO host é o painel (`popover="manual"`,
 * `role="dialog"`, scrim, trap de foco, Esc), centrado no topo. Os filhos
 * `ark-command-item` do usuário ficam onde estão; o componente põe o próprio
 * chrome nas pontas: o campo de busca (um ark-input, `role="combobox"`,
 * sticky) no início e, ao fim, um cabeçalho por `group`, a mensagem de vazio
 * e um listbox oculto que é dono das opções visíveis por `aria-owns`. Itens
 * e cabeçalhos se ordenam por `order` no CSS, então nada é inserido entre os
 * filhos. Com `filter` o texto filtra localmente pelo `label` dos itens; em
 * qualquer caso `ark-query` sai com debounce para busca assíncrona. O foco
 * fica sempre no campo; setas movem a opção ativa (`aria-activedescendant`),
 * Enter seleciona, Esc fecha; `hotkey` abre de qualquer lugar da página.
 */
export class ArkCommandPalette extends HTMLElement {
  static readonly tagName = "ark-command-palette";

  private inputEl: ArkInput | null = null;
  private listEl: HTMLDivElement | null = null;
  private emptyEl: HTMLParagraphElement | null = null;
  private groupEls: HTMLDivElement[] = [];
  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private state: ArkPaletteState = "closed";
  private releaseTrap: (() => void) | null = null;
  private queryTimer: number | null = null;
  private activeId: string | null = null;
  private warned = false;
  private readonly seq = ++paletteSeq;

  static get observedAttributes(): string[] {
    return [
      "open",
      "placeholder",
      "hotkey",
      "filter",
      "query-delay",
      "label",
      "theme",
      "lang",
      "locale-json",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("pointerover", this.handlePointerOver);
    this.addEventListener("ark-select", this.handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    if (!this.inputEl) this.render();
    if (!this.observer) {
      // Itens que entram ou saem (busca assíncrona, frameworks) reordenam a lista.
      this.observer = new MutationObserver(() => this.syncItems());
      this.observer.observe(this, { childList: true });
    }
    document.addEventListener("keydown", this.handleHotkey);
    this.updateAppearance();
    if (this.hasAttribute("open")) this.openNow();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    document.removeEventListener("keydown", this.handleHotkey);
    if (this.queryTimer !== null) window.clearTimeout(this.queryTimer);
    this.queryTimer = null;
    this.releaseTrap?.();
    this.releaseTrap = null;
    this.state = "closed";
    this.removeAttribute("data-ark-state");
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;

    if (name === "open") {
      if (this.hasAttribute("open")) {
        this.openNow();
      } else {
        this.closeNow();
      }
      return;
    }
    this.updateAppearance();
    if (name === "filter") this.syncItems();
  }

  /** Aberta (atributo `open`). */
  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean | string | null | undefined) {
    const next = coerceBooleanAttr(value);
    if (next) {
      this.show();
    } else {
      this.close();
    }
  }

  /** Texto atual do campo de busca. */
  get query(): string {
    return this.inputEl?.value ?? "";
  }

  set query(value: string) {
    if (this.inputEl) {
      this.inputEl.value = value;
      this.syncItems();
    }
  }

  /** Debounce de `ark-query` em ms. Padrão: 150. */
  get queryDelay(): number {
    const raw = Number(this.getAttribute("query-delay"));
    return this.hasAttribute("query-delay") && Number.isFinite(raw) && raw >= 0 ? raw : 150;
  }

  show(): void {
    if (!this.open) this.setAttribute("open", "");
  }

  close(): void {
    if (this.open) this.removeAttribute("open");
  }

  // --- Itens ---

  /** Os ark-command-item filhos diretos, na ordem do DOM. */
  private items(): ArkCommandItem[] {
    return Array.from(this.querySelectorAll(":scope > ark-command-item")).filter(
      (el): el is ArkCommandItem => el instanceof ArkCommandItem
    );
  }

  private visibleItems(): ArkCommandItem[] {
    return this.items().filter((item) => !item.hidden);
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  // Filtra, agrupa e ordena: itens visíveis ganham `order` (grupo × 1000 + posição), cabeçalhos próprios
  // ganham o `order` do início do grupo, o listbox oculto recebe os ids visíveis e a ativa é revalidada.
  private syncItems(): void {
    if (!this.listEl || !this.emptyEl) return;
    const query = normalize(this.query);
    const filter = this.hasAttribute("filter");
    const items = this.items();
    const groups: string[] = [];
    const counts = new Map<string, number>();
    const visible: ArkCommandItem[] = [];

    items.forEach((item, index) => {
      if (!item.id) item.id = `ark-command-palette-${this.seq}-item-${index}`;
      const match = !filter || !query || normalize(item.label).includes(query);
      item.hidden = !match;
      if (!match) return;
      visible.push(item);
      const group = item.group;
      if (group && !groups.includes(group)) groups.push(group);
      const base = group ? groups.indexOf(group) + 1 : 0;
      const position = counts.get(group) ?? 0;
      counts.set(group, position + 1);
      item.style.order = String(base * 1000 + position + 1);
    });

    // Um cabeçalho por grupo com itens visíveis, ao fim do host, ordenado antes dos próprios itens.
    while (this.groupEls.length > groups.length) this.groupEls.pop()?.remove();
    while (this.groupEls.length < groups.length) {
      const header = document.createElement("div");
      header.setAttribute("data-ark-chrome", "group");
      header.setAttribute("aria-hidden", "true");
      this.appendChild(header);
      this.groupEls.push(header);
    }
    groups.forEach((group, index) => {
      const header = this.groupEls[index];
      header.textContent = group;
      header.style.order = String((index + 1) * 1000);
      applyTestHooks(this, "command-palette", header, "group");
    });

    this.listEl.setAttribute("aria-owns", visible.map((item) => item.id).join(" "));
    this.emptyEl.hidden = visible.length > 0;
    this.emptyEl.textContent = this.getLocale().noResults;

    const enabled = visible.filter((item) => !item.disabled);
    if (!enabled.some((item) => item.id === this.activeId)) this.activeId = enabled[0]?.id ?? null;
    this.applyActive(items);
  }

  private applyActive(items: ArkCommandItem[]): void {
    for (const item of items) {
      const active = item.id === this.activeId;
      item.setAttribute("aria-selected", active ? "true" : "false");
      item.toggleAttribute("data-ark-active", active);
    }
    const field = this.inputEl?.inputElement;
    if (!field) return;
    if (this.activeId) {
      field.setAttribute("aria-activedescendant", this.activeId);
    } else {
      field.removeAttribute("aria-activedescendant");
    }
  }

  private setActive(item: ArkCommandItem | null, scroll = false): void {
    this.activeId = item?.id ?? null;
    this.applyActive(this.items());
    if (scroll && item) item.scrollIntoView({ block: "nearest" });
  }

  private moveActive(step: number, edge?: "start" | "end"): void {
    const enabled = this.visibleItems().filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    let next: number;
    if (edge === "start") {
      next = 0;
    } else if (edge === "end") {
      next = enabled.length - 1;
    } else {
      const current = enabled.findIndex((item) => item.id === this.activeId);
      next = current < 0 ? (step > 0 ? 0 : enabled.length - 1) : (current + step + enabled.length) % enabled.length;
    }
    this.setActive(enabled[next], true);
  }

  // --- Interação ---

  private readonly handleInput = (): void => {
    this.syncItems();
    if (this.queryTimer !== null) window.clearTimeout(this.queryTimer);
    const query = this.query;
    this.queryTimer = window.setTimeout(() => {
      this.queryTimer = null;
      this.dispatchEvent(new CustomEvent("ark-query", { detail: { query }, bubbles: true, composed: true }));
    }, this.queryDelay);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.state !== "open") return;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        this.moveActive(0, "start");
        break;
      case "End":
        event.preventDefault();
        this.moveActive(0, "end");
        break;
      case "Enter": {
        event.preventDefault();
        const active = this.visibleItems().find((item) => item.id === this.activeId);
        active?.select();
        break;
      }
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
    }
  };

  private readonly handlePointerOver = (event: PointerEvent): void => {
    const item = (event.target as Element | null)?.closest("ark-command-item");
    if (item instanceof ArkCommandItem && !item.disabled && !item.hidden && item.id !== this.activeId) {
      this.setActive(item);
    }
  };

  // O ark-select do item não vaza: a paleta consolida, publica o próprio e fecha.
  private readonly handleItemSelect = (event: CustomEvent<{ value: string }>): void => {
    if (event.target === this) return;
    event.stopImmediatePropagation();
    const value = event.detail?.value ?? "";
    this.dispatchEvent(new CustomEvent("ark-select", { detail: { value }, bubbles: true, composed: true }));
    this.close();
  };

  // Atalho global ("/", "mod+k", "ctrl+shift+p"); ignorado com o foco num campo de texto enquanto fechada.
  private readonly handleHotkey = (event: KeyboardEvent): void => {
    const hotkey = (this.getAttribute("hotkey") || "").trim().toLowerCase();
    if (!hotkey || event.defaultPrevented) return;
    const parts = hotkey.split("+").map((part) => part.trim());
    const key = parts.pop() || "";
    const wantMod = parts.includes("mod");
    const wantCtrl = parts.includes("ctrl") || parts.includes("control");
    const wantMeta = parts.includes("meta") || parts.includes("cmd");
    const wantAlt = parts.includes("alt");
    const wantShift = parts.includes("shift");
    const modOk = wantMod ? event.ctrlKey || event.metaKey : true;
    if (!modOk) return;
    if (wantCtrl !== event.ctrlKey && !wantMod) return;
    if (wantMeta !== event.metaKey && !wantMod) return;
    if (wantAlt !== event.altKey) return;
    if (wantShift !== event.shiftKey) return;
    if (event.key.toLowerCase() !== key) return;

    if (this.state !== "open") {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    }
    event.preventDefault();
    if (this.state === "open") {
      this.close();
    } else {
      this.show();
    }
  };

  // --- Abertura e fechamento ---

  private openNow(): void {
    if (this.state === "open") return;
    this.state = "open";
    this.setAttribute("data-ark-state", "open");
    this.updateAppearance();
    this.warnWithoutName();
    this.syncItems();

    void openPopover(this, "scale");
    const field = this.inputEl?.inputElement ?? null;
    this.releaseTrap?.();
    this.releaseTrap = trapFocus(this, {
      initial: field ?? this,
      onOutsidePointer: () => this.close()
    });
    field?.select();
    this.inputEl?.inputElement?.setAttribute("aria-expanded", "true");

    this.dispatchEvent(new CustomEvent("ark-open", { bubbles: true, composed: true }));
  }

  private closeNow(): void {
    if (this.state !== "open") return;
    this.state = "closing";
    this.setAttribute("data-ark-state", "closing");
    this.releaseTrap?.();
    this.releaseTrap = null;
    this.inputEl?.inputElement?.setAttribute("aria-expanded", "false");

    this.dispatchEvent(new CustomEvent("ark-close", { bubbles: true, composed: true }));

    void closePopover(this, "fade").then(() => {
      if (this.state !== "closing") return;
      this.state = "closed";
      this.removeAttribute("data-ark-state");
    });
  }

  private warnWithoutName(): void {
    if (this.warned || this.hasAttribute("label") || this.hasAttribute("aria-label")) return;
    if (this.hasAttribute("aria-labelledby")) return;
    this.warned = true;
    console.warn(
      "[ark-command-palette] sem `label`, `aria-label` ou `aria-labelledby`: a paleta fica sem nome acessível.",
      this
    );
  }

  // --- Aparência ---

  private render(): void {
    const listId = `ark-command-palette-${this.seq}-list`;

    // Campo de busca: um ark-input próprio no início do host; o <input> interno vira o combobox.
    const input = document.createElement("ark-input") as ArkInput;
    input.setAttribute("data-ark-chrome", "input");
    input.setAttribute("type", "search");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("spellcheck", "false");
    input.addEventListener("input", this.handleInput);
    this.prepend(input);
    const field = input.inputElement;
    if (field) {
      field.setAttribute("role", "combobox");
      field.setAttribute("aria-autocomplete", "list");
      field.setAttribute("aria-controls", listId);
      field.setAttribute("aria-expanded", "false");
    }

    const list = document.createElement("div");
    list.id = listId;
    list.setAttribute("role", "listbox");
    list.setAttribute("data-ark-chrome", "list");

    const empty = document.createElement("p");
    empty.setAttribute("data-ark-chrome", "empty");
    empty.hidden = true;

    this.append(list, empty);
    this.inputEl = input;
    this.listEl = list;
    this.emptyEl = empty;
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
    if (!this.inputEl || !this.listEl || !this.emptyEl) return;
    const locale = this.getLocale();

    this.setAttribute("popover", "manual");
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
    this.setAttribute("tabindex", "-1");
    const label = this.getAttribute("label");
    if (label && this.getAttribute("aria-label") !== label) this.setAttribute("aria-label", label);

    // Redefine o UA de [popover]; o display vem do components.css. Painel centrado no topo, rolável.
    this.applyOwnClasses(
      "ark:fixed ark:inset-x-0 ark:top-[15vh] ark:bottom-auto ark:mx-auto ark:my-0 ark:w-[min(40rem,calc(100%-2rem))] ark:max-h-[min(60vh,32rem)] ark:overflow-y-auto ark:overscroll-contain ark:rounded-xl ark:border ark:border-border ark:bg-surface ark:p-0 ark:pb-2 ark:text-fg ark:shadow-xl ark:outline-none".split(
        " "
      )
    );

    this.inputEl.setAttribute("placeholder", this.getAttribute("placeholder") || locale.search);
    this.inputEl.setAttribute("aria-label", this.getAttribute("placeholder") || locale.search);
    for (const attr of ["theme", "lang", "locale-json"]) {
      const value = this.getAttribute(attr);
      if (value) {
        this.inputEl.setAttribute(attr, value);
      } else {
        this.inputEl.removeAttribute(attr);
      }
    }
    this.emptyEl.textContent = locale.noResults;

    applyTestHooks(this, "command-palette", this);
    applyTestHooks(this, "command-palette", this.inputEl, "input");
    applyTestHooks(this, "command-palette", this.listEl, "list");
    applyTestHooks(this, "command-palette", this.emptyEl, "empty");
  }
}

export default ArkCommandPalette;
