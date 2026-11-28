import {
  type ArkDataViewCardRender,
  type ArkDataViewColumn,
  type ArkDataViewKey,
  type ArkDataViewLayout,
  type ArkDataViewMode,
  type ArkDataViewQuery,
  type ArkDataViewQueryChangeDetail,
  type ArkDataViewReorderDetail,
  type ArkDataViewRow,
  type ArkDataViewRowClickDetail,
  type ArkDataViewSelectionChangeDetail,
  type ArkDataViewSort,
  type ArkDataViewView,
  type ArkDataViewViewChangeDetail,
  type ArkLocale,
  type ArkPageChangeDetail,
  type ArkSize,
  announce,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import type { ArkButton } from "./ark-button";
import type { ArkCheckbox } from "./ark-checkbox";
import type { ArkInput } from "./ark-input";
import type { ArkMenu } from "./ark-menu";
import type { ArkPagination } from "./ark-pagination";
import type { ArkSelect } from "./ark-select";
import type { ArkToggle } from "./ark-toggle";
import type { ArkToggleGroup } from "./ark-toggle-group";
import { HTMLElementBase } from "./html-element-base";
import { followArkLocale, unfollowArkLocale } from "./locale-sync";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Ícones do chrome próprio: lupa da busca, visualizações, alça de reordenar e setas de ordenação. */
const SEARCH_SVG =
  '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"></circle><path d="M13.5 13.5L17 17"></path></svg>';
const TABLE_SVG =
  '<svg class="ark:h-[1.15em] ark:w-[1.15em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"></path></svg>';
const CARDS_SVG =
  '<svg class="ark:h-[1.15em] ark:w-[1.15em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="5.5" height="5.5" rx="1"></rect><rect x="11.5" y="3" width="5.5" height="5.5" rx="1"></rect><rect x="3" y="11.5" width="5.5" height="5.5" rx="1"></rect><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1"></rect></svg>';
const GRIP_SVG =
  '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><circle cx="7" cy="5" r="1.4"></circle><circle cx="13" cy="5" r="1.4"></circle><circle cx="7" cy="10" r="1.4"></circle><circle cx="13" cy="10" r="1.4"></circle><circle cx="7" cy="15" r="1.4"></circle><circle cx="13" cy="15" r="1.4"></circle></svg>';
const SORT_SVG: Record<"none" | "asc" | "desc", string> = {
  none: '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 8L10 4.5 13.5 8" opacity="0.45"></path><path d="M6.5 12l3.5 3.5 3.5-3.5" opacity="0.45"></path></svg>',
  asc: '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 8L10 4.5 13.5 8"></path><path d="M6.5 12l3.5 3.5 3.5-3.5" opacity="0.25"></path></svg>',
  desc: '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 8L10 4.5 13.5 8" opacity="0.25"></path><path d="M6.5 12l3.5 3.5 3.5-3.5"></path></svg>'
};

/** Largura do host, em px, abaixo da qual `view="auto"` mostra cards. */
const DEFAULT_BREAKPOINT = 640;
/** Folga para sair do modo estreito: a barra de rolagem que aparece e some não faz a apresentação oscilar. */
const NARROW_HYSTERESIS = 24;
/** Distância em px que o ponteiro percorre antes de um toque na alça virar arrasto. */
const DRAG_THRESHOLD = 4;
/** Linhas de placeholder enquanto `loading` não tem nenhum registro para mostrar. */
const SKELETON_ROWS = 5;
/** Atraso padrão da busca, em ms, entre a última tecla e a consulta. */
const DEFAULT_SEARCH_DEBOUNCE = 300;
/** Faixa em px, junto às bordas da área de rolagem, em que um arrasto rola a lista; e o passo máximo por quadro. */
const SCROLL_EDGE = 48;
const SCROLL_SPEED = 16;
/** Janela em ms em que o clique que fechou o menu da alça não o reabre. */
const MENU_REOPEN_GUARD = 400;

/** Dentro de uma linha clicável, o que tem comportamento próprio e não dispara `ark-row-click`. */
const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [role="button"], [role="checkbox"], [role="switch"], [role="link"], [role="menuitem"], [contenteditable], [data-ark-control]';

/** Densidade por `size`: texto, padding das células e do card, rótulo do card e tamanho dos controles compostos. */
type Sizing = {
  text: string;
  cell: string;
  card: string;
  label: string;
  control: ArkSize;
  /** Um passo abaixo de `control`: o segmented control soma o próprio padding e fica na altura da busca. */
  toggle: ArkSize;
  check: ArkSize;
};
const SIZES: Record<ArkSize, Sizing> = {
  xs: {
    text: "ark:text-xs",
    cell: "ark:px-2 ark:py-1",
    card: "ark:gap-2 ark:p-2",
    label: "ark:text-2xs",
    control: "xs",
    toggle: "xs",
    check: "xs"
  },
  sm: {
    text: "ark:text-xs",
    cell: "ark:px-3 ark:py-1.5",
    card: "ark:gap-2 ark:p-3",
    label: "ark:text-2xs",
    control: "sm",
    toggle: "xs",
    check: "sm"
  },
  md: {
    text: "ark:text-sm",
    cell: "ark:px-3 ark:py-2.5",
    card: "ark:gap-3 ark:p-4",
    label: "ark:text-xs",
    control: "md",
    toggle: "sm",
    check: "sm"
  },
  lg: {
    text: "ark:text-base",
    cell: "ark:px-4 ark:py-3",
    card: "ark:gap-3 ark:p-5",
    label: "ark:text-sm",
    control: "lg",
    toggle: "md",
    check: "md"
  },
  xl: {
    text: "ark:text-lg",
    cell: "ark:px-5 ark:py-3.5",
    card: "ark:gap-4 ark:p-6",
    label: "ark:text-base",
    control: "xl",
    toggle: "lg",
    check: "lg"
  }
};

/** Grade de campos do card e colunas ocupadas por campo: literais completas, para o Tailwind gerar todas. */
const CARD_COLUMNS: Record<number, string> = {
  1: "ark:grid-cols-1",
  2: "ark:grid-cols-2",
  3: "ark:grid-cols-3",
  4: "ark:grid-cols-4"
};
const CARD_SPANS: Record<number, string> = {
  1: "ark:col-span-1",
  2: "ark:col-span-2",
  3: "ark:col-span-3",
  4: "ark:col-span-4"
};
const ALIGNMENTS: Record<string, string> = {
  left: "ark:text-left",
  center: "ark:text-center",
  right: "ark:text-right"
};

/** Um registro visível: o objeto do app, a chave (e a forma em texto dela, usada no DOM) e a posição em `rows`. */
type Entry = { row: ArkDataViewRow; key: ArkDataViewKey; id: string; index: number };

/** Resultado da consulta: os registros da página, o total filtrado e a página efetiva. */
type Computed = { entries: Entry[]; total: number; page: number; pageSize: number };

/** Arrasto de uma alça: posições entre os registros visíveis, o último ponto do ponteiro e quem rola a lista. */
type Drag = {
  from: number;
  pointerId: number;
  x: number;
  y: number;
  pointerX: number;
  pointerY: number;
  active: boolean;
  target: number | null;
  /** Ancestral que rola na vertical; `null` quando quem rola é a página. */
  scroller: Element | null;
};

/**
 * Foco a devolver depois de refazer o conteúdo: a parte e a chave do registro (ou da coluna, no cabeçalho). `index`
 * é a posição na tela que herda o foco quando o registro saiu da página (movido para o início ou o fim da lista).
 */
type FocusToken = { part: "sort" | "handle" | "select" | "select-all" | "row"; id: string; index?: number };

/** O que cada passada de renderização precisa saber, calculado uma vez em updateAppearance. */
type RenderContext = {
  locale: ArkLocale;
  size: Sizing;
  layout: ArkDataViewLayout;
  columns: ArkDataViewColumn[];
  entries: Entry[];
  label: string;
  selectable: boolean;
  reorderable: boolean;
  canReorder: boolean;
  clickable: boolean;
};

/** Inteiro de um atributo, ou `fallback` quando falta, não é número ou fica abaixo de `min`. */
function intAttr(el: Element, name: string, fallback: number, min: number): number {
  const parsed = Number.parseInt(el.getAttribute(name) || "", 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

/** Grava o atributo só quando o valor muda: attributeChangedCallback dispara mesmo para um valor idêntico. */
function syncAttr(el: Element, name: string, value: string | null): void {
  if (el.getAttribute(name) === value) return;
  if (value === null) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, value);
  }
}

/** Valor de um campo do registro; uma chave com ponto que não existe como campo é lida como caminho. */
function valueAt(row: ArkDataViewRow, key: string): unknown {
  if (key in row || !key.includes(".")) return row[key];
  let current: unknown = row;
  for (const part of key.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Texto padrão de um valor: vazio para null/undefined, data local, lista separada por vírgula, JSON para objetos. */
function textOf(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return value.map(textOf).join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/** Texto sem acentos e em minúsculas, para a busca não depender de caixa nem de diacríticos. */
function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

/** Comparação padrão da ordenação: números, datas e booleanos pelo valor, o resto como texto (números dentro dele). */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return textOf(a).localeCompare(textOf(b), undefined, { numeric: true, sensitivity: "base" });
}

/** "chave:asc" ou "chave:desc" → ordenação; sem chave não há ordenação. */
function parseSort(raw: string | null): ArkDataViewSort | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const colon = value.lastIndexOf(":");
  const key = colon < 0 ? value : value.slice(0, colon);
  if (!key) return null;
  const direction = colon >= 0 && value.slice(colon + 1).toLowerCase() === "desc" ? "desc" : "asc";
  return { key, direction };
}

/** Ancestral que rola na vertical; `null` quando quem rola é a página. */
function scrollParentOf(el: Element): Element | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (node === document.body || node === document.documentElement) return null;
    const overflow = getComputedStyle(node).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

/** Lista de objetos de um JSON de atributo; qualquer outra coisa vira lista vazia. */
function parseList(raw: string | null): ArkDataViewRow[] {
  try {
    const parsed = JSON.parse(raw || "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "object" && item !== null) : [];
  } catch {
    return [];
  }
}

/**
 * Coleção de registros em duas apresentações, tabela e cards. Recebe `rows`
 * (objetos do app, guardados por referência) e `columns` (qual campo aparece,
 * onde e como) e desenha tudo: não há filhos do usuário no conteúdo, só nos
 * slots `toolbar` (ações ao lado da busca), `selection` (ações em massa,
 * visíveis enquanto há seleção) e `empty` (estado vazio próprio), que ficam
 * onde estão e são posicionados por CSS na grid do host; os nós do componente
 * se encaixam em volta deles, para a ordem de tabulação seguir a visual.
 *
 * `view="auto"` (o padrão) mostra cards quando o PRÓPRIO componente fica mais
 * estreito que `breakpoint` (ResizeObserver no host, não a largura da tela);
 * "table" e "cards" fixam uma apresentação. A escolha do usuário no seletor
 * do canto reescreve `view`; `no-view-selector` esconde o seletor e `view`
 * continua valendo. No `mode="client"` o componente
 * busca, ordena e pagina `rows`; no `mode="server"` ele só publica a consulta
 * em `ark-query-change` e o app devolve `rows`, `total` e `loading`. O
 * conteúdo de uma célula é o texto do campo ou o que `render` da coluna
 * devolver (um nó ou um texto, nunca HTML). Opt-in: `searchable`,
 * `page-size` (paginação), `selectable` (caixas de seleção), `reorderable`
 * (alça de arrastar, com setas no teclado e um menu de mover no clique, para
 * quem não arrasta) e `clickable` (linha focável que emite `ark-row-click`).
 * Depois de cada redesenho do conteúdo o host emite `ark-render` (não sobe),
 * para integrações que preenchem as células: os wrappers de framework põem
 * JSX, slots e templates nos nós que o `render` deles devolve. Compõe
 * ark-input, ark-select, ark-toggle-group, ark-checkbox, ark-button,
 * ark-empty, ark-skeleton, ark-pagination e ark-menu.
 */
export class ArkDataView extends HTMLElementBase {
  static readonly tagName = "ark-data-view";

  private rowsModel: ArkDataViewRow[] = [];
  private columnsModel: ArkDataViewColumn[] = [];
  /** Seleção: a chave em texto (a do DOM) → a chave como o app a conhece. */
  private selection = new Map<string, ArkDataViewKey>();
  /** Desenho próprio do corpo do card (`cardRender`); sem ele, a grade de campos. */
  private cardFactory: ArkDataViewCardRender | null = null;
  private searchEl: ArkInput | null = null;
  private sortEl: ArkSelect | null = null;
  private viewsEl: ArkToggleGroup | null = null;
  private selectionEl: HTMLDivElement | null = null;
  /** Caixa de selecionar tudo da barra de seleção, usada nos cards (a tabela tem a do cabeçalho). */
  private selectionAllEl: ArkCheckbox | null = null;
  private selectionCountEl: HTMLSpanElement | null = null;
  private clearEl: ArkButton | null = null;
  private contentEl: HTMLDivElement | null = null;
  private footerEl: HTMLDivElement | null = null;
  private paginationEl: ArkPagination | null = null;
  /** Caixa de selecionar tudo do cabeçalho da tabela, refeita a cada renderização. */
  private headAllEl: ArkCheckbox | null = null;
  /** Nó de cada registro visível (tr ou li), pela chave em texto. */
  private rowEls = new Map<string, HTMLElement>();
  /** Registros visíveis e os nós deles, na ordem da tela. */
  private visible: Entry[] = [];
  private rowOrder: HTMLElement[] = [];
  /** Consulta da última renderização, para `query` não refazer busca e ordenação. */
  private computed: Computed | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private slotObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  /** O host está mais estreito que `breakpoint`: `auto` vira cards e a barra de ferramentas empilha. */
  private narrow = false;
  /** Quadro agendado para reagir a uma mudança de largura. */
  private resizeFrame: number | null = null;
  private searchTimer: number | null = null;
  private drag: Drag | null = null;
  /** Quadro agendado da rolagem automática de um arrasto. */
  private scrollFrame: number | null = null;
  /** O clique que encerra um arrasto não abre o menu da alça. */
  private suppressHandleClick = false;
  /** Menu de mover da alça, criado no primeiro uso; o registro e a posição na tela sobre os quais ele age. */
  private menuEl: ArkMenu | null = null;
  private menuTarget: { entry: Entry; position: number } | null = null;
  /** Registro cujo menu acabou de fechar sem escolha, e quando: o clique que o fechou não o reabre. */
  private menuClosed: { id: string; time: number } | null = null;
  /** Foco pedido para a próxima renderização (a alça do registro que o teclado acabou de mover). */
  private pendingFocus: FocusToken | null = null;
  /** Várias gravações de atributo numa só mudança (ordenação e página) renderizam uma vez, ao fim. */
  private suspended = false;

  static get observedAttributes(): string[] {
    return [
      "columns",
      "rows",
      "row-key",
      "view",
      "no-view-selector",
      "breakpoint",
      "mode",
      "page",
      "page-size",
      "page-sizes",
      "total",
      "sort",
      "search",
      "searchable",
      "search-placeholder",
      "search-debounce",
      "selectable",
      "reorderable",
      "clickable",
      "loading",
      "card-columns",
      "label",
      "size",
      "lang",
      "locale-json",
      "theme",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    followArkLocale(this);
    if (!this.contentEl) this.render();
    if (!this.slotObserver) {
      // Slots que chegam depois (frameworks) recebem o hook e o estado vazio próprio passa a valer; os nós do
      // componente, acrescentados em render(), não contam.
      this.slotObserver = new MutationObserver((records) => {
        const foreign = records.some((record) =>
          [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].some(
            (node) => !(node instanceof Element) || !node.hasAttribute("data-ark-chrome")
          )
        );
        if (!foreign) return;
        this.arrangeChrome();
        this.updateAppearance();
      });
      this.slotObserver.observe(this, { childList: true });
    }
    // Medido antes da primeira renderização, para `auto` já nascer na apresentação certa.
    this.narrow = this.measureNarrow();
    if (!this.resizeObserver && typeof ResizeObserver !== "undefined") {
      // No quadro seguinte: trocar de apresentação dentro do próprio callback muda a altura do host, e o navegador
      // acusa um laço de ResizeObserver.
      this.resizeObserver = new ResizeObserver(() => {
        if (this.resizeFrame !== null) return;
        this.resizeFrame = requestAnimationFrame(() => {
          this.resizeFrame = null;
          this.handleResize();
        });
      });
      this.resizeObserver.observe(this);
    }
    this.updateAppearance();
  }

  disconnectedCallback(): void {
    unfollowArkLocale(this);
    this.slotObserver?.disconnect();
    this.slotObserver = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.resizeFrame !== null) cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = null;
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.endDrag();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (oldValue === newValue) return;
    // Atributos JSON: só o valor inicial; a propriedade é a fonte a partir daí.
    if (name === "rows") this.setRows(parseList(newValue));
    if (name === "columns") this.setColumns(parseList(newValue));
    if (!this.contentEl || !this.isConnected || this.suspended) return;
    this.updateAppearance();
  }

  // --- Dados ---

  /** Os registros (os mesmos objetos recebidos, numa lista nova); atribuir substitui tudo e renderiza de novo. */
  get rows(): ArkDataViewRow[] {
    return this.rowsModel.slice();
  }

  set rows(value: ArkDataViewRow[] | string | null | undefined) {
    // Uma string é o JSON do atributo (React 19 e Vue gravam a prop como propriedade): segue o caminho do atributo.
    if (typeof value === "string") {
      this.setAttribute("rows", value);
      return;
    }
    this.setRows(Array.isArray(value) ? value : []);
    if (this.isConnected) this.updateAppearance();
  }

  /** As colunas (propriedade JS, a única forma de passar `render` e `compare`; o atributo aceita o JSON sem eles). */
  get columns(): ArkDataViewColumn[] {
    return this.columnsModel.slice();
  }

  set columns(value: ArkDataViewColumn[] | string | null | undefined) {
    if (typeof value === "string") {
      this.setAttribute("columns", value);
      return;
    }
    this.setColumns(Array.isArray(value) ? value : []);
    if (this.isConnected) this.updateAppearance();
  }

  /** Campo que identifica cada registro (atributo `row-key`). Padrão: "id". */
  get rowKey(): string {
    return this.getAttribute("row-key") || "id";
  }

  set rowKey(value: string | null | undefined) {
    reflectAttr(this, "row-key", value || null);
  }

  /** Chaves selecionadas, na ordem em que foram marcadas; atribuir substitui a seleção sem emitir evento. */
  get selected(): ArkDataViewKey[] {
    return Array.from(this.selection.values());
  }

  set selected(value: ArkDataViewKey[] | null | undefined) {
    const keys = Array.isArray(value) ? value : [];
    this.selection = new Map(
      keys
        .filter((key) => typeof key === "string" || typeof key === "number")
        .map((key): [string, ArkDataViewKey] => [String(key), key])
    );
    if (this.contentEl && this.isConnected) this.syncSelection(this.getLocale());
  }

  /**
   * Desenho próprio do corpo de cada card (propriedade JS), no lugar da grade de campos; `null` num card mantém a
   * grade nele. Uma função nova refaz os cards.
   */
  get cardRender(): ArkDataViewCardRender | null {
    return this.cardFactory;
  }

  set cardRender(value: ArkDataViewCardRender | null | undefined) {
    this.cardFactory = typeof value === "function" ? value : null;
    if (this.isConnected) this.updateAppearance();
  }

  // --- Apresentação ---

  /** Apresentação pedida: "table", "cards" ou "auto" (padrão), que segue a largura do componente. */
  get view(): ArkDataViewView {
    const view = (this.getAttribute("view") || "").toLowerCase();
    return view === "table" || view === "cards" ? view : "auto";
  }

  set view(value: ArkDataViewView | string | null | undefined) {
    reflectAttr(this, "view", value);
  }

  /**
   * Esconde o seletor de visualização do canto (atributo `no-view-selector`). `view` continua decidindo a
   * apresentação: "auto" segue a largura, "table" e "cards" fixam uma.
   */
  get noViewSelector(): boolean {
    return this.hasAttribute("no-view-selector");
  }

  set noViewSelector(value: boolean | string | null | undefined) {
    this.toggleAttribute("no-view-selector", coerceBooleanAttr(value));
  }

  /** Apresentação em uso: a de `view`, ou em "auto" a que a largura do componente pede. */
  get resolvedView(): ArkDataViewLayout {
    const view = this.view;
    return view === "auto" ? (this.narrow ? "cards" : "table") : view;
  }

  /** Largura do componente, em px, abaixo da qual "auto" mostra cards. Padrão: 640. */
  get breakpoint(): number {
    return intAttr(this, "breakpoint", DEFAULT_BREAKPOINT, 0);
  }

  set breakpoint(value: number | string | null | undefined) {
    reflectAttr(this, "breakpoint", value);
  }

  /** Colunas da grade de campos do card (atributo `card-columns`), de 1 a 4. Padrão: 2. */
  get cardColumns(): number {
    return Math.min(4, intAttr(this, "card-columns", 2, 1));
  }

  set cardColumns(value: number | string | null | undefined) {
    reflectAttr(this, "card-columns", value);
  }

  // --- Consulta ---

  /** Quem busca, ordena e pagina: "client" (padrão, o componente) ou "server" (o app, a cada `ark-query-change`). */
  get mode(): ArkDataViewMode {
    return (this.getAttribute("mode") || "").toLowerCase() === "server" ? "server" : "client";
  }

  set mode(value: ArkDataViewMode | string | null | undefined) {
    reflectAttr(this, "mode", value);
  }

  /** Página pedida, a partir de 1; a exibida é limitada ao total de páginas (ver `query`). Padrão: 1. */
  get page(): number {
    return intAttr(this, "page", 1, 1);
  }

  set page(value: number | string | null | undefined) {
    reflectAttr(this, "page", value);
  }

  /** Itens por página (atributo `page-size`); 0, o padrão, mostra todos e esconde a paginação. */
  get pageSize(): number {
    return intAttr(this, "page-size", 0, 1);
  }

  set pageSize(value: number | string | null | undefined) {
    reflectAttr(this, "page-size", value);
  }

  /** Opções do seletor de itens por página (atributo `page-sizes`, separado por vírgula); vazio esconde o seletor. */
  get pageSizes(): number[] {
    return (this.getAttribute("page-sizes") || "")
      .split(",")
      .map((part) => Number.parseInt(part.trim(), 10))
      .filter((size) => Number.isFinite(size) && size > 0);
  }

  set pageSizes(value: number[] | string | null | undefined) {
    const list = Array.isArray(value) ? value.join(",") : value || "";
    reflectAttr(this, "page-sizes", list || null);
  }

  /** Total de registros no servidor (modo "server"); `null` usa o tamanho de `rows`. */
  get total(): number | null {
    const total = intAttr(this, "total", -1, 0);
    return total < 0 ? null : total;
  }

  set total(value: number | string | null | undefined) {
    reflectAttr(this, "total", value);
  }

  /** Ordenação atual, ou `null`; o atributo `sort` é "chave:asc" ou "chave:desc". */
  get sort(): ArkDataViewSort | null {
    return parseSort(this.getAttribute("sort"));
  }

  set sort(value: ArkDataViewSort | string | null | undefined) {
    if (value && typeof value === "object") {
      this.setAttribute("sort", `${value.key}:${value.direction === "desc" ? "desc" : "asc"}`);
    } else {
      reflectAttr(this, "sort", value || null);
    }
  }

  /** Texto da busca. */
  get search(): string {
    return this.getAttribute("search") || "";
  }

  set search(value: string | null | undefined) {
    reflectAttr(this, "search", value || null);
  }

  /** A consulta em uso: página exibida, itens por página, ordenação e busca. */
  get query(): ArkDataViewQuery {
    // Conectado, a última renderização já calculou a página exibida; fora da página, calcula na hora.
    const { page, pageSize } = (this.isConnected && this.computed) || this.compute();
    return { page, pageSize, sort: this.sort, search: this.search };
  }

  // --- Recursos opt-in ---

  /** Campo de busca visível. */
  get searchable(): boolean {
    return this.hasAttribute("searchable");
  }

  set searchable(value: boolean | string | null | undefined) {
    this.toggleAttribute("searchable", coerceBooleanAttr(value));
  }

  /** Caixa de seleção por registro e a de selecionar tudo. */
  get selectable(): boolean {
    return this.hasAttribute("selectable");
  }

  set selectable(value: boolean | string | null | undefined) {
    this.toggleAttribute("selectable", coerceBooleanAttr(value));
  }

  /** Alça de reordenar por registro; inativa enquanto há ordenação ou busca. */
  get reorderable(): boolean {
    return this.hasAttribute("reorderable");
  }

  set reorderable(value: boolean | string | null | undefined) {
    this.toggleAttribute("reorderable", coerceBooleanAttr(value));
  }

  /** Linha e card focáveis, que emitem `ark-row-click` ao clique, Enter ou Espaço. */
  get clickable(): boolean {
    return this.hasAttribute("clickable");
  }

  set clickable(value: boolean | string | null | undefined) {
    this.toggleAttribute("clickable", coerceBooleanAttr(value));
  }

  /** Consulta em andamento: placeholders sem registros, ou os registros atuais esmaecidos, com `aria-busy`. */
  get loading(): boolean {
    return this.hasAttribute("loading");
  }

  set loading(value: boolean | string | null | undefined) {
    this.toggleAttribute("loading", coerceBooleanAttr(value));
  }

  /** Limpa a seleção e emite `ark-selection-change`; sem seleção, não faz nada. */
  clearSelection(): void {
    if (this.selection.size === 0) return;
    this.selection.clear();
    this.syncSelection(this.getLocale());
    this.emitSelection();
  }

  // --- Modelo ---

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang"), this.getAttribute("locale-json") || undefined);
  }

  private getSize(): ArkSize {
    const size = (this.getAttribute("size") || "").toLowerCase();
    return size === "xs" || size === "sm" || size === "lg" || size === "xl" ? size : "md";
  }

  // A chave do registro é o valor de `row-key` quando é texto ou número; senão, a posição em `rows`.
  private keyOf(row: ArkDataViewRow, index: number): ArkDataViewKey {
    const value: unknown = row[this.rowKey];
    return typeof value === "string" || typeof value === "number" ? value : index;
  }

  // Troca os registros. No modo "client", a seleção de um registro que estava na lista e saiu dela é descartada
  // (o app excluiu); chaves que nunca estiveram na lista ficam, para uma seleção gravada antes de `rows` valer.
  private setRows(rows: ArkDataViewRow[]): void {
    const previous = this.rowsModel;
    this.rowsModel = rows.filter((row) => typeof row === "object" && row !== null);
    if (this.selection.size === 0 || this.mode === "server") return;
    const before = new Set(previous.map((row, index) => String(this.keyOf(row, index))));
    const after = new Set(this.rowsModel.map((row, index) => String(this.keyOf(row, index))));
    for (const id of Array.from(this.selection.keys())) {
      if (before.has(id) && !after.has(id)) this.selection.delete(id);
    }
  }

  private setColumns(columns: ArkDataViewRow[]): void {
    this.columnsModel = columns.filter(
      (column): column is ArkDataViewColumn =>
        typeof column === "object" && column !== null && typeof column.key === "string" && column.key !== ""
    );
  }

  // Registros da página: no modo "server" são os que o app entregou; no "client" passam por busca, ordenação e
  // corte. A página é limitada ao total de páginas, sem reescrever o atributo.
  private compute(): Computed {
    const all = this.rowsModel.map((row, index): Entry => {
      const key = this.keyOf(row, index);
      return { row, key, id: String(key), index };
    });
    const pageSize = this.pageSize;
    const clamp = (total: number): number =>
      pageSize > 0 ? Math.min(this.page, Math.max(1, Math.ceil(total / pageSize))) : 1;

    if (this.mode === "server") {
      const total = this.total ?? all.length;
      return { entries: all, total, page: clamp(total), pageSize };
    }

    let entries = all;
    const search = fold(this.search.trim());
    if (search) {
      const columns = this.columnsModel.filter((column) => column.searchable !== false);
      entries = entries.filter((entry) =>
        columns.some((column) => fold(textOf(valueAt(entry.row, column.key))).includes(search))
      );
    }

    const sort = this.sort;
    if (sort) {
      const column = this.columnsModel.find((item) => item.key === sort.key);
      const direction = sort.direction === "desc" ? -1 : 1;
      entries = entries.slice().sort((a, b) => {
        let order: number;
        if (column && typeof column.compare === "function") {
          order = direction * column.compare(a.row, b.row);
        } else {
          const left = valueAt(a.row, sort.key);
          const right = valueAt(b.row, sort.key);
          // Vazios sempre ao fim, nos dois sentidos.
          if (isEmpty(left) || isEmpty(right)) order = isEmpty(left) === isEmpty(right) ? 0 : isEmpty(left) ? 1 : -1;
          else order = direction * compareValues(left, right);
        }
        return order || a.index - b.index;
      });
    }

    const total = entries.length;
    const page = clamp(total);
    if (pageSize > 0) entries = entries.slice((page - 1) * pageSize, page * pageSize);
    return { entries, total, page, pageSize };
  }

  /** Texto principal de um registro (a coluna de título, ou a primeira), para os rótulos acessíveis. */
  private primaryText(row: ArkDataViewRow): string {
    const column = this.columnsModel.find((item) => item.cardRole === "title") ?? this.columnsModel[0];
    return column ? textOf(valueAt(row, column.key)) : "";
  }

  // --- Eventos ---

  // Aplica uma mudança de consulta (os atributos são a fonte), renderiza uma vez e publica a consulta inteira.
  private changeQuery(reason: ArkDataViewQueryChangeDetail["reason"], apply: () => void): void {
    this.suspended = true;
    apply();
    this.suspended = false;
    this.updateAppearance();
    const detail: ArkDataViewQueryChangeDetail = { ...this.query, reason };
    this.dispatchEvent(new CustomEvent("ark-query-change", { detail, bubbles: true, composed: true }));
  }

  // Buscar, ordenar ou trocar os itens por página volta para a primeira página.
  private resetPage(): void {
    if (this.page !== 1) this.setAttribute("page", "1");
  }

  private emitSelection(): void {
    const detail: ArkDataViewSelectionChangeDetail = {
      selected: this.selected,
      rows: this.rowsModel.filter((row, index) => this.selection.has(String(this.keyOf(row, index))))
    };
    this.dispatchEvent(new CustomEvent("ark-selection-change", { detail, bubbles: true, composed: true }));
  }

  private emitRowClick(rowEl: HTMLElement): void {
    const entry = this.visible[this.rowOrder.indexOf(rowEl)];
    if (!entry) return;
    const detail: ArkDataViewRowClickDetail = { row: entry.row, key: entry.key, index: entry.index };
    this.dispatchEvent(new CustomEvent("ark-row-click", { detail, bubbles: true, composed: true }));
  }

  // --- Interação ---

  // Ciclo do cabeçalho: crescente, decrescente, sem ordenação.
  private toggleSort(key: string): void {
    const current = this.sort;
    let next: ArkDataViewSort | null = { key, direction: "asc" };
    if (current && current.key === key) next = current.direction === "asc" ? { key, direction: "desc" } : null;
    this.applySort(next);
  }

  private applySort(next: ArkDataViewSort | null): void {
    this.changeQuery("sort", () => {
      syncAttr(this, "sort", next ? `${next.key}:${next.direction}` : null);
      this.resetPage();
    });
    const locale = this.getLocale();
    if (!next) {
      announce(locale.sortCleared);
      return;
    }
    const column = this.columnsModel.find((item) => item.key === next.key);
    announce(
      locale.sortedBy
        .replace("{column}", column?.label ?? next.key)
        .replace("{direction}", next.direction === "asc" ? locale.sortAscending : locale.sortDescending)
    );
  }

  private scheduleSearch(): void {
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    const delay = intAttr(this, "search-debounce", DEFAULT_SEARCH_DEBOUNCE, 0);
    if (delay === 0) {
      this.searchTimer = null;
      this.commitSearch();
      return;
    }
    this.searchTimer = window.setTimeout(() => {
      this.searchTimer = null;
      this.commitSearch();
    }, delay);
  }

  private commitSearch(): void {
    if (this.searchTimer !== null) window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    const value = this.searchEl?.value ?? "";
    if (value === this.search) return;
    this.changeQuery("search", () => {
      syncAttr(this, "search", value || null);
      this.resetPage();
    });
  }

  // Clique no conteúdo: o botão de um cabeçalho ordenável, ou uma linha clicável fora dos controles dela.
  private readonly handleContentClick = (event: MouseEvent): void => {
    const target = event.target as Element | null;
    if (!target) return;
    const sortButton = target.closest<HTMLElement>("[data-ark-sort-key]");
    if (sortButton) {
      this.toggleSort(sortButton.dataset.arkSortKey ?? "");
      return;
    }
    if (!this.clickable) return;
    const rowEl = target.closest<HTMLElement>("[data-ark-row]");
    if (!rowEl || this.rowEls.get(rowEl.dataset.arkRow ?? "") !== rowEl) return;
    const interactive = target.closest(INTERACTIVE);
    if (interactive && interactive !== rowEl && rowEl.contains(interactive)) return;
    // Quem está selecionando texto da linha não quer abri-la.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && rowEl.contains(selection.anchorNode)) return;
    this.emitRowClick(rowEl);
  };

  // Enter ou Espaço com o foco na própria linha (não num controle dentro dela).
  private readonly handleContentKeydown = (event: KeyboardEvent): void => {
    if (!this.clickable || (event.key !== "Enter" && event.key !== " ")) return;
    const rowEl = event.target;
    if (!(rowEl instanceof HTMLElement) || this.rowEls.get(rowEl.dataset.arkRow ?? "") !== rowEl) return;
    event.preventDefault();
    this.emitRowClick(rowEl);
  };

  // `change` das caixas de seleção próprias: não sai do host; quem escuta recebe `ark-selection-change`. O `change`
  // de um controle do app dentro de uma célula passa direto.
  private readonly handleSelectChange = (event: Event): void => {
    const box = event.target;
    if (!(box instanceof HTMLElement) || box.tagName.toLowerCase() !== "ark-checkbox") return;
    const part = box.getAttribute("data-ark-chrome");
    if (part !== "select" && part !== "select-all") return;
    event.stopPropagation();

    if (part === "select-all") {
      // Tudo que está à vista marcado: desmarca; senão marca o que falta.
      const all = this.visible.length > 0 && this.visible.every((entry) => this.selection.has(entry.id));
      for (const entry of this.visible) {
        if (all) this.selection.delete(entry.id);
        else this.selection.set(entry.id, entry.key);
      }
    } else {
      const rowEl = box.closest<HTMLElement>("[data-ark-row]");
      const entry = rowEl ? this.visible[this.rowOrder.indexOf(rowEl)] : undefined;
      if (!entry) return;
      if ((box as ArkCheckbox).checked) this.selection.set(entry.id, entry.key);
      else this.selection.delete(entry.id);
    }
    this.syncSelection(this.getLocale());
    this.emitSelection();
  };

  private measureNarrow(): boolean {
    const width = this.getBoundingClientRect().width;
    // Sem layout (host oculto ou fora da página) não há o que medir: fica como estava.
    if (width === 0) return this.narrow;
    return width < this.breakpoint + (this.narrow ? NARROW_HYSTERESIS : 0);
  }

  private handleResize(): void {
    const narrow = this.measureNarrow();
    if (narrow !== this.narrow) {
      this.narrow = narrow;
      this.updateAppearance();
    } else {
      this.syncOverflow(this.getAttribute("label") || "", this.getLocale());
    }
  }

  // --- Reordenação ---

  private readonly handleDragStart = (event: PointerEvent): void => {
    this.suppressHandleClick = false;
    if (event.button !== 0) return;
    const handle = event.currentTarget as HTMLButtonElement;
    const rowEl = handle.closest<HTMLElement>("[data-ark-row]");
    const from = rowEl ? this.rowOrder.indexOf(rowEl) : -1;
    if (handle.disabled || from < 0) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.focus();
    this.drag = {
      from,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pointerX: event.clientX,
      pointerY: event.clientY,
      active: false,
      target: null,
      scroller: scrollParentOf(this)
    };
  };

  private readonly handleDragMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.pointerX = event.clientX;
    drag.pointerY = event.clientY;
    if (!drag.active) {
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < DRAG_THRESHOLD) return;
      drag.active = true;
      this.setAttribute("data-ark-dragging", "");
      this.rowOrder[drag.from]?.setAttribute("data-ark-drag-source", "");
      // Cards numa coluna só ficam empilhados e a linha de inserção deita entre eles; lado a lado ela fica em pé,
      // na borda do card (components.css).
      const lefts = new Set(this.rowOrder.map((rowEl) => Math.round(rowEl.getBoundingClientRect().left)));
      this.toggleAttribute("data-ark-drop-stacked", this.resolvedView === "cards" && lefts.size <= 1);
      if (this.scrollFrame === null) this.scrollFrame = requestAnimationFrame(this.autoScroll);
    }
    this.markDrop(drag);
  };

  // A marca mostra de que lado o registro vai entrar: antes do alvo ao subir, depois dele ao descer.
  private markDrop(drag: Drag): void {
    const target = this.dropIndexAt(drag.pointerX, drag.pointerY);
    if (target === drag.target) return;
    drag.target = target;
    for (const [index, rowEl] of this.rowOrder.entries()) {
      syncAttr(
        rowEl,
        "data-ark-drop",
        index === target && target !== drag.from ? (target < drag.from ? "before" : "after") : null
      );
    }
  }

  // Com o ponteiro junto à borda de cima ou de baixo da área de rolagem, a lista rola sob ele (mais rápido quanto
  // mais perto da borda) e o alvo é recalculado: sem isso um arrasto não passa do que cabe na tela.
  private readonly autoScroll = (): void => {
    this.scrollFrame = null;
    const drag = this.drag;
    if (!drag?.active) return;
    const bounds = drag.scroller?.getBoundingClientRect();
    const top = bounds ? Math.max(0, bounds.top) : 0;
    const bottom = bounds ? Math.min(window.innerHeight, bounds.bottom) : window.innerHeight;
    let over = 0;
    if (drag.pointerY < top + SCROLL_EDGE) over = drag.pointerY - (top + SCROLL_EDGE);
    else if (drag.pointerY > bottom - SCROLL_EDGE) over = drag.pointerY - (bottom - SCROLL_EDGE);
    if (over !== 0) {
      const step = Math.sign(over) * Math.ceil((Math.min(Math.abs(over), SCROLL_EDGE) / SCROLL_EDGE) * SCROLL_SPEED);
      if (drag.scroller) drag.scroller.scrollTop += step;
      else window.scrollBy(0, step);
      this.markDrop(drag);
    }
    this.scrollFrame = requestAnimationFrame(this.autoScroll);
  };

  private readonly handleDragEnd = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    const target = event.type === "pointerup" && drag.active ? drag.target : null;
    // O `click` que o navegador dispara ao soltar um arrasto não é um toque na alça; ele vem na mesma leva de
    // eventos, então a marca cai logo depois, para não engolir um Enter futuro quando o clique não vier.
    this.suppressHandleClick = drag.active;
    if (drag.active) {
      window.setTimeout(() => {
        this.suppressHandleClick = false;
      }, 0);
    }
    this.endDrag();
    if (target !== null && target !== drag.from) this.moveRow(drag.from, target);
  };

  // Um toque (ou Enter/Espaço) na alça abre o menu de mover: a alternativa de um ponteiro só, sem arrastar, e o
  // caminho para levar um registro ao início ou ao fim da lista, além da página à vista.
  private readonly handleHandleClick = (event: MouseEvent): void => {
    if (this.suppressHandleClick) {
      this.suppressHandleClick = false;
      return;
    }
    const handle = event.currentTarget as HTMLButtonElement;
    const rowEl = handle.closest<HTMLElement>("[data-ark-row]");
    const position = rowEl ? this.rowOrder.indexOf(rowEl) : -1;
    const entry = this.visible[position];
    if (handle.disabled || !entry) return;
    const closed = this.menuClosed;
    this.menuClosed = null;
    // Só o clique de ponteiro: o pointerdown dele, fora do menu, já o fechou. Enter e Espaço (detail 0) reabrem.
    if (event.detail > 0 && closed?.id === entry.id && event.timeStamp - closed.time < MENU_REOPEN_GUARD) return;

    const locale = this.getLocale();
    const menu = this.ensureMenu();
    const last = this.rowsModel.length - 1;
    const options: Array<[string, string, boolean]> = [
      ["up", locale.moveUp, position === 0],
      ["down", locale.moveDown, position === this.visible.length - 1],
      ["start", locale.moveToStart, entry.index === 0],
      ["end", locale.moveToEnd, entry.index === last]
    ];
    const items = Array.from(menu.querySelectorAll<HTMLElement>("ark-menu-item"));
    for (const [index, [value, label, disabled]] of options.entries()) {
      const item = items[index];
      if (!item) continue;
      if (item.textContent !== label) item.textContent = label;
      item.toggleAttribute("disabled", disabled);
      applyTestHooks(this, "data-view", item, `move-${value}`);
    }
    syncAttr(menu, "aria-label", handle.getAttribute("aria-label"));
    syncAttr(menu, "size", SIZES[this.getSize()].toggle);
    applyTestHooks(this, "data-view", menu, "menu");
    this.menuTarget = { entry, position };
    handle.setAttribute("aria-expanded", "true");
    const rect = handle.getBoundingClientRect();
    menu.openAt(rect.left, rect.bottom + 4);
  };

  // O menu é um só para todas as alças, criado no primeiro uso: uma view sem `reorderable` não o carrega.
  private ensureMenu(): ArkMenu {
    if (this.menuEl) return this.menuEl;
    const menu = document.createElement("ark-menu") as ArkMenu;
    menu.setAttribute("data-ark-chrome", "menu");
    for (const value of ["up", "down", "start", "end"]) {
      const item = document.createElement("ark-menu-item");
      item.setAttribute("value", value);
      menu.appendChild(item);
    }
    // Os eventos do menu composto não saem do host: mover chega ao app por `ark-reorder`.
    menu.addEventListener("ark-open", (event) => event.stopPropagation());
    menu.addEventListener("ark-select", (event) => {
      event.stopPropagation();
      const target = this.menuTarget;
      this.menuTarget = null;
      if (!target) return;
      const value = (event as CustomEvent<{ value: string }>).detail.value;
      if (value === "up") this.moveRow(target.position, target.position - 1);
      else if (value === "down") this.moveRow(target.position, target.position + 1);
      else this.moveTo(target.entry, value === "start" ? 0 : this.rowsModel.length - 1, target.position);
    });
    menu.addEventListener("ark-close", (event) => {
      event.stopPropagation();
      for (const handle of Array.from(this.querySelectorAll('[data-ark-chrome="handle"][aria-expanded="true"]'))) {
        handle.setAttribute("aria-expanded", "false");
      }
      // Fechado sem escolha (Esc, clique fora): o foco volta para a alça que o abriu.
      const target = this.menuTarget;
      this.menuTarget = null;
      if (!target) return;
      this.menuClosed = { id: target.entry.id, time: event.timeStamp };
      this.rowEls.get(target.entry.id)?.querySelector<HTMLElement>('[data-ark-chrome="handle"]')?.focus();
    });
    this.appendChild(menu);
    this.menuEl = menu;
    return menu;
  }

  // Setas na alça movem o registro uma posição (nos cards, também as horizontais); Esc cancela um arrasto.
  private readonly handleHandleKeydown = (event: KeyboardEvent): void => {
    const handle = event.currentTarget as HTMLButtonElement;
    if (event.key === "Escape" && this.drag) {
      event.preventDefault();
      if (handle.hasPointerCapture(this.drag.pointerId)) handle.releasePointerCapture(this.drag.pointerId);
      this.endDrag();
      return;
    }
    const rowEl = handle.closest<HTMLElement>("[data-ark-row]");
    const from = rowEl ? this.rowOrder.indexOf(rowEl) : -1;
    if (handle.disabled || from < 0) return;
    const cards = this.resolvedView === "cards";
    let step = 0;
    if (event.key === "ArrowUp" || (cards && event.key === "ArrowLeft")) step = -1;
    else if (event.key === "ArrowDown" || (cards && event.key === "ArrowRight")) step = 1;
    if (step === 0) return;
    event.preventDefault();
    const to = from + step;
    if (to >= 0 && to < this.rowOrder.length) this.moveRow(from, to);
  };

  private endDrag(): void {
    if (this.scrollFrame !== null) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = null;
    if (!this.drag) return;
    this.drag = null;
    this.removeAttribute("data-ark-dragging");
    this.removeAttribute("data-ark-drop-stacked");
    for (const rowEl of this.rowOrder) {
      rowEl.removeAttribute("data-ark-drop");
      rowEl.removeAttribute("data-ark-drag-source");
    }
  }

  // Posição, entre os registros visíveis, sobre a qual o ponteiro está: na tabela a linha na altura dele, nos
  // cards o card sob ele (ou o de centro mais próximo, quando está num vão).
  private dropIndexAt(x: number, y: number): number {
    const rects = this.rowOrder.map((rowEl) => rowEl.getBoundingClientRect());
    if (this.resolvedView === "table") {
      const index = rects.findIndex((rect) => y < rect.bottom);
      return index < 0 ? rects.length - 1 : index;
    }
    const inside = rects.findIndex((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
    if (inside >= 0) return inside;
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    for (const [index, rect] of rects.entries()) {
      const distance = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    }
    return nearest;
  }

  // Move o registro visível `from` para a posição do visível `to` (o que o arrasto e as setas fazem).
  private moveRow(from: number, to: number): void {
    const source = this.visible[from];
    const target = this.visible[to];
    if (!source || !target) return;
    this.moveTo(source, target.index, from);
  }

  // Move um registro para a posição `to` de `rows`: reordena a lista, devolve o foco à alça dele (ou à que ficou na
  // posição `position` da tela, quando ele saiu da página), emite `ark-reorder` e anuncia a posição nova.
  private moveTo(source: Entry, to: number, position: number): void {
    const rows = this.rowsModel.slice();
    if (rows[source.index] !== source.row || to === source.index || to < 0 || to >= rows.length) return;
    const [moved] = rows.splice(source.index, 1);
    rows.splice(to, 0, moved);
    this.rowsModel = rows;
    const key = this.keyOf(moved, to);
    this.pendingFocus = { part: "handle", id: String(key), index: position };
    this.updateAppearance();

    const detail: ArkDataViewReorderDetail = { key, from: source.index, to, rows: this.rows };
    this.dispatchEvent(new CustomEvent("ark-reorder", { detail, bubbles: true, composed: true }));
    const locale = this.getLocale();
    announce(locale.movedTo.replace("{position}", String(to + 1)).replace("{count}", String(rows.length)));
  }

  // Encaixa os nós do componente em volta dos filhos do usuário, que nunca são movidos, para a ordem do DOM (a de
  // tabulação) seguir a visual: busca e ordenação antes de tudo, seletor de visualização e barra de seleção logo
  // depois do slot `toolbar`, conteúdo, rodapé e menu ao fim. Um filho que chega depois da montagem (um slot que um
  // framework renderiza sob condição) entra atrás de tudo, e os nós próprios se reencaixam em volta dele, com o
  // foco e a rolagem horizontal preservados.
  private arrangeChrome(): void {
    const present = <T extends HTMLElement>(nodes: Array<T | null>): T[] => nodes.filter((node): node is T => !!node);
    const head = present<HTMLElement>([this.searchEl, this.sortEl]);
    const middle = present<HTMLElement>([this.viewsEl, this.selectionEl]);
    const tail = present<HTMLElement>([this.contentEl, this.footerEl, this.menuEl]);
    const own = new Set<Element>([...head, ...middle, ...tail]);
    const users = Array.from(this.children).filter((child) => !own.has(child));
    const toolbar = users.findIndex((child) => child.getAttribute("slot") === "toolbar");
    const cut = toolbar + 1;
    const wanted = [...head, ...users.slice(0, cut), ...middle, ...users.slice(cut), ...tail];
    const current = Array.from(this.children);
    if (wanted.length === current.length && wanted.every((node, index) => node === current[index])) return;

    const active = document.activeElement;
    const focused = active instanceof HTMLElement && this.contains(active) ? active : null;
    const scrollLeft = this.contentEl?.scrollLeft ?? 0;
    this.append(...tail);
    const afterToolbar = users[cut] ?? tail[0] ?? null;
    for (const node of middle) this.insertBefore(node, afterToolbar);
    const first = users[0] ?? middle[0] ?? tail[0] ?? null;
    for (const node of head) this.insertBefore(node, first);
    if (this.contentEl) this.contentEl.scrollLeft = scrollLeft;
    if (focused && document.activeElement !== focused) focused.focus();
  }

  // --- Renderização ---

  private render(): void {
    const search = document.createElement("ark-input") as ArkInput;
    search.setAttribute("data-ark-chrome", "search");
    search.setAttribute("type", "search");
    search.setAttribute("autocomplete", "off");
    const searchIcon = document.createElement("span");
    searchIcon.setAttribute("slot", "prefix");
    searchIcon.setAttribute("aria-hidden", "true");
    searchIcon.innerHTML = SEARCH_SVG;
    search.appendChild(searchIcon);
    // `input` e `change` do campo próprio não saem do host: a busca chega ao app por `ark-query-change`.
    search.addEventListener("input", (event) => {
      event.stopPropagation();
      this.scheduleSearch();
    });
    search.addEventListener("change", (event) => event.stopPropagation());
    search.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      this.commitSearch();
    });

    const sort = document.createElement("ark-select") as ArkSelect;
    sort.setAttribute("data-ark-chrome", "sort");
    // O <select> nativo também emite `input`, que o ark-select deixa subir.
    sort.addEventListener("input", (event) => event.stopPropagation());
    sort.addEventListener("change", (event) => {
      event.stopPropagation();
      this.applySort(parseSort(sort.value));
    });

    const views = document.createElement("ark-toggle-group") as ArkToggleGroup;
    views.setAttribute("data-ark-chrome", "views");
    for (const [layout, icon] of [
      ["table", TABLE_SVG],
      ["cards", CARDS_SVG]
    ]) {
      const toggle = document.createElement("ark-toggle") as ArkToggle;
      toggle.setAttribute("value", layout);
      toggle.innerHTML = icon;
      views.appendChild(toggle);
    }
    views.addEventListener("change", (event) => {
      event.stopPropagation();
      const value = (event as CustomEvent<{ value?: string }>).detail?.value;
      const current = this.resolvedView;
      if (value !== "table" && value !== "cards") {
        // Clicar na visualização ativa a soltaria: o seletor sempre tem uma escolhida.
        views.setAttribute("value", current);
        return;
      }
      if (value === current) return;
      this.setAttribute("view", value);
      const detail: ArkDataViewViewChangeDetail = { view: value };
      this.dispatchEvent(new CustomEvent("ark-view-change", { detail, bubbles: true, composed: true }));
    });

    const selection = document.createElement("div");
    selection.setAttribute("data-ark-chrome", "selection");
    const selectionAll = document.createElement("ark-checkbox") as ArkCheckbox;
    selectionAll.setAttribute("data-ark-chrome", "select-all");
    const selectionCount = document.createElement("span");
    const clear = document.createElement("ark-button") as ArkButton;
    clear.setAttribute("variant", "ghost");
    clear.setAttribute("intent", "neutral");
    clear.addEventListener("click", () => this.clearSelection());
    selection.append(selectionAll, selectionCount, clear);
    selection.addEventListener("change", this.handleSelectChange);

    const content = document.createElement("div");
    content.setAttribute("data-ark-chrome", "content");
    content.addEventListener("click", this.handleContentClick);
    content.addEventListener("keydown", this.handleContentKeydown);
    content.addEventListener("change", this.handleSelectChange);

    const footer = document.createElement("div");
    footer.setAttribute("data-ark-chrome", "footer");
    const pagination = document.createElement("ark-pagination") as ArkPagination;
    pagination.addEventListener("ark-page-change", (event) => {
      // O evento da paginação composta não sai do host: vira `ark-query-change`.
      event.stopPropagation();
      const detail = (event as CustomEvent<ArkPageChangeDetail>).detail;
      this.changeQuery(detail.pageSize !== this.pageSize ? "page-size" : "page", () => {
        syncAttr(this, "page-size", String(detail.pageSize));
        syncAttr(this, "page", String(detail.page));
      });
    });
    footer.appendChild(pagination);

    this.searchEl = search;
    this.sortEl = sort;
    this.viewsEl = views;
    this.selectionEl = selection;
    this.selectionAllEl = selectionAll;
    this.selectionCountEl = selectionCount;
    this.clearEl = clear;
    this.contentEl = content;
    this.footerEl = footer;
    this.paginationEl = pagination;

    // Em volta dos filhos do usuário, sem movê-los; a posição visual vem da grid em components.css.
    this.arrangeChrome();
  }

  // Conteúdo de uma célula: o que `render` da coluna devolver (nó ou texto), senão o valor do campo como texto.
  private fillCell(target: HTMLElement, entry: Entry, column: ArkDataViewColumn, layout: ArkDataViewLayout): void {
    const value = valueAt(entry.row, column.key);
    const custom =
      typeof column.render === "function"
        ? column.render({ row: entry.row, column, value, index: entry.index, view: layout })
        : undefined;
    if (custom instanceof Node) target.appendChild(custom);
    else target.textContent = custom === null || custom === undefined ? textOf(value) : String(custom);
    applyTestHooks(this, "data-view", target, "cell");
  }

  private createHandle(entry: Entry, ctx: RenderContext): HTMLButtonElement {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.setAttribute("data-ark-chrome", "handle");
    handle.setAttribute("data-ark-control", "");
    const label = `${ctx.locale.reorder} ${this.primaryText(entry.row)}`.trim();
    handle.setAttribute("aria-label", label);
    handle.setAttribute("aria-haspopup", "menu");
    handle.setAttribute("aria-expanded", "false");
    handle.title = ctx.locale.reorder;
    handle.disabled = !ctx.canReorder;
    handle.innerHTML = GRIP_SVG;
    handle.className =
      "ark:inline-flex ark:h-6 ark:w-6 ark:shrink-0 ark:cursor-grab ark:touch-none ark:items-center ark:justify-center ark:rounded ark:text-fg-muted ark:outline-none ark:transition-colors ark:hover:bg-surface-strong ark:hover:text-fg ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring ark:disabled:cursor-not-allowed ark:disabled:opacity-40 ark:disabled:hover:bg-transparent";
    handle.addEventListener("pointerdown", this.handleDragStart);
    handle.addEventListener("pointermove", this.handleDragMove);
    handle.addEventListener("pointerup", this.handleDragEnd);
    handle.addEventListener("pointercancel", this.handleDragEnd);
    handle.addEventListener("click", this.handleHandleClick);
    handle.addEventListener("keydown", this.handleHandleKeydown);
    applyTestHooks(this, "data-view", handle, "handle");
    return handle;
  }

  private createRowCheckbox(entry: Entry, ctx: RenderContext): ArkCheckbox {
    const box = document.createElement("ark-checkbox") as ArkCheckbox;
    box.setAttribute("data-ark-chrome", "select");
    box.setAttribute("data-ark-control", "");
    box.setAttribute("size", ctx.size.check);
    box.setAttribute("aria-label", `${ctx.locale.selectRow} ${this.primaryText(entry.row)}`.trim());
    applyTestHooks(this, "data-view", box, "select");
    return box;
  }

  private registerRow(rowEl: HTMLElement, entry: Entry, ctx: RenderContext): void {
    rowEl.dataset.arkRow = entry.id;
    if (ctx.clickable) rowEl.tabIndex = 0;
    this.rowEls.set(entry.id, rowEl);
    this.rowOrder.push(rowEl);
  }

  private buildTable(ctx: RenderContext): HTMLTableElement {
    const { locale, size } = ctx;
    const sort = this.sort;
    const table = document.createElement("table");
    table.className = "ark:w-full ark:border-collapse ark:text-left";
    if (ctx.label) table.setAttribute("aria-label", ctx.label);

    const headRow = document.createElement("tr");
    const headBase = "ark:border-b ark:border-border ark:bg-surface-muted ark:font-semibold ark:text-fg-soft";
    const control = "ark:w-0 ark:whitespace-nowrap";

    if (ctx.reorderable) {
      const th = document.createElement("th");
      th.className = [headBase, control, size.cell].join(" ");
      const hidden = document.createElement("span");
      hidden.className = "ark:sr-only";
      hidden.textContent = locale.reorder;
      th.appendChild(hidden);
      headRow.appendChild(th);
    }
    if (ctx.selectable) {
      const th = document.createElement("th");
      th.className = [headBase, control, size.cell].join(" ");
      const all = document.createElement("ark-checkbox") as ArkCheckbox;
      all.setAttribute("data-ark-chrome", "select-all");
      all.setAttribute("size", size.check);
      all.setAttribute("aria-label", locale.selectAll);
      all.className = "ark:align-middle";
      applyTestHooks(this, "data-view", all, "select-all");
      th.appendChild(all);
      headRow.appendChild(th);
      this.headAllEl = all;
    }

    for (const column of ctx.columns) {
      const th = document.createElement("th");
      th.scope = "col";
      th.className = [headBase, "ark:whitespace-nowrap", size.cell, ALIGNMENTS[column.align ?? "left"] ?? ""].join(" ");
      if (column.width) th.style.width = column.width;
      const label = column.label ?? column.key;
      if (column.sortable) {
        const state = sort && sort.key === column.key ? sort.direction : "none";
        th.setAttribute("aria-sort", state === "asc" ? "ascending" : state === "desc" ? "descending" : "none");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.arkSortKey = column.key;
        button.className = [
          "ark:inline-flex ark:cursor-pointer ark:items-center ark:gap-1 ark:rounded ark:font-semibold ark:outline-none ark:transition-colors ark:hover:text-fg ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring",
          state === "none" ? "" : "ark:text-fg"
        ]
          .join(" ")
          .trim();
        const text = document.createElement("span");
        text.textContent = label;
        const icon = document.createElement("span");
        icon.setAttribute("aria-hidden", "true");
        icon.innerHTML = SORT_SVG[state];
        button.append(text, icon);
        applyTestHooks(this, "data-view", button, "sort-button");
        th.appendChild(button);
      } else {
        th.textContent = label;
      }
      applyTestHooks(this, "data-view", th, "header");
      headRow.appendChild(th);
    }
    const head = document.createElement("thead");
    head.appendChild(headRow);

    const body = document.createElement("tbody");
    for (const entry of ctx.entries) {
      const tr = document.createElement("tr");
      this.registerRow(tr, entry, ctx);
      // Sem outline-none: ele zeraria o estilo do outline que o foco da linha clicável usa (um anel por box-shadow
      // não desenha num <tr>).
      tr.className = [
        "ark:border-b ark:border-border ark:transition-colors ark:last:border-b-0 ark:data-[ark-selected]:bg-primary-soft",
        ctx.clickable
          ? "ark:cursor-pointer ark:hover:bg-surface-muted ark:focus-visible:bg-surface-muted ark:focus-visible:outline-2 ark:focus-visible:-outline-offset-2 ark:focus-visible:outline-primary-ring"
          : ""
      ]
        .join(" ")
        .trim();

      if (ctx.reorderable) {
        const td = document.createElement("td");
        td.setAttribute("data-ark-control", "");
        td.className = [control, size.cell, "ark:align-middle"].join(" ");
        td.appendChild(this.createHandle(entry, ctx));
        tr.appendChild(td);
      }
      if (ctx.selectable) {
        const td = document.createElement("td");
        td.setAttribute("data-ark-control", "");
        td.className = [control, size.cell, "ark:align-middle"].join(" ");
        const box = this.createRowCheckbox(entry, ctx);
        box.className = "ark:align-middle";
        td.appendChild(box);
        tr.appendChild(td);
      }
      for (const column of ctx.columns) {
        // A coluna `rowHeader` é o cabeçalho da linha (<th scope="row">): andando pelas outras colunas, o leitor de
        // tela anuncia de qual registro é a célula. O peso da fonte segue o da célula comum.
        const cell = document.createElement(column.rowHeader ? "th" : "td");
        if (column.rowHeader) cell.scope = "row";
        cell.className = [
          size.cell,
          "ark:align-middle",
          column.rowHeader ? "ark:font-normal" : "",
          ALIGNMENTS[column.align ?? "left"] ?? ""
        ]
          .filter(Boolean)
          .join(" ");
        this.fillCell(cell, entry, column, "table");
        tr.appendChild(cell);
      }
      applyTestHooks(this, "data-view", tr, "row");
      body.appendChild(tr);
    }

    table.append(head, body);
    applyTestHooks(this, "data-view", table, "table");
    return table;
  }

  private buildCards(ctx: RenderContext): HTMLUListElement {
    const { size } = ctx;
    const cardColumns = this.cardColumns;
    const titles = ctx.columns.filter((column) => column.cardRole === "title");
    const fields = ctx.columns.filter((column) => column.cardRole !== "title");

    const list = document.createElement("ul");
    // list-style none tira a semântica de lista em alguns leitores de tela; o role a devolve.
    list.setAttribute("role", "list");
    if (ctx.label) list.setAttribute("aria-label", ctx.label);
    list.className = "ark:grid ark:list-none ark:gap-3";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(min(100%, var(--ark-data-view-card-min, 16rem)), 1fr))";

    for (const entry of ctx.entries) {
      const card = document.createElement("li");
      this.registerRow(card, entry, ctx);
      card.className = [
        "ark:relative ark:flex ark:min-w-0 ark:flex-col ark:rounded-lg ark:border ark:border-border ark:bg-surface ark:text-fg ark:outline-none ark:transition-colors ark:data-[ark-selected]:border-primary ark:data-[ark-selected]:bg-primary-soft",
        size.card,
        ctx.clickable
          ? "ark:cursor-pointer ark:hover:border-border-strong ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring"
          : ""
      ]
        .join(" ")
        .trim();

      if (ctx.reorderable || ctx.selectable || titles.length > 0) {
        const head = document.createElement("div");
        head.className = "ark:flex ark:items-center ark:gap-2";
        if (ctx.reorderable) head.appendChild(this.createHandle(entry, ctx));
        if (ctx.selectable) head.appendChild(this.createRowCheckbox(entry, ctx));
        const title = document.createElement("div");
        title.className = "ark:min-w-0 ark:flex-1 ark:font-semibold";
        for (const column of titles) {
          const line = document.createElement("div");
          line.className = "ark:min-w-0 ark:break-words";
          this.fillCell(line, entry, column, "cards");
          title.appendChild(line);
        }
        head.appendChild(title);
        card.appendChild(head);
      }

      const custom = this.cardFactory ? this.cardFactory({ row: entry.row, index: entry.index }) : undefined;
      if (custom !== null && custom !== undefined) {
        const body = document.createElement("div");
        body.className = "ark:min-w-0";
        if (custom instanceof Node) body.appendChild(custom);
        else body.textContent = String(custom);
        applyTestHooks(this, "data-view", body, "card-body");
        card.appendChild(body);
      } else if (fields.length > 0) {
        const grid = document.createElement("dl");
        grid.className = ["ark:grid ark:gap-x-4 ark:gap-y-2", CARD_COLUMNS[cardColumns]].join(" ");
        for (const column of fields) {
          const field = document.createElement("div");
          const span = Math.min(cardColumns, Math.max(1, Math.floor(Number(column.cardSpan) || 1)));
          field.className = ["ark:min-w-0", CARD_SPANS[span]].join(" ");
          const term = document.createElement("dt");
          term.textContent = column.label ?? column.key;
          term.className = column.cardLabel === false ? "ark:sr-only" : ["ark:text-fg-muted", size.label].join(" ");
          const description = document.createElement("dd");
          description.className = "ark:min-w-0 ark:break-words";
          this.fillCell(description, entry, column, "cards");
          field.append(term, description);
          grid.appendChild(field);
        }
        card.appendChild(grid);
      }

      applyTestHooks(this, "data-view", card, "card");
      list.appendChild(card);
    }

    applyTestHooks(this, "data-view", list, "list");
    return list;
  }

  // Placeholders de carregamento, na forma da apresentação em uso: linhas com uma barra por coluna, ou cards.
  private buildSkeleton(ctx: RenderContext): HTMLElement {
    const count = Math.min(SKELETON_ROWS, this.pageSize || SKELETON_ROWS);
    const bar = (): HTMLElement => {
      const skeleton = document.createElement("ark-skeleton");
      skeleton.setAttribute("animated", "");
      return skeleton;
    };

    if (ctx.layout === "table") {
      const table = document.createElement("table");
      table.className = "ark:w-full ark:border-collapse";
      const body = document.createElement("tbody");
      const columns = Math.max(1, ctx.columns.length);
      for (let row = 0; row < count; row += 1) {
        const tr = document.createElement("tr");
        tr.className = "ark:border-b ark:border-border ark:last:border-b-0";
        for (let column = 0; column < columns; column += 1) {
          const td = document.createElement("td");
          td.className = ctx.size.cell;
          td.appendChild(bar());
          tr.appendChild(td);
        }
        body.appendChild(tr);
      }
      table.appendChild(body);
      return table;
    }

    const list = document.createElement("div");
    list.className = "ark:grid ark:gap-3";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(min(100%, var(--ark-data-view-card-min, 16rem)), 1fr))";
    for (let index = 0; index < count; index += 1) {
      const card = document.createElement("div");
      card.className = ["ark:rounded-lg ark:border ark:border-border ark:bg-surface", ctx.size.card].join(" ");
      const skeleton = bar();
      skeleton.setAttribute("rows", "3");
      card.appendChild(skeleton);
      list.appendChild(card);
    }
    return list;
  }

  // Refaz o conteúdo (tabela, cards, placeholders ou vazio) e devolve o foco ao mesmo controle do mesmo registro.
  private renderContent(ctx: RenderContext, loading: boolean): void {
    if (!this.contentEl) return;
    const content = this.contentEl;
    const focus = this.pendingFocus ?? this.captureFocus();
    this.pendingFocus = null;
    this.rowEls.clear();
    this.rowOrder = [];
    this.visible = ctx.entries;
    this.headAllEl = null;

    const empty = ctx.entries.length === 0;
    // O estado vazio do app vale para a lista sem registros; uma busca sem resultado é outra coisa e fica com a
    // mensagem própria (`noResults`).
    const searching = this.search.trim() !== "";
    const customEmpty =
      empty && !loading && !searching ? this.querySelector<HTMLElement>(':scope > [slot="empty"]') : null;
    this.toggleAttribute("data-ark-empty", customEmpty !== null);
    content.hidden = customEmpty !== null;
    syncAttr(content, "aria-busy", loading ? "true" : null);

    const boxed = "ark:overflow-x-auto ark:rounded-lg ark:border ark:border-border ark:bg-surface";
    const dimmed = loading && !empty ? "ark:pointer-events-none ark:opacity-60" : "";

    if (empty && loading) {
      content.className = ["ark:min-w-0", ctx.layout === "table" ? boxed : ""].join(" ").trim();
      content.replaceChildren(this.buildSkeleton(ctx));
    } else if (empty) {
      content.className = "ark:min-w-0";
      const message = document.createElement("ark-empty");
      message.setAttribute("heading", searching ? ctx.locale.noResults : ctx.locale.noEntries);
      applyTestHooks(this, "data-view", message, "empty");
      content.replaceChildren(message);
    } else if (ctx.layout === "table") {
      content.className = ["ark:min-w-0", boxed, dimmed].join(" ").trim();
      content.replaceChildren(this.buildTable(ctx));
    } else {
      content.className = ["ark:min-w-0", dimmed].join(" ").trim();
      content.replaceChildren(this.buildCards(ctx));
    }

    if (focus) this.restoreFocus(focus);
  }

  private captureFocus(): FocusToken | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !this.contentEl?.contains(active)) return null;
    const sort = active.closest<HTMLElement>("[data-ark-sort-key]");
    if (sort) return { part: "sort", id: sort.dataset.arkSortKey ?? "" };
    if (active.closest('[data-ark-chrome="select-all"]')) return { part: "select-all", id: "" };
    const rowEl = active.closest<HTMLElement>("[data-ark-row]");
    if (!rowEl) return null;
    const id = rowEl.dataset.arkRow ?? "";
    if (active.closest('[data-ark-chrome="handle"]')) return { part: "handle", id };
    if (active.closest('[data-ark-chrome="select"]')) return { part: "select", id };
    return active === rowEl ? { part: "row", id } : null;
  }

  private restoreFocus(token: FocusToken): void {
    if (!this.contentEl) return;
    if (token.part === "sort") {
      const buttons = Array.from(this.contentEl.querySelectorAll<HTMLElement>("[data-ark-sort-key]"));
      buttons.find((button) => button.dataset.arkSortKey === token.id)?.focus();
      return;
    }
    if (token.part === "select-all") {
      this.headAllEl?.focus();
      return;
    }
    const fallback =
      token.index === undefined ? undefined : this.rowOrder[Math.min(token.index, this.rowOrder.length - 1)];
    const rowEl = this.rowEls.get(token.id) ?? fallback;
    if (!rowEl) return;
    if (token.part === "row") rowEl.focus();
    else rowEl.querySelector<HTMLElement>(`[data-ark-chrome="${token.part}"]`)?.focus();
  }

  // Estado das caixas e da barra de seleção, sem refazer o conteúdo (o foco fica na caixa que o usuário marcou).
  private syncSelection(locale: ArkLocale): void {
    if (!this.selectionEl || !this.selectionAllEl || !this.selectionCountEl || !this.clearEl) return;
    const selectable = this.selectable;
    const cards = this.resolvedView === "cards";
    const count = selectable ? this.selection.size : 0;
    let marked = 0;

    for (const [index, rowEl] of this.rowOrder.entries()) {
      const selected = selectable && this.selection.has(this.visible[index].id);
      if (selected) marked += 1;
      rowEl.toggleAttribute("data-ark-selected", selected);
      const box = rowEl.querySelector<ArkCheckbox>('ark-checkbox[data-ark-chrome="select"]');
      if (box && box.checked !== selected) box.checked = selected;
    }

    const all = marked > 0 && marked === this.rowOrder.length;
    const some = marked > 0 && !all;
    const countText = locale.selectedCount.replace("{count}", String(count));
    for (const box of [this.headAllEl, this.selectionAllEl]) {
      if (!box) continue;
      if (box.checked !== all) box.checked = all;
      if (box.indeterminate !== some) box.indeterminate = some;
    }

    // Nos cards não há cabeçalho: a barra fica sempre à vista com a caixa de selecionar tudo, rotulada pela
    // contagem. Na tabela ela só aparece enquanto há seleção, com a contagem em texto.
    this.toggleAttribute("data-ark-selecting", count > 0);
    this.selectionEl.hidden = !selectable || (!cards && count === 0) || this.rowOrder.length + count === 0;
    this.selectionAllEl.hidden = !cards;
    syncAttr(this.selectionAllEl, "label", count > 0 ? countText : locale.selectAll);
    this.selectionCountEl.hidden = cards;
    this.selectionCountEl.textContent = countText;
    this.clearEl.hidden = count === 0;
    if (this.clearEl.textContent !== locale.clearSelection) this.clearEl.textContent = locale.clearSelection;
  }

  // Tabela mais larga que o componente rola na horizontal: a área de rolagem vira uma região focável, para o
  // teclado alcançá-la.
  private syncOverflow(label: string, locale: ArkLocale): void {
    if (!this.contentEl) return;
    const content = this.contentEl;
    const overflowing = this.resolvedView === "table" && content.scrollWidth > content.clientWidth + 1;
    syncAttr(content, "tabindex", overflowing ? "0" : null);
    syncAttr(content, "role", overflowing ? "region" : null);
    syncAttr(content, "aria-label", overflowing ? label || locale.viewTable : null);
  }

  private syncSlots(): void {
    const slots: Array<[string, string]> = [
      ["toolbar", "toolbar"],
      ["selection", "actions"],
      ["empty", "empty"]
    ];
    for (const [slot, part] of slots) {
      const el = this.querySelector<HTMLElement>(`:scope > [slot="${slot}"]`);
      if (el) applyTestHooks(this, "data-view", el, part);
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
    if (
      !this.searchEl ||
      !this.sortEl ||
      !this.viewsEl ||
      !this.selectionEl ||
      !this.selectionAllEl ||
      !this.selectionCountEl ||
      !this.clearEl ||
      !this.contentEl ||
      !this.footerEl ||
      !this.paginationEl
    ) {
      return;
    }

    // Um arrasto e um menu de mover em andamento não sobrevivem a um conteúdo novo.
    this.endDrag();
    if (this.menuEl?.open) this.menuEl.hide();

    const locale = this.getLocale();
    const size = SIZES[this.getSize()];
    const layout = this.resolvedView;
    const computed = this.compute();
    this.computed = computed;
    const loading = this.loading;
    const label = this.getAttribute("label") || "";
    const lang = this.getAttribute("lang");
    const localeJson = this.getAttribute("locale-json");
    const sort = this.sort;
    const columns = this.columnsModel.filter(
      (column) => !column.show || column.show === "both" || column.show === layout
    );
    const reorderable = this.reorderable;
    const ctx: RenderContext = {
      locale,
      size,
      layout,
      columns,
      entries: computed.entries,
      label,
      selectable: this.selectable,
      reorderable,
      // Uma lista ordenada ou filtrada não tem ordem manual para mudar.
      canReorder: reorderable && !sort && !this.search.trim() && !loading,
      clickable: this.clickable
    };

    this.applyOwnClasses(["ark:text-fg", size.text]);
    syncAttr(this, "data-ark-view", layout);
    this.toggleAttribute("data-ark-narrow", this.narrow);

    // Busca: o que o usuário está digitando não é sobrescrito; só um `search` vindo de fora chega ao campo.
    const placeholder = this.getAttribute("search-placeholder") || locale.search;
    this.searchEl.hidden = !this.searchable;
    syncAttr(this.searchEl, "size", size.control);
    syncAttr(this.searchEl, "placeholder", placeholder);
    syncAttr(this.searchEl, "aria-label", placeholder);
    if (this.searchTimer === null && this.searchEl.value !== this.search) this.searchEl.value = this.search;

    // Ordenação nos cards: sem cabeçalho clicável, um seletor com as colunas ordenáveis nos dois sentidos.
    const sortable = this.columnsModel.filter((column) => column.sortable);
    this.sortEl.hidden = layout !== "cards" || sortable.length === 0;
    syncAttr(this.sortEl, "size", size.control);
    syncAttr(this.sortEl, "aria-label", locale.sortBy);
    this.sortEl.options = [
      { value: "", label: locale.sortBy },
      ...sortable.flatMap((column) => [
        { value: `${column.key}:asc`, label: `${column.label ?? column.key} (${locale.sortAscending})` },
        { value: `${column.key}:desc`, label: `${column.label ?? column.key} (${locale.sortDescending})` }
      ])
    ];
    const sortValue = sort ? `${sort.key}:${sort.direction}` : "";
    if (this.sortEl.value !== sortValue) this.sortEl.value = sortValue;

    // Seletor de visualização: à vista por padrão; `no-view-selector` o esconde sem tirar o efeito de `view`.
    this.viewsEl.hidden = this.noViewSelector;
    syncAttr(this.viewsEl, "size", size.toggle);
    syncAttr(this.viewsEl, "aria-label", locale.viewMode);
    syncAttr(this.viewsEl, "value", layout);
    for (const toggle of Array.from(this.viewsEl.querySelectorAll<ArkToggle>("ark-toggle"))) {
      const name = toggle.value === "cards" ? locale.viewCards : locale.viewTable;
      syncAttr(toggle, "aria-label", name);
      toggle.title = name;
      applyTestHooks(this, "data-view", toggle, `view-${toggle.value}`);
    }

    this.renderContent(ctx, loading);

    this.selectionEl.className = ["ark:flex ark:items-center ark:gap-2 ark:text-fg-soft", size.text].join(" ");
    syncAttr(this.selectionAllEl, "size", size.check);
    syncAttr(this.clearEl, "size", size.control === "xl" ? "md" : size.control === "lg" ? "sm" : "xs");
    this.syncSelection(locale);

    // Paginação: só com `page-size`, e enquanto há o que paginar.
    this.footerEl.hidden = computed.pageSize === 0 || computed.total === 0;
    if (computed.pageSize > 0) {
      const sizes = this.pageSizes;
      syncAttr(this.paginationEl, "total", String(computed.total));
      syncAttr(this.paginationEl, "page-size", String(computed.pageSize));
      syncAttr(this.paginationEl, "page", String(computed.page));
      syncAttr(this.paginationEl, "page-sizes", sizes.length > 0 ? sizes.join(",") : null);
      syncAttr(this.paginationEl, "size", size.control);
      syncAttr(this.paginationEl, "lang", lang);
      syncAttr(this.paginationEl, "locale-json", localeJson);
      this.paginationEl.toggleAttribute("disabled", loading);
    }

    this.syncSlots();
    applyTestHooks(this, "data-view", this);
    applyTestHooks(this, "data-view", this.searchEl, "search");
    applyTestHooks(this, "data-view", this.sortEl, "sort");
    applyTestHooks(this, "data-view", this.viewsEl, "views");
    applyTestHooks(this, "data-view", this.selectionEl, "selection");
    applyTestHooks(this, "data-view", this.selectionAllEl, "select-all");
    applyTestHooks(this, "data-view", this.selectionCountEl, "selection-count");
    applyTestHooks(this, "data-view", this.clearEl, "clear-selection");
    applyTestHooks(this, "data-view", this.contentEl, "content");
    applyTestHooks(this, "data-view", this.footerEl, "footer");
    applyTestHooks(this, "data-view", this.paginationEl, "pagination");

    this.syncOverflow(label, locale);

    // Para quem preenche as células depois (os wrappers de framework): o conteúdo acabou de ser refeito.
    this.dispatchEvent(new CustomEvent("ark-render"));
  }
}

export default ArkDataView;
