import {
  type ArkIntent,
  type ArkLocale,
  type ArkPageChangeDetail,
  type ArkSize,
  announce,
  coerceBooleanAttr,
  resolveLocale
} from "@tooark/core";
import type { ArkSelect } from "./ark-select";
import { HTMLElementBase } from "./html-element-base";
import { normalizeIntent } from "./intent-colors";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";
import { upgradeProperties } from "./upgrade-properties";

/** Setas dos botões de página anterior e próxima (chrome próprio). */
const PREVIOUS_SVG =
  '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5l-5 5 5 5"></path></svg>';
const NEXT_SVG =
  '<svg class="ark:h-[1em] ark:w-[1em]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 5l5 5-5 5"></path></svg>';

/** Itens por página quando `page-size` falta ou é inválido. */
const DEFAULT_PAGE_SIZE = 10;

/** Um item da faixa de páginas: um número ou uma reticência. */
type PageItem = number | "gap";

/** Inteiro de um atributo, ou `fallback` quando falta, não é número ou fica abaixo de `min`. */
function intAttr(el: Element, name: string, fallback: number, min: number): number {
  const parsed = Number.parseInt(el.getAttribute(name) || "", 10);
  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
}

// Faixa com a primeira e a última página sempre visíveis, `siblings` vizinhas de cada lado da atual e reticências
// no que sobra. O número de itens é constante (2 * siblings + 5), para os botões não mudarem de lugar ao navegar.
function pageItems(page: number, count: number, siblings: number): PageItem[] {
  const range = (from: number, to: number): number[] => Array.from({ length: to - from + 1 }, (_, i) => from + i);
  if (count <= siblings * 2 + 5) return range(1, count);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, count);
  const gapLeft = left > 2;
  const gapRight = right < count - 1;
  const edge = siblings * 2 + 3;
  if (!gapLeft && gapRight) return [...range(1, edge), "gap", count];
  if (gapLeft && !gapRight) return [1, "gap", ...range(count - edge + 1, count)];
  return [1, "gap", ...range(left, right), "gap", count];
}

/**
 * Paginação: resumo do intervalo ("1–10 de 134"), seletor opcional de itens
 * por página e a faixa de páginas com anterior e próxima. O PRÓPRIO host é a
 * `role="navigation"`; tudo dentro é do componente (não há filhos do usuário).
 * `page`, `page-size` e `total` são a fonte da verdade: um clique reescreve
 * `page` (e `page-size`, pelo seletor que `page-sizes` liga), emite
 * `ark-page-change` e anuncia a página ao leitor de tela. Quem pagina os dados
 * é o app: o componente só conta páginas. Trocar os itens por página mantém à
 * vista o primeiro item que estava na tela. Compõe o ark-select.
 */
export class ArkPagination extends HTMLElementBase {
  static readonly tagName = "ark-pagination";

  private summaryEl: HTMLSpanElement | null = null;
  private sizeWrapEl: HTMLDivElement | null = null;
  private sizeLabelEl: HTMLSpanElement | null = null;
  private sizeEl: ArkSelect | null = null;
  private listEl: HTMLUListElement | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Rótulo que o próprio componente gravou no host; um `aria-label` do app, diferente dele, fica como está. */
  private writtenLabel: string | null = null;
  /** Várias gravações de atributo numa só mudança (página e itens por página) renderizam uma vez, ao fim. */
  private suspended = false;

  static get observedAttributes(): string[] {
    return [
      "page",
      "page-size",
      "total",
      "page-sizes",
      "siblings",
      "disabled",
      "size",
      "intent",
      "lang",
      "locale-json",
      "theme",
      "class",
      "testid"
    ];
  }

  connectedCallback(): void {
    upgradeProperties(this);
    if (!this.listEl) this.render();
    this.updateAppearance();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (oldValue === newValue || !this.listEl || !this.isConnected || this.suspended) return;
    this.updateAppearance();
  }

  /** Página atual, a partir de 1, limitada ao total de páginas. Padrão: 1. */
  get page(): number {
    return Math.min(intAttr(this, "page", 1, 1), this.pageCount);
  }

  set page(value: number | string | null | undefined) {
    reflectAttr(this, "page", value);
  }

  /** Itens por página (atributo `page-size`). Padrão: 10. */
  get pageSize(): number {
    return intAttr(this, "page-size", DEFAULT_PAGE_SIZE, 1);
  }

  set pageSize(value: number | string | null | undefined) {
    reflectAttr(this, "page-size", value);
  }

  /** Total de itens. Padrão: 0. */
  get total(): number {
    return intAttr(this, "total", 0, 0);
  }

  set total(value: number | string | null | undefined) {
    reflectAttr(this, "total", value);
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

  /** Páginas vizinhas da atual exibidas de cada lado. Padrão: 1. */
  get siblings(): number {
    return intAttr(this, "siblings", 1, 0);
  }

  set siblings(value: number | string | null | undefined) {
    reflectAttr(this, "siblings", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean | string | null | undefined) {
    this.toggleAttribute("disabled", coerceBooleanAttr(value));
  }

  /** Total de páginas: pelo menos 1, mesmo sem itens. */
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private getSize(): ArkSize {
    const size = (this.getAttribute("size") || "").toLowerCase();
    return size === "xs" || size === "sm" || size === "lg" || size === "xl" ? size : "md";
  }

  // Vai para `page` (e troca os itens por página): reescreve os atributos, emite e anuncia. Nada muda, nada sai.
  private goTo(page: number, pageSize: number = this.pageSize): void {
    const pageCount = Math.max(1, Math.ceil(this.total / pageSize));
    const next = Math.min(Math.max(1, page), pageCount);
    if (next === this.page && pageSize === this.pageSize) return;

    this.suspended = true;
    if (pageSize !== this.pageSize) this.setAttribute("page-size", String(pageSize));
    this.setAttribute("page", String(next));
    this.suspended = false;
    this.updateAppearance();

    const detail: ArkPageChangeDetail = { page: next, pageSize, pageCount };
    this.dispatchEvent(new CustomEvent("ark-page-change", { detail, bubbles: true, composed: true }));
    const locale = this.getLocale();
    announce(locale.pageOf.replace("{page}", String(next)).replace("{count}", String(pageCount)));
  }

  // --- Renderização ---

  private render(): void {
    const summary = document.createElement("span");
    summary.setAttribute("data-ark-chrome", "summary");

    const sizeWrap = document.createElement("div");
    sizeWrap.setAttribute("data-ark-chrome", "page-size");
    const sizeLabel = document.createElement("span");
    sizeLabel.setAttribute("aria-hidden", "true");
    const size = document.createElement("ark-select") as ArkSelect;
    // `input` e `change` do seletor não saem do host: quem escuta recebe só `ark-page-change`.
    size.addEventListener("input", (event) => event.stopPropagation());
    size.addEventListener("change", (event) => {
      event.stopPropagation();
      const pageSize = Number.parseInt(size.value, 10);
      if (!Number.isFinite(pageSize) || pageSize <= 0) return;
      // O primeiro item que estava na tela continua nela.
      const first = (this.page - 1) * this.pageSize;
      this.goTo(Math.floor(first / pageSize) + 1, pageSize);
    });
    sizeWrap.append(sizeLabel, size);

    const list = document.createElement("ul");
    list.setAttribute("data-ark-chrome", "pages");
    list.addEventListener("click", (event) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>("button[data-ark-page]");
      if (!button || button.disabled) return;
      const target = button.dataset.arkPage;
      if (target === "previous") this.goTo(this.page - 1);
      else if (target === "next") this.goTo(this.page + 1);
      else this.goTo(Number(target));
    });

    this.append(summary, sizeWrap, list);

    this.summaryEl = summary;
    this.sizeWrapEl = sizeWrap;
    this.sizeLabelEl = sizeLabel;
    this.sizeEl = size;
    this.listEl = list;
  }

  private createButton(target: string, label: string, classes: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.arkPage = target;
    button.setAttribute("aria-label", label);
    button.className = classes;
    return button;
  }

  // A faixa é refeita a cada mudança; o foco que estava nela volta para o mesmo papel (anterior, próxima ou a
  // página atual), para o teclado seguir de onde parou.
  private syncPages(locale: ArkLocale, size: ArkSize, intent: ArkIntent): void {
    if (!this.listEl) return;
    const page = this.page;
    const pageCount = this.pageCount;
    const disabled = this.disabled;
    const active = document.activeElement;
    const focused = active instanceof HTMLElement && this.listEl.contains(active) ? active.dataset.arkPage : undefined;

    // Altura e largura mínima pelo token --ark-size-*, como os outros controles: um número de um dígito fica quadrado.
    const sizes: Record<ArkSize, string> = {
      xs: "ark:min-h-(--ark-size-xs) ark:min-w-(--ark-size-xs) ark:px-1 ark:text-xs",
      sm: "ark:min-h-(--ark-size-sm) ark:min-w-(--ark-size-sm) ark:px-1.5 ark:text-xs",
      md: "ark:min-h-(--ark-size-md) ark:min-w-(--ark-size-md) ark:px-2 ark:text-sm",
      lg: "ark:min-h-(--ark-size-lg) ark:min-w-(--ark-size-lg) ark:px-2.5 ark:text-base",
      xl: "ark:min-h-(--ark-size-xl) ark:min-w-(--ark-size-xl) ark:px-3 ark:text-lg"
    };
    const palettes: Record<ArkIntent, { ring: string; current: string }> = {
      primary: { ring: "ark:focus-visible:ring-primary-ring", current: "ark:bg-primary ark:text-primary-fg" },
      secondary: { ring: "ark:focus-visible:ring-secondary-ring", current: "ark:bg-secondary ark:text-secondary-fg" },
      success: { ring: "ark:focus-visible:ring-success-ring", current: "ark:bg-success ark:text-success-fg" },
      warning: { ring: "ark:focus-visible:ring-warning-ring", current: "ark:bg-warning ark:text-warning-fg" },
      danger: { ring: "ark:focus-visible:ring-danger-ring", current: "ark:bg-danger ark:text-danger-fg" },
      info: { ring: "ark:focus-visible:ring-info-ring", current: "ark:bg-info ark:text-info-fg" },
      neutral: { ring: "ark:focus-visible:ring-neutral-ring", current: "ark:bg-neutral ark:text-neutral-fg" }
    };
    const palette = palettes[intent];
    const base = [
      "ark:inline-flex ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-md ark:font-medium ark:tabular-nums ark:outline-none ark:transition-colors ark:duration-(--ark-duration-quick) ark:ease-(--ark-ease-out) ark:focus-visible:ring-2 ark:disabled:cursor-not-allowed ark:disabled:opacity-50",
      palette.ring,
      sizes[size]
    ].join(" ");
    const idle = "ark:text-fg-soft ark:hover:bg-surface-muted ark:disabled:hover:bg-transparent";

    const items: HTMLLIElement[] = [];
    const add = (child: HTMLElement, part: string): void => {
      const item = document.createElement("li");
      item.appendChild(child);
      applyTestHooks(this, "pagination", child, part);
      items.push(item);
    };

    const previous = this.createButton("previous", locale.previousPage, [base, idle].join(" "));
    previous.innerHTML = PREVIOUS_SVG;
    previous.disabled = disabled || page <= 1;
    add(previous, "previous");

    for (const entry of pageItems(page, pageCount, this.siblings)) {
      if (entry === "gap") {
        const gap = document.createElement("span");
        gap.setAttribute("aria-hidden", "true");
        gap.textContent = "…";
        gap.className = ["ark:inline-flex ark:items-center ark:justify-center ark:text-fg-muted", sizes[size]].join(
          " "
        );
        add(gap, "gap");
        continue;
      }
      const current = entry === page;
      const button = this.createButton(
        String(entry),
        locale.pageNumber.replace("{page}", String(entry)),
        [base, current ? palette.current : idle].join(" ")
      );
      button.textContent = String(entry);
      button.disabled = disabled;
      if (current) button.setAttribute("aria-current", "page");
      add(button, "page");
    }

    const next = this.createButton("next", locale.nextPage, [base, idle].join(" "));
    next.innerHTML = NEXT_SVG;
    next.disabled = disabled || page >= pageCount;
    add(next, "next");

    this.listEl.replaceChildren(...items);

    if (focused === undefined) return;
    const edge = focused === "previous" || focused === "next" ? focused : null;
    const target =
      (edge && this.listEl.querySelector<HTMLButtonElement>(`button[data-ark-page="${edge}"]:not(:disabled)`)) ||
      this.listEl.querySelector<HTMLButtonElement>('button[aria-current="page"]');
    target?.focus();
  }

  private syncPageSize(locale: ArkLocale, size: ArkSize): void {
    if (!this.sizeWrapEl || !this.sizeLabelEl || !this.sizeEl) return;
    const options = this.pageSizes;
    this.sizeWrapEl.hidden = options.length === 0;
    if (options.length === 0) return;

    // O tamanho em uso entra na lista mesmo fora de `page-sizes`, para o seletor mostrar o valor real.
    const pageSize = this.pageSize;
    const all = options.includes(pageSize) ? options : [...options, pageSize].sort((a, b) => a - b);
    this.sizeWrapEl.className = "ark:flex ark:items-center ark:gap-2";
    this.sizeLabelEl.textContent = locale.perPage;
    this.sizeLabelEl.className = "ark:whitespace-nowrap ark:text-fg-muted";
    this.sizeEl.options = all.map((value) => ({ value: String(value), label: String(value) }));
    if (this.sizeEl.value !== String(pageSize)) this.sizeEl.value = String(pageSize);
    this.sizeEl.setAttribute("aria-label", locale.perPage);
    this.sizeEl.setAttribute("size", size);
    this.sizeEl.toggleAttribute("disabled", this.disabled);
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
    if (!this.summaryEl || !this.sizeWrapEl || !this.listEl) return;

    const locale = this.getLocale();
    const size = this.getSize();
    const intent = normalizeIntent(this.getAttribute("intent"), "primary");
    const total = this.total;
    const pageSize = this.pageSize;
    const page = this.page;
    const textSize: Record<ArkSize, string> = {
      xs: "ark:text-xs",
      sm: "ark:text-xs",
      md: "ark:text-sm",
      lg: "ark:text-base",
      xl: "ark:text-lg"
    };

    this.setAttribute("role", "navigation");
    // O nome da navegação vem do idioma, a não ser que o app tenha posto o próprio aria-label no host.
    const label = this.getAttribute("aria-label");
    if (label === null || label === this.writtenLabel) {
      if (label !== locale.pagination) this.setAttribute("aria-label", locale.pagination);
      this.writtenLabel = locale.pagination;
    }

    this.applyOwnClasses(
      ["ark:flex ark:flex-wrap ark:items-center ark:justify-end ark:gap-x-4 ark:gap-y-2 ark:text-fg", textSize[size]]
        .join(" ")
        .split(" ")
    );

    // Resumo do intervalo: empurra o resto para a direita; sem itens não há intervalo a mostrar.
    this.summaryEl.hidden = total === 0;
    this.summaryEl.className = "ark:me-auto ark:tabular-nums ark:text-fg-muted";
    this.summaryEl.textContent = locale.rangeOf
      .replace("{from}", String((page - 1) * pageSize + 1))
      .replace("{to}", String(Math.min(page * pageSize, total)))
      .replace("{total}", String(total));

    this.syncPageSize(locale, size);

    this.listEl.className = "ark:flex ark:list-none ark:flex-wrap ark:items-center ark:gap-1";
    this.syncPages(locale, size, intent);

    applyTestHooks(this, "pagination", this);
    applyTestHooks(this, "pagination", this.summaryEl, "summary");
    applyTestHooks(this, "pagination", this.sizeWrapEl, "page-size");
    applyTestHooks(this, "pagination", this.listEl, "pages");
  }
}

export default ArkPagination;
