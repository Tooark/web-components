import { type ArkTreeSelection, coerceBooleanAttr } from "@tooark/core";
import type { ArkTreeItem } from "./ark-tree-item";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Atributos da árvore propagados a cada item. */
const PROPAGATED_ATTRS = ["size", "theme"];

/** Pausa que encerra uma busca por digitação. */
const TYPEAHEAD_MS = 500;

/** Controles do usuário dentro de um item (no `slot="trailing"`) que ficam com o próprio clique e teclado. */
const OWN_CONTROLS = "a[href], button, input, select, textarea, [contenteditable], [role='button'], [role='link']";

/**
 * Árvore de itens (`role="tree"`). O PRÓPRIO host é a árvore: os
 * `ark-tree-item` do usuário ficam onde estão, aninhados como ele os declarou,
 * e a linha de cada um é o treeitem (árvore plana para a acessibilidade, com
 * nível e posição explícitos). A árvore calcula a estrutura, coordena foco (um
 * tab stop só), teclado do padrão WAI-ARIA, seleção e caixas, e publica os
 * eventos consolidados: `ark-toggle`, `ark-selection-change` e `ark-activate`.
 * Simples por padrão: sem `selection` só navega, expande e ativa.
 */
export class ArkTree extends HTMLElementBase {
  static readonly tagName = "ark-tree";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private observer: MutationObserver | null = null;
  /** Item com o tab stop (roving tabindex). */
  private tabStop: ArkTreeItem | null = null;
  /** Escrevendo `value` a partir da seleção: o attributeChangedCallback não relê. */
  private syncingValue = false;
  /** Itens já vistos, para um filho que chega depois (carga de um `lazy`) herdar a caixa marcada do pai. */
  private known = new WeakSet<ArkTreeItem>();
  private typeahead = "";
  private typeaheadTimer: number | null = null;

  static get observedAttributes(): string[] {
    return ["selection", "checkboxes", "propagate", "value", "label", "size", "theme", "class", "testid"];
  }

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("focusin", this.handleFocusIn);
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.observer) {
      // Itens que entram ou saem (frameworks, carga de um `lazy`) refazem a estrutura.
      this.observer = new MutationObserver(() => this.syncItems());
      this.observer.observe(this, { childList: true, subtree: true });
    }
    this.updateAppearance();
    this.syncItems();
    // O `value` declarado vence o estado dos itens; sem ele, o estado dos itens escreve o `value`.
    if (this.hasAttribute("value")) {
      this.applyValue();
    } else {
      this.syncValue();
    }
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.typeaheadTimer !== null) window.clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    if (name === "value") {
      if (!this.syncingValue) this.applyValue();
      return;
    }
    this.updateAppearance();
    this.syncItems();
  }

  /** none (só navega, expande e ativa), single ou multiple. Padrão: "none". */
  get selection(): ArkTreeSelection {
    const value = (this.getAttribute("selection") || "").toLowerCase();
    return value === "single" || value === "multiple" ? value : "none";
  }

  set selection(value: string | null | undefined) {
    reflectAttr(this, "selection", value || null);
  }

  /** Com `multiple`: uma caixa por nó, que marca em vez de selecionar a linha. */
  get checkboxes(): boolean {
    return this.hasAttribute("checkboxes");
  }

  set checkboxes(value: boolean | string | null | undefined) {
    this.toggleAttribute("checkboxes", coerceBooleanAttr(value));
  }

  /** Com `checkboxes`: marcar um pai marca os descendentes, e o pai fica `mixed` com parte marcada. */
  get propagate(): boolean {
    return this.hasAttribute("propagate");
  }

  set propagate(value: boolean | string | null | undefined) {
    this.toggleAttribute("propagate", coerceBooleanAttr(value));
  }

  /**
   * Valores selecionados (ou marcados, com `checkboxes`): um valor em `single`, lista JSON em `multiple`. O
   * componente o reescreve a cada mudança; atribuir seleciona os itens desses valores.
   */
  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value || null);
  }

  /** Valores selecionados ou marcados, como lista. Atribuir seleciona os itens desses valores. */
  get values(): string[] {
    return this.chosenItems().map((item) => item.value);
  }

  set values(next: string[] | string | null | undefined) {
    const list = typeof next === "string" ? parseValues(next) : (next ?? []);
    this.value = this.selection === "single" ? (list[0] ?? null) : list.length ? JSON.stringify(list) : null;
  }

  /** Todos os itens desta árvore, em ordem de documento. */
  get items(): ArkTreeItem[] {
    return Array.from(this.querySelectorAll<ArkTreeItem>("ark-tree-item")).filter(
      (item) => item.closest("ark-tree") === this
    );
  }

  /** Itens visíveis (nenhum ancestral recolhido), na ordem da tela. */
  get visibleItems(): ArkTreeItem[] {
    return this.items.filter((item) => this.isVisible(item));
  }

  /** Expande ou recolhe um item e publica `ark-toggle` (o `lazy` carrega os filhos ao receber `expanded: true`). */
  toggleItem(item: ArkTreeItem, expanded = !item.expanded): void {
    if (!item.isBranch || item.expanded === expanded) return;
    item.expanded = expanded;
    // Recolher com o foco (ou o tab stop) num descendente devolve os dois ao item recolhido.
    if (!expanded) {
      const focused = (document.activeElement as Element | null)?.closest<ArkTreeItem>("ark-tree-item");
      if (focused && focused !== item && item.contains(focused)) {
        this.focusItem(item);
      } else if (this.tabStop && this.tabStop !== item && item.contains(this.tabStop)) {
        this.setTabStop(item);
      }
    }
    this.dispatchEvent(
      new CustomEvent("ark-toggle", { detail: { value: item.value, expanded, item }, bubbles: true, composed: true })
    );
  }

  /** Leva o foco (e o tab stop) à linha de um item. */
  focusItem(item: ArkTreeItem): void {
    this.setTabStop(item);
    item.rowElement?.focus();
  }

  // --- Estrutura ---

  private isVisible(item: ArkTreeItem): boolean {
    for (let parent = item.parentItem; parent; parent = parent.parentItem) {
      if (!parent.expanded) return false;
    }
    return true;
  }

  private checkMode(): boolean {
    return this.checkboxes && this.selection === "multiple";
  }

  /** Recalcula a estrutura: nível, posição, atributos propagados, caixas herdadas e o tab stop. */
  private syncItems(): void {
    const items = this.items;
    const checkMode = this.checkMode();
    const selectMode = this.selection !== "none" && !checkMode;
    let inherited = false;
    for (const item of items) {
      const parent = item.parentItem;
      const siblings = parent ? parent.childItems : items.filter((other) => other.parentItem === null);
      let level = 1;
      for (let p = parent; p; p = p.parentItem) level += 1;
      // Árvore plana para a acessibilidade: nível, tamanho do conjunto e posição vão explícitos na linha.
      const row = item.rowElement;
      if (row) {
        setAttr(row, "aria-level", String(level));
        setAttr(row, "aria-setsize", String(siblings.length));
        setAttr(row, "aria-posinset", String(siblings.indexOf(item) + 1));
      }
      if (item.style.getPropertyValue("--ark-tree-depth") !== String(level - 1)) {
        item.style.setProperty("--ark-tree-depth", String(level - 1));
      }
      for (const name of PROPAGATED_ATTRS) setAttr(item, name, this.getAttribute(name));
      setAttr(item, "data-ark-select", selectMode ? "" : null);
      setAttr(item, "data-ark-checkboxes", checkMode ? "" : null);
      // Um filho que chega depois sob um pai todo marcado (a carga de um `lazy`) chega marcado, com `propagate`.
      if (!this.known.has(item)) {
        this.known.add(item);
        if (checkMode && this.propagate && parent?.checked === "true" && !item.disabled && item.checked !== "true") {
          item.checked = true;
          inherited = true;
        }
      }
      item.syncStructure();
    }
    if (checkMode && this.propagate) this.recomputeParents();
    if (inherited) this.syncValue();
    this.syncTabStop();
  }

  // Um tab stop só: o que já o tinha, se visível; se ficou escondido, o ancestral visível mais próximo; senão o
  // primeiro selecionado visível, senão o primeiro visível.
  private syncTabStop(): void {
    const visible = this.visibleItems;
    let stop: ArkTreeItem | null = null;
    if (this.tabStop && this.items.includes(this.tabStop)) {
      stop = this.tabStop;
      while (stop && !visible.includes(stop)) stop = stop.parentItem;
    }
    stop ??= visible.find((item) => item.selected || item.checked === "true") ?? visible[0] ?? null;
    this.setTabStop(stop);
  }

  private setTabStop(stop: ArkTreeItem | null): void {
    this.tabStop = stop;
    for (const item of this.items) {
      if (item.rowElement) setAttr(item.rowElement, "tabindex", item === stop ? "0" : "-1");
    }
  }

  // --- Seleção ---

  /** Itens escolhidos: selecionados, ou marcados por inteiro com `checkboxes`. */
  private chosenItems(): ArkTreeItem[] {
    if (this.selection === "none") return [];
    return this.checkMode()
      ? this.items.filter((item) => item.checked === "true")
      : this.items.filter((item) => item.selected);
  }

  /** Reescreve o `value` a partir do estado dos itens (sem reler pelo attributeChangedCallback). */
  private syncValue(): void {
    const values = this.chosenItems().map((item) => item.value);
    const next =
      this.selection === "none"
        ? null
        : this.selection === "single"
          ? (values[0] ?? null)
          : values.length
            ? JSON.stringify(values)
            : null;
    this.syncingValue = true;
    if (next === null) {
      if (this.hasAttribute("value")) this.removeAttribute("value");
    } else if (this.getAttribute("value") !== next) {
      this.setAttribute("value", next);
    }
    this.syncingValue = false;
  }

  /** Aplica o `value` (atribuído pelo app) aos itens. */
  private applyValue(): void {
    if (this.selection === "none") return;
    const wanted = new Set(this.selection === "single" ? [this.value].filter(Boolean) : parseValues(this.value));
    if (this.checkMode()) {
      for (const item of this.items) item.checked = wanted.has(item.value);
      if (this.propagate) {
        // Marcar um pai pelo value marca os descendentes, como o clique.
        for (const item of this.items) if (item.checked === "true") this.setSubtree(item, true);
        this.recomputeParents();
      }
    } else {
      for (const item of this.items) item.selected = wanted.has(item.value);
    }
    this.syncValue();
  }

  private emitSelection(): void {
    this.syncValue();
    const values = this.chosenItems().map((item) => item.value);
    this.dispatchEvent(
      new CustomEvent("ark-selection-change", {
        detail: { values, value: this.selection === "single" ? (values[0] ?? null) : undefined },
        bubbles: true,
        composed: true
      })
    );
  }

  private select(item: ArkTreeItem): void {
    if (item.disabled) return;
    if (this.selection === "single") {
      if (item.selected && this.chosenItems().length === 1) return;
      for (const other of this.items) other.selected = other === item;
      this.emitSelection();
    } else if (this.selection === "multiple" && !this.checkMode()) {
      item.selected = !item.selected;
      this.emitSelection();
    }
  }

  private toggleCheck(item: ArkTreeItem): void {
    if (item.disabled || !this.checkMode()) return;
    const next = item.checked !== "true";
    item.checked = next;
    if (this.propagate) {
      this.setSubtree(item, next);
      this.recomputeParents();
    }
    this.emitSelection();
  }

  // Descendentes habilitados seguem o pai; um desabilitado fica como está (e conta no estado do pai).
  private setSubtree(item: ArkTreeItem, checked: boolean): void {
    for (const child of item.childItems) {
      if (!child.disabled) child.checked = checked;
      this.setSubtree(child, checked);
    }
  }

  // De baixo para cima: todos marcados, pai marcado; nenhum, pai desmarcado; parte (ou algum mixed), mixed.
  private recomputeParents(): void {
    const items = this.items;
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      const children = item.childItems;
      if (children.length === 0) continue;
      const states = children.map((child) => child.checked);
      const next = states.every((state) => state === "true")
        ? "true"
        : states.every((state) => state === "false")
          ? "false"
          : "mixed";
      if (item.checked !== next) item.checked = next === "true" ? true : next === "false" ? false : "mixed";
    }
  }

  private activate(item: ArkTreeItem): void {
    if (item.disabled) return;
    this.dispatchEvent(
      new CustomEvent("ark-activate", { detail: { value: item.value, item }, bubbles: true, composed: true })
    );
  }

  // --- Interação ---

  /** O item desta árvore dono do evento, ou `null` se veio de um controle do usuário dentro do item. */
  private itemFromEvent(event: Event): { item: ArkTreeItem; target: Element } | null {
    const target = event.target as Element | null;
    const item = target?.closest<ArkTreeItem>("ark-tree-item");
    if (!target || !item || item.closest("ark-tree") !== this) return null;
    const control = target.closest(OWN_CONTROLS);
    if (control && item.contains(control) && control.closest("ark-tree-item") === item) return null;
    return { item, target };
  }

  private readonly handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as Element | null;
    const item = target?.closest<ArkTreeItem>("ark-tree-item");
    if (item && item.closest("ark-tree") === this && target === item.rowElement) this.setTabStop(item);
  };

  // Chevron expande; caixa marca; o resto da linha foca e, conforme o modo, seleciona e ativa. Em `single` o clique
  // seleciona e ativa (abrir o arquivo, como num explorador); em `multiple` sem caixas alterna a seleção.
  private readonly handleClick = (event: MouseEvent): void => {
    const hit = this.itemFromEvent(event);
    if (!hit) return;
    const { item, target } = hit;
    // O clique tira o foco de onde estava (o chevron não é focável): o item clicado fica com ele, como num explorador.
    this.focusItem(item);
    if (item.toggleElement?.contains(target)) {
      this.toggleItem(item);
      return;
    }
    if (item.checkElement?.contains(target) && this.checkMode()) {
      this.toggleCheck(item);
      return;
    }
    if (this.selection === "multiple" && !this.checkMode()) {
      this.select(item);
      return;
    }
    if (this.selection === "single") this.select(item);
    this.activate(item);
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const hit = this.itemFromEvent(event);
    if (!hit || hit.target !== hit.item.rowElement) return;
    // Atalhos com Alt, Ctrl ou Meta ficam com o navegador e o sistema (Alt+← volta a página); Shift segue valendo para
    // a busca por letra maiúscula.
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const { item } = hit;
    const visible = this.visibleItems;
    const index = visible.indexOf(item);
    let handled = true;

    switch (event.key) {
      case "ArrowDown":
        if (visible[index + 1]) this.focusItem(visible[index + 1]);
        break;
      case "ArrowUp":
        if (index > 0) this.focusItem(visible[index - 1]);
        break;
      case "ArrowRight":
        if (item.isBranch && !item.expanded) {
          this.toggleItem(item, true);
        } else if (item.expanded && item.childItems[0]) {
          this.focusItem(item.childItems[0]);
        }
        break;
      case "ArrowLeft":
        if (item.expanded && item.isBranch) {
          this.toggleItem(item, false);
        } else if (item.parentItem) {
          this.focusItem(item.parentItem);
        }
        break;
      case "Home":
        if (visible[0]) this.focusItem(visible[0]);
        break;
      case "End":
        if (visible.length) this.focusItem(visible[visible.length - 1]);
        break;
      case "Enter":
        this.activate(item);
        break;
      case " ":
        if (this.checkMode()) {
          this.toggleCheck(item);
        } else {
          this.select(item);
        }
        break;
      case "*": {
        const siblings = item.parentItem ? item.parentItem.childItems : this.items.filter((other) => !other.parentItem);
        for (const sibling of siblings) this.toggleItem(sibling, true);
        break;
      }
      default:
        handled = this.handleTypeahead(event, item);
    }
    if (handled) event.preventDefault();
  };

  // Letras levam ao próximo item visível cujo rótulo começa com o que foi digitado; a mesma letra repetida percorre
  // os que começam com ela.
  private handleTypeahead(event: KeyboardEvent, current: ArkTreeItem): boolean {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || !event.key.trim()) return false;
    if (this.typeaheadTimer !== null) window.clearTimeout(this.typeaheadTimer);
    this.typeaheadTimer = window.setTimeout(() => {
      this.typeahead = "";
      this.typeaheadTimer = null;
    }, TYPEAHEAD_MS);
    const key = event.key.toLocaleLowerCase();
    this.typeahead = this.typeahead === key ? key : this.typeahead + key;
    const repeated = this.typeahead.length === 1;
    const visible = this.visibleItems;
    const start = visible.indexOf(current);
    const ordered = [...visible.slice(start + (repeated ? 1 : 0)), ...visible.slice(0, start + (repeated ? 1 : 0))];
    const match = ordered.find((item) => item.label.toLocaleLowerCase().startsWith(this.typeahead));
    if (match) this.focusItem(match);
    return true;
  }

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
    this.setAttribute("role", "tree");
    setAttr(this, "aria-multiselectable", this.selection === "multiple" ? "true" : null);
    const label = this.getAttribute("label");
    if (label && !this.hasAttribute("aria-labelledby")) setAttr(this, "aria-label", label);
    this.applyOwnClasses("ark:flex ark:flex-col ark:gap-px ark:text-fg".split(" "));
    applyTestHooks(this, "tree", this);
  }
}

/** Lista de valores do atributo `value` em `multiple`: JSON; um texto que não é JSON vale como um valor só. */
function parseValues(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [raw];
  }
}

/** Escreve um atributo só quando muda (os observados reentrariam no attributeChangedCallback). */
function setAttr(el: Element, name: string, value: string | null): void {
  if (value === null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== value) {
    el.setAttribute(name, value);
  }
}

export default ArkTree;
