import {
  type ArkDialogCloseReason,
  type ArkDialogSize,
  type ArkLocale,
  closePopover,
  coerceBooleanAttr,
  focusableElements,
  openPopover,
  resolveLocale,
  trapFocus,
  unlockScroll
} from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/** Ícone do botão de fechar (chrome próprio do componente). */
const CLOSE_SVG = `
  <svg class="ark:h-4 ark:w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15"></path>
  </svg>`;

/** Contador para o id do título, que o `aria-labelledby` do painel referencia. */
let dialogSeq = 0;

/** Normaliza uma medida vinda de atributo: número sem unidade vira px; vazio vira null. */
function cssLength(value: string | null): string | null {
  const trimmed = (value || "").trim();
  if (!trimmed) return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

type ArkDialogState = "closed" | "open" | "closing";

/**
 * Diálogo modal. O PRÓPRIO host é o painel, aberto como `popover="manual"`
 * (top layer, `::backdrop` como scrim, sem portal nem z-index): os filhos do
 * usuário são o corpo e ficam onde estão, e um filho `slot="footer"` vira o
 * rodapé por CSS. O componente cria o cabeçalho (título `h2` a partir de
 * `label` e botão de fechar) como primeiro filho, marcado `data-ark-chrome`,
 * para a ordem de leitura começar pelo título.
 *
 * `open` é a fonte da verdade: `show()`/`close(reason)` e a propriedade só o
 * alternam, e a saída anima antes de sair do top layer mesmo quando um
 * framework remove o atributo. A Popover API não aplica `inert` ao resto da
 * página: o `trapFocus` de core cobre teclado e ponteiro; um leitor de tela
 * navegando por cursor virtual ainda alcança o conteúdo atrás. A página para
 * de rolar enquanto aberto (`lockScroll` de core), salvo com `no-scroll-lock`.
 */
export class ArkDialog extends HTMLElementBase {
  static readonly tagName = "ark-dialog";

  private headerEl: HTMLDivElement | null = null;
  private titleEl: HTMLHeadingElement | null = null;
  private closeEl: HTMLButtonElement | null = null;
  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  /** Visibilidade real: `open` também cobre a animação de entrada; `closing` é a saída ainda visível. */
  private state: ArkDialogState = "closed";
  /** A abertura em curso veio do connectedCallback: o ark-open espera um microtask. */
  private openingOnConnect = false;
  private releaseTrap: (() => void) | null = null;
  /** Motivo pedido por `close(reason)`, lido quando o atributo `open` some. */
  private pendingReason: ArkDialogCloseReason | null = null;
  /** Aviso de nome acessível ausente, uma vez por elemento. */
  private warned = false;
  private readonly titleId = `ark-dialog-${++dialogSeq}-title`;
  /** `aria-labelledby` que o próprio componente escreveu, para não apagar um do usuário. */
  private appliedLabelledBy: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "open",
      "size",
      "width",
      "height",
      "label",
      "no-close-button",
      "persistent",
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
  }

  connectedCallback(): void {
    if (!this.observer) {
      // Um footer que chega depois (framework) recebe o hook; o resto do DOM é do usuário.
      this.observer = new MutationObserver(() => this.syncFooter());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
    if (this.hasAttribute("open")) {
      this.openingOnConnect = true;
      this.openNow();
      this.openingOnConnect = false;
    }
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    // Saiu do DOM aberto: o navegador já o tirou do top layer; libera o trap, a rolagem e o estado sem animar.
    this.releaseTrap?.();
    this.releaseTrap = null;
    unlockScroll(this);
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
      const reason = this.pendingReason ?? "api";
      this.pendingReason = null;
      if (this.hasAttribute("open")) {
        this.openNow();
      } else {
        this.closeNow(reason);
      }
      return;
    }
    this.updateAppearance();
  }

  /** Aberto (atributo `open`). */
  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean | string | null | undefined) {
    const next = coerceBooleanAttr(value);
    if (next) {
      this.show();
    } else {
      this.close("api");
    }
  }

  /** Esc e clique no scrim não fecham. */
  get persistent(): boolean {
    return this.hasAttribute("persistent");
  }

  set persistent(value: boolean | string | null | undefined) {
    this.toggleAttribute("persistent", coerceBooleanAttr(value));
  }

  /** A página continua rolando com o diálogo aberto (atributo `no-scroll-lock`). */
  get noScrollLock(): boolean {
    return this.hasAttribute("no-scroll-lock");
  }

  set noScrollLock(value: boolean | string | null | undefined) {
    this.toggleAttribute("no-scroll-lock", coerceBooleanAttr(value));
  }

  /** Abre o diálogo: adiciona `open`, que faz o resto. */
  show(): void {
    if (!this.open) this.setAttribute("open", "");
  }

  /** Fecha o diálogo publicando `ark-close` com o motivo (padrão "api"); a saída anima antes de esconder. */
  close(reason: ArkDialogCloseReason = "api"): void {
    if (!this.open) return;
    this.pendingReason = reason;
    this.removeAttribute("open");
  }

  // --- Abertura e fechamento ---

  private openNow(): void {
    if (this.state === "open") return;
    this.state = "open";
    this.setAttribute("data-ark-state", "open");
    this.updateAppearance();
    this.warnWithoutName();

    // showPopover() antes do foco: os focáveis só têm caixas com o painel visível.
    void openPopover(this, "scale", { lockScroll: !this.noScrollLock });
    this.releaseTrap?.();
    this.releaseTrap = trapFocus(this, {
      initial: this.initialFocus(),
      onOutsidePointer: () => {
        if (!this.persistent) this.close("backdrop");
      }
    });

    const emit = (): void => {
      if (this.state === "open") this.dispatchEvent(new CustomEvent("ark-open", { bubbles: true, composed: true }));
    };
    // Aberto já ao conectar (open no HTML, hidratação de SSR, framework que grava a prop antes de inserir): o evento
    // sai num microtask, para chegar a quem se inscreve no mesmo ciclo em que o nó entrou (os wrappers React e
    // Angular ligam os listeners dos overlays durante a montagem) em vez de disparar antes de alguém escutar.
    if (this.openingOnConnect) queueMicrotask(emit);
    else emit();
  }

  private closeNow(reason: ArkDialogCloseReason): void {
    if (this.state !== "open") return;
    this.state = "closing";
    this.setAttribute("data-ark-state", "closing");
    this.releaseTrap?.();
    this.releaseTrap = null;

    this.dispatchEvent(new CustomEvent("ark-close", { detail: { reason }, bubbles: true, composed: true }));

    void closePopover(this, "fade").then(() => {
      // Reaberto no meio da saída: o openNow já assumiu o estado.
      if (this.state !== "closing") return;
      this.state = "closed";
      this.removeAttribute("data-ark-state");
    });
  }

  /** Foco inicial: `autofocus` do usuário, senão o primeiro focável do corpo, senão o botão de fechar, senão o painel. */
  private initialFocus(): HTMLElement {
    const auto = this.querySelector<HTMLElement>("[autofocus]");
    if (auto) return auto;
    const first = focusableElements(this).find((el) => !el.closest("[data-ark-chrome]"));
    return first ?? this.closeEl ?? this;
  }

  private warnWithoutName(): void {
    if (this.warned || this.hasAttribute("label") || this.hasAttribute("aria-label")) return;
    if (this.hasAttribute("aria-labelledby")) return;
    this.warned = true;
    console.warn(
      "[ark-dialog] sem `label`, `aria-label` ou `aria-labelledby`: o diálogo fica sem nome acessível.",
      this
    );
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.state !== "open") return;
    event.preventDefault();
    event.stopPropagation();
    if (!this.persistent) this.close("escape");
  };

  // --- Aparência ---

  private getSize(): ArkDialogSize {
    const size = (this.getAttribute("size") || "").toLowerCase();
    return size === "sm" || size === "lg" || size === "xl" || size === "full" ? size : "md";
  }

  /** Medidas próprias em custom properties inline do host, lidas pelas classes `ark:w-(--ark-dialog-width)` etc. */
  private syncDimensions(): void {
    for (const axis of ["width", "height"] as const) {
      const value = cssLength(this.getAttribute(axis));
      if (value) {
        this.style.setProperty(`--ark-dialog-${axis}`, value);
      } else {
        this.style.removeProperty(`--ark-dialog-${axis}`);
      }
    }
  }

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  private computeClasses(): string[] {
    // Redefine o que o UA dá a [popover] (inset, margin, border, padding, overflow, color, background); o display
    // vem do components.css, para o host fechado ficar oculto mesmo com display do autor.
    const base =
      "ark:fixed ark:inset-0 ark:m-auto ark:overflow-y-auto ark:overscroll-contain ark:bg-surface ark:text-fg ark:outline-none";
    const widths: Record<Exclude<ArkDialogSize, "full">, string> = {
      sm: "ark:max-w-sm",
      md: "ark:max-w-md",
      lg: "ark:max-w-lg",
      xl: "ark:max-w-2xl"
    };
    const size = this.getSize();
    const full = size === "full";
    const customWidth = this.hasAttribute("width");
    const customHeight = this.hasAttribute("height");

    // Por eixo: medida própria > full > preset. Medidas próprias continuam limitadas à margem da viewport.
    const presetWidth = size === "full" ? "ark:w-full ark:max-w-none" : `ark:w-[calc(100%-2rem)] ${widths[size]}`;
    const width = customWidth ? "ark:w-(--ark-dialog-width) ark:max-w-[calc(100%-2rem)]" : presetWidth;
    const height = customHeight
      ? "ark:h-(--ark-dialog-height) ark:max-h-[calc(100%-2rem)]"
      : full
        ? "ark:h-full ark:max-h-none"
        : "ark:h-fit ark:max-h-[calc(100%-2rem)]";
    // Tela inteira não tem cantos, borda nem sombra: não sobra página ao redor.
    const frame =
      full && !customWidth && !customHeight
        ? "ark:rounded-none ark:border-0"
        : "ark:rounded-xl ark:border ark:border-border ark:shadow-xl";

    return [base, width, height, frame].join(" ").split(/\s+/).filter(Boolean);
  }

  // Cabeçalho: primeiro filho, sticky no topo do painel rolável; só existe com título ou botão de fechar.
  private syncHeader(label: string | null, showClose: boolean): void {
    if (!label && !showClose) {
      this.headerEl?.remove();
      this.headerEl = null;
      this.titleEl = null;
      this.closeEl = null;
      return;
    }

    if (!this.headerEl) {
      const header = document.createElement("div");
      header.setAttribute("data-ark-chrome", "header");
      this.prepend(header);
      this.headerEl = header;
    }
    this.headerEl.className =
      "ark:sticky ark:top-0 ark:z-10 ark:-mx-6 ark:flex ark:items-start ark:gap-4 ark:bg-surface ark:px-6 ark:pt-6 ark:pb-4";

    if (label) {
      if (!this.titleEl) {
        const title = document.createElement("h2");
        title.id = this.titleId;
        this.headerEl.prepend(title);
        this.titleEl = title;
      }
      this.titleEl.textContent = label;
      this.titleEl.className = "ark:min-w-0 ark:flex-1 ark:text-base ark:leading-6 ark:font-semibold ark:text-fg";
    } else {
      this.titleEl?.remove();
      this.titleEl = null;
    }

    if (showClose) {
      if (!this.closeEl) {
        const button = document.createElement("button");
        button.type = "button";
        button.innerHTML = CLOSE_SVG;
        button.addEventListener("click", () => this.close("close-button"));
        this.headerEl.appendChild(button);
        this.closeEl = button;
      }
      const text = this.getLocale().close;
      this.closeEl.className =
        "ark:-my-1 ark:-mr-2 ark:ml-auto ark:inline-flex ark:h-8 ark:w-8 ark:shrink-0 ark:cursor-pointer ark:items-center ark:justify-center ark:rounded-md ark:text-fg-muted ark:transition ark:outline-none ark:hover:bg-surface-muted ark:hover:text-fg ark:focus-visible:ring-2 ark:focus-visible:ring-primary-ring";
      this.closeEl.setAttribute("aria-label", text);
      this.closeEl.title = text;
    } else {
      this.closeEl?.remove();
      this.closeEl = null;
    }
  }

  private syncLabelledBy(label: string | null): void {
    if (label && this.titleEl) {
      this.setAttribute("aria-labelledby", this.titleId);
      this.appliedLabelledBy = this.titleId;
    } else if (this.appliedLabelledBy !== null && this.getAttribute("aria-labelledby") === this.appliedLabelledBy) {
      this.removeAttribute("aria-labelledby");
      this.appliedLabelledBy = null;
    }
  }

  private syncFooter(): void {
    const footer = this.querySelector<HTMLElement>(':scope > [slot="footer"]');
    if (footer) applyTestHooks(this, "dialog", footer, "footer");
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
    if (this.getAttribute("popover") !== "manual") this.setAttribute("popover", "manual");
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
    // Focável por script (foco inicial sem focáveis, trap), fora da ordem de Tab.
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "-1");

    const label = this.getAttribute("label");
    this.syncHeader(label, !this.hasAttribute("no-close-button"));
    this.syncLabelledBy(label);
    this.syncDimensions();
    this.applyOwnClasses(this.computeClasses());

    applyTestHooks(this, "dialog", this);
    if (this.headerEl) applyTestHooks(this, "dialog", this.headerEl, "header");
    if (this.titleEl) applyTestHooks(this, "dialog", this.titleEl, "title");
    if (this.closeEl) applyTestHooks(this, "dialog", this.closeEl, "close");
    this.syncFooter();
  }
}

export default ArkDialog;
