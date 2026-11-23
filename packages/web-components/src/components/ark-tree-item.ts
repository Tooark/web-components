import { type ArkSize, type ArkTreeItemIcon, coerceBooleanAttr } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Chevron do nó (chrome próprio, decorativo: o estado vai em aria-expanded). */
const CHEVRON_SVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M8 5l5 5-5 5"></path></svg>`;
/** Check da caixa (decorativo: o estado vai em aria-checked). */
const CHECK_SVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M4.5 10.5l3.5 3.5 7.5-8"></path></svg>`;
/** Traço da caixa em `mixed`. */
const DASH_SVG = `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M5 10h10"></path></svg>`;
/** Spinner de `loading` (o mesmo giro contínuo do botão). */
const SPINNER_SVG = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="ark:h-full ark:w-full ark-animate-spin"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25"></circle><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>`;
/**
 * Ícones próprios de pasta e arquivo (`icons="files"` na árvore ou `icon` no item): contorno na grade de 16, o lado do
 * ícone no tamanho padrão, com a cor de `--ark-tree-icon-color` e o corpo da pasta num preenchimento leve.
 */
const ICON_SVGS: Record<string, string> = {
  folder: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M1.75 4.25a1.5 1.5 0 0 1 1.5-1.5h2.8a1 1 0 0 1 .76.35L7.9 4.4h4.85a1.5 1.5 0 0 1 1.5 1.5v5.85a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" fill-opacity="0.14"></path></svg>`,
  "folder-open": `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M1.75 11.5V4.25a1.5 1.5 0 0 1 1.5-1.5h2.8a1 1 0 0 1 .76.35L7.9 4.4h3.85a1.5 1.5 0 0 1 1.5 1.5v.85"></path><path d="M4.02 6.75h9.9a.9.9 0 0 1 .86 1.16l-1.3 4.27a1.5 1.5 0 0 1-1.43 1.07H2.9a1.15 1.15 0 0 1-1.1-1.49l1.26-4.3a1 1 0 0 1 .96-.71z" fill="currentColor" fill-opacity="0.14"></path></svg>`,
  file: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ark:h-full ark:w-full"><path d="M4.25 1.75h4.4a1 1 0 0 1 .7.3l2.6 2.6a1 1 0 0 1 .3.7v7.4a1.5 1.5 0 0 1-1.5 1.5h-6.5a1.5 1.5 0 0 1-1.5-1.5v-9.5a1.5 1.5 0 0 1 1.5-1.5z"></path><path d="M8.75 2v2.25a1 1 0 0 0 1 1H12"></path></svg>`
};

let itemSeq = 0;

/** Estado da caixa de um nó com `checkboxes`. */
export type ArkTreeItemChecked = "true" | "false" | "mixed";

/**
 * Nó de um ark-tree. A linha própria é o `role="treeitem"` (foco, teclado e
 * estado em aria-*, com nível, posição e tamanho do conjunto explícitos, como
 * numa árvore plana) e o host fica `role="none"`: assim os `ark-tree-item`
 * filhos continuam onde o app os declarou, sem group nem aria-owns, e cada um
 * tem a própria linha. O chevron, a caixa e o rótulo são chrome próprio; o
 * `slot="icon"` e o `slot="trailing"` do usuário entram na linha pela grid do
 * components.css (e ficam fora do treeitem, então um botão no trailing é um
 * controle à parte). O ícone próprio de pasta ou arquivo só existe quando a
 * árvore pede (`icons="files"`) ou o item o nomeia (`icon`), e cede o lugar
 * ao `slot="icon"` do usuário. Seleção, foco, teclado e a estrutura são
 * coordenados pelo ark-tree.
 */
export class ArkTreeItem extends HTMLElementBase {
  static readonly tagName = "ark-tree-item";

  private rowEl: HTMLDivElement | null = null;
  private toggleEl: HTMLSpanElement | null = null;
  private checkEl: HTMLSpanElement | null = null;
  private labelEl: HTMLSpanElement | null = null;
  /** Ícone próprio de pasta ou arquivo: criado só quando a árvore ou o item o pedem. */
  private iconEl: HTMLSpanElement | null = null;
  /** Ícones em uso no chevron e na caixa: trocar o innerHTML sem mudança geraria mutações sem fim no observer da árvore. */
  private toggleIcon = "";
  private checkIcon = "";
  private ownIcon = "";

  static get observedAttributes(): string[] {
    return [
      "value",
      "label",
      "icon",
      "expanded",
      "lazy",
      "loading",
      "selected",
      "checked",
      "disabled",
      "size",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.id) this.id = `ark-tree-item-${++itemSeq}`;
    if (!this.rowEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(): void {
    if (!this.rowEl || !this.isConnected) return;
    this.updateAppearance();
  }

  /** Identidade do nó nos eventos e no `value` da árvore. */
  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(value: string | null | undefined) {
    reflectAttr(this, "value", value);
  }

  /** Texto do nó, também usado na busca por digitação. */
  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(value: string | null | undefined) {
    reflectAttr(this, "label", value);
  }

  /**
   * Ícone próprio deste nó: folder, file ou none. Sem o atributo vale o da árvore (`icons="files"`: pasta nos ramos,
   * arquivo nas folhas). Um `slot="icon"` do usuário tem precedência sobre os dois.
   */
  get icon(): ArkTreeItemIcon | "" {
    const value = (this.getAttribute("icon") || "").toLowerCase();
    return value === "folder" || value === "file" || value === "none" ? value : "";
  }

  set icon(value: string | null | undefined) {
    reflectAttr(this, "icon", value || null);
  }

  /** Aberto; refletido quando o usuário expande ou recolhe. */
  get expanded(): boolean {
    return this.hasAttribute("expanded");
  }

  set expanded(value: boolean | string | null | undefined) {
    this.toggleAttribute("expanded", coerceBooleanAttr(value));
  }

  /** Mostra o chevron mesmo sem filhos: o app carrega os filhos ao receber o `ark-toggle`. */
  get lazy(): boolean {
    return this.hasAttribute("lazy");
  }

  set lazy(value: boolean | string | null | undefined) {
    this.toggleAttribute("lazy", coerceBooleanAttr(value));
  }

  /** Spinner no lugar do chevron e `aria-busy` enquanto os filhos carregam. */
  get loading(): boolean {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean | string | null | undefined) {
    this.toggleAttribute("loading", coerceBooleanAttr(value));
  }

  /** Selecionado (o ark-tree reescreve). */
  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean | string | null | undefined) {
    this.toggleAttribute("selected", coerceBooleanAttr(value));
  }

  /** Caixa marcada com `checkboxes`: true, false ou mixed (o ark-tree reescreve). */
  get checked(): ArkTreeItemChecked {
    const value = this.getAttribute("checked");
    if (value === "mixed") return "mixed";
    return value !== null && value !== "false" ? "true" : "false";
  }

  set checked(value: boolean | string | null | undefined) {
    if (value === "mixed") {
      this.setAttribute("checked", "mixed");
      return;
    }
    if (coerceBooleanAttr(value)) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  /** Fora da seleção e da ativação; o foco ainda passa por ele. */
  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** O nó pai (ark-tree-item) ou `null` no primeiro nível; atravessa wrappers de framework. */
  get parentItem(): ArkTreeItem | null {
    return this.parentElement?.closest<ArkTreeItem>("ark-tree-item") ?? null;
  }

  /** Os subitens diretos, mesmo dentro de um wrapper de framework entre este nó e eles. */
  get childItems(): ArkTreeItem[] {
    return Array.from(this.querySelectorAll<ArkTreeItem>("ark-tree-item")).filter((item) => item.parentItem === this);
  }

  /** Tem subitens ou é `lazy`: mostra o chevron e leva `aria-expanded`. */
  get isBranch(): boolean {
    return this.lazy || this.childItems.length > 0;
  }

  /** A linha própria: o treeitem (foco, aria-*) e a faixa de fundo. */
  get rowElement(): HTMLDivElement | null {
    return this.rowEl;
  }

  /** O chevron próprio, para a árvore distinguir o clique que só expande. */
  get toggleElement(): HTMLSpanElement | null {
    return this.toggleEl;
  }

  /** O ícone próprio de pasta ou arquivo, ou `null` quando o nó não tem um. */
  get iconElement(): HTMLSpanElement | null {
    return this.iconEl;
  }

  /** A caixa própria, para a árvore distinguir o clique que só marca. */
  get checkElement(): HTMLSpanElement | null {
    return this.checkEl;
  }

  /** Refaz o que depende dos subitens (chevron, aria-expanded), chamado pela árvore quando a estrutura muda. */
  syncStructure(): void {
    this.updateAppearance();
  }

  private render(): void {
    const row = document.createElement("div");
    row.setAttribute("data-ark-chrome", "row");
    const toggle = document.createElement("span");
    toggle.setAttribute("data-ark-chrome", "toggle");
    toggle.setAttribute("aria-hidden", "true");
    const check = document.createElement("span");
    check.setAttribute("data-ark-chrome", "check");
    check.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.setAttribute("data-ark-chrome", "label");
    // O texto já é o nome do treeitem (aria-labelledby resolve nó oculto); visível à leitura, sairia repetido solto.
    label.setAttribute("aria-hidden", "true");
    label.id = `${this.id}-label`;
    this.rowEl = row;
    this.toggleEl = toggle;
    this.checkEl = check;
    this.labelEl = label;
    // Papel, nome, classes e texto antes de entrar no DOM: cada mudança depois da inserção é trabalho a mais do
    // navegador por nó (a árvore de acessibilidade recria o nó a cada troca de papel).
    this.setAttribute("role", "none");
    this.updateAppearance();
    // Chrome no início, antes dos filhos do usuário: a grid do components.css posiciona cada parte.
    if (this.iconEl) {
      this.prepend(row, toggle, check, this.iconEl, label);
    } else {
      this.prepend(row, toggle, check, label);
    }
  }

  // Qual ícone próprio desenhar ("" para nenhum). A árvore manda em `none` (esconde até o do usuário, pelo CSS); o
  // `slot="icon"` do usuário vence o próprio; o `icon` do item vence a escolha automática de `icons="files"`.
  private resolveOwnIcon(branch: boolean): string {
    // O modo chega propagado pela árvore; na primeira montagem, antes dela passar, vem do atributo da própria árvore.
    const mode = (
      this.getAttribute("data-ark-icons") ??
      this.closest("ark-tree")?.getAttribute("icons") ??
      ""
    ).toLowerCase();
    const own = this.icon;
    if (mode === "none" || own === "none" || (mode !== "files" && own === "")) return "";
    for (const child of Array.from(this.children)) {
      if (child.getAttribute("slot") === "icon") return "";
    }
    const kind = own || (branch ? "folder" : "file");
    return kind === "folder" && branch && this.expanded ? "folder-open" : kind;
  }

  // Cria, troca ou remove o ícone próprio, só quando muda: cada escrita aqui passa pelo observer da árvore.
  private syncOwnIcon(branch: boolean): void {
    const kind = this.resolveOwnIcon(branch);
    if (kind === "") {
      if (this.iconEl) {
        this.iconEl.remove();
        this.iconEl = null;
        this.ownIcon = "";
      }
      return;
    }
    if (!this.iconEl) {
      const icon = document.createElement("span");
      icon.setAttribute("data-ark-chrome", "icon");
      icon.setAttribute("aria-hidden", "true");
      icon.className = "ark:inline-flex ark:shrink-0 ark:items-center ark:justify-center";
      this.iconEl = icon;
      this.ownIcon = "";
    }
    if (this.ownIcon !== kind) {
      this.iconEl.innerHTML = ICON_SVGS[kind];
      this.iconEl.setAttribute("data-ark-icon", kind);
      this.ownIcon = kind;
    }
    // Na primeira montagem o chrome ainda está fora do DOM: o render() insere o ícone junto com o resto.
    if (this.labelEl?.parentNode === this && this.iconEl.parentNode !== this) {
      this.insertBefore(this.iconEl, this.labelEl);
    }
    applyTestHooks(this, "tree-item", this.iconEl, "icon");
  }

  private sizeClasses(): { text: string; toggle: string; check: string } {
    const sizes: Record<ArkSize, { text: string; toggle: string; check: string }> = {
      xs: { text: "ark:text-xs", toggle: "ark:h-3 ark:w-3", check: "ark:h-3 ark:w-3" },
      sm: { text: "ark:text-xs", toggle: "ark:h-3.5 ark:w-3.5", check: "ark:h-3.5 ark:w-3.5" },
      md: { text: "ark:text-sm", toggle: "ark:h-4 ark:w-4", check: "ark:h-4 ark:w-4" },
      lg: { text: "ark:text-base", toggle: "ark:h-5 ark:w-5", check: "ark:h-4.5 ark:w-4.5" },
      xl: { text: "ark:text-lg", toggle: "ark:h-5 ark:w-5", check: "ark:h-5 ark:w-5" }
    };
    return sizes[(this.getAttribute("size") || "md").toLowerCase() as ArkSize] ?? sizes.md;
  }

  private updateAppearance(): void {
    if (!this.rowEl || !this.toggleEl || !this.checkEl || !this.labelEl) return;
    const branch = this.isBranch;
    const size = this.sizeClasses();
    const row = this.rowEl;

    setAttr(this, "role", "none");
    setAttr(row, "role", "treeitem");
    setAttr(row, "aria-labelledby", this.labelEl.id);
    setAttr(row, "aria-expanded", branch ? (this.expanded ? "true" : "false") : null);
    setAttr(row, "aria-disabled", this.disabled ? "true" : null);
    setAttr(row, "aria-busy", this.loading ? "true" : null);
    // Modo vindo da árvore: data-ark-select (single/multiple sem caixas) dá aria-selected; data-ark-checkboxes, aria-checked.
    const selectable = this.hasAttribute("data-ark-select");
    const checkable = this.hasAttribute("data-ark-checkboxes");
    setAttr(row, "aria-selected", selectable ? (this.selected ? "true" : "false") : null);
    setAttr(row, "aria-checked", checkable ? this.checked : null);
    // O trailing (um badge) fica fora do treeitem: entra como descrição da linha, para a navegação por setas o ler.
    const trailing = Array.from(this.children).filter((child) => child.getAttribute("slot") === "trailing");
    trailing.forEach((child, index) => {
      if (!child.id) child.id = `${this.id}-trailing-${index}`;
    });
    setAttr(row, "aria-describedby", trailing.length ? trailing.map((child) => child.id).join(" ") : null);

    if (this.labelEl.textContent !== this.label) this.labelEl.textContent = this.label;
    setClass(this.labelEl, `ark:min-w-0 ark:truncate ark:py-1 ${size.text}`);
    setClass(this.rowEl, "ark:rounded-md");
    setClass(
      this.toggleEl,
      `ark:inline-flex ark:shrink-0 ark:items-center ark:justify-center ark:text-fg-muted ${size.toggle}`
    );
    const toggleIcon = this.loading ? SPINNER_SVG : branch ? CHEVRON_SVG : "";
    if (this.toggleIcon !== toggleIcon) {
      this.toggleEl.innerHTML = toggleIcon;
      this.toggleIcon = toggleIcon;
    }

    this.syncOwnIcon(branch);

    // A caixa só aparece com `checkboxes`; o estado vai em aria-checked na linha.
    this.checkEl.hidden = !checkable;
    const checked = this.checked;
    setClass(
      this.checkEl,
      `ark:inline-flex ark:shrink-0 ark:items-center ark:justify-center ark:rounded-sm ark:border ${size.check} ${
        checked === "false"
          ? "ark:border-border-strong ark:bg-surface"
          : "ark:border-primary ark:bg-primary ark:text-primary-fg"
      }`
    );
    const checkIcon = checked === "true" ? CHECK_SVG : checked === "mixed" ? DASH_SVG : "";
    if (this.checkIcon !== checkIcon) {
      this.checkEl.innerHTML = checkIcon;
      this.checkIcon = checkIcon;
    }

    applyTestHooks(this, "tree-item", this);
    applyTestHooks(this, "tree-item", this.rowEl, "row");
    applyTestHooks(this, "tree-item", this.toggleEl, "toggle");
    applyTestHooks(this, "tree-item", this.checkEl, "check");
    applyTestHooks(this, "tree-item", this.labelEl, "label");
  }
}

/** Troca a classe só quando muda: reescrever a mesma custa trabalho do navegador (estilo e acessibilidade) por nó. */
function setClass(el: Element, value: string): void {
  if (el.className !== value) el.className = value;
}

/** Escreve um atributo só quando muda. */
function setAttr(el: Element, name: string, value: string | null): void {
  if (value === null) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  } else if (el.getAttribute(name) !== value) {
    el.setAttribute(name, value);
  }
}

export default ArkTreeItem;
