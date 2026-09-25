import {
  type ArkDrawerCloseReason,
  type ArkDrawerMode,
  type ArkDrawerSide,
  type ArkLocale,
  type ArkMotionPreset,
  arkEnter,
  arkExit,
  closePopover,
  coerceBooleanAttr,
  focusableElements,
  openPopover,
  resolveLocale,
  trapFocus,
  unlockScroll
} from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { reflectAttr } from "./reflect-attr";
import { applyTestHooks } from "./test-hooks";

/** Ícone do botão de fechar (chrome próprio do componente). */
const CLOSE_SVG = `
  <svg class="ark:h-4 ark:w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15"></path>
  </svg>`;

let drawerSeq = 0;

/** Normaliza uma medida vinda de atributo: número sem unidade vira px; vazio vira null. */
function cssLength(value: string | null): string | null {
  const trimmed = (value || "").trim();
  if (!trimmed) return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

type ArkDrawerState = "closed" | "open" | "closing";

/**
 * Gaveta ancorada numa borda. O PRÓPRIO host é o painel: em `mode="overlay"`
 * abre como `popover="manual"` (top layer, `::backdrop` como scrim, trap de
 * foco, Esc e clique no scrim fecham), em `mode="inline"` fica no fluxo da
 * página e só anima (o console inferior, um painel lateral fixo). Os filhos
 * do usuário são o corpo e ficam onde estão; um filho `slot="footer"` vai ao
 * fim por CSS. O cabeçalho (título `h2` de `label` e botão de fechar) é o
 * primeiro filho, marcado `data-ark-chrome`. `side` escolhe a borda, a
 * direção do slide (com o easing `sheet`) e a borda desenhada; `size` é um
 * preset ou um comprimento CSS no eixo da gaveta. `open` é a fonte da
 * verdade, como no ark-dialog, e em overlay a página para de rolar enquanto
 * aberta, salvo com `no-scroll-lock`.
 */
export class ArkDrawer extends HTMLElementBase {
  static readonly tagName = "ark-drawer";

  private headerEl: HTMLDivElement | null = null;
  private titleEl: HTMLHeadingElement | null = null;
  private closeEl: HTMLButtonElement | null = null;
  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private state: ArkDrawerState = "closed";
  /** A abertura em curso veio do connectedCallback: o ark-open espera um microtask. */
  private openingOnConnect = false;
  private releaseTrap: (() => void) | null = null;
  private pendingReason: ArkDrawerCloseReason | null = null;
  private warned = false;
  private readonly titleId = `ark-drawer-${++drawerSeq}-title`;
  /** `aria-labelledby` que o próprio componente escreveu, para não apagar um do usuário. */
  private appliedLabelledBy: string | null = null;

  static get observedAttributes(): string[] {
    return [
      "open",
      "side",
      "mode",
      "size",
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

  /** Esc e clique no scrim não fecham (só no overlay). */
  get persistent(): boolean {
    return this.hasAttribute("persistent");
  }

  set persistent(value: boolean | string | null | undefined) {
    this.toggleAttribute("persistent", coerceBooleanAttr(value));
  }

  /** A página continua rolando com a gaveta aberta em overlay (atributo `no-scroll-lock`). */
  get noScrollLock(): boolean {
    return this.hasAttribute("no-scroll-lock");
  }

  set noScrollLock(value: boolean | string | null | undefined) {
    this.toggleAttribute("no-scroll-lock", coerceBooleanAttr(value));
  }

  /** Borda onde a gaveta encosta. Padrão: "right". */
  get side(): ArkDrawerSide {
    const side = (this.getAttribute("side") || "").toLowerCase();
    return side === "left" || side === "top" || side === "bottom" ? side : "right";
  }

  set side(value: ArkDrawerSide | null | undefined) {
    reflectAttr(this, "side", value);
  }

  /** `overlay` (popover modal com scrim) ou `inline` (no fluxo, só anima). Padrão: "overlay". */
  get mode(): ArkDrawerMode {
    return (this.getAttribute("mode") || "").toLowerCase() === "inline" ? "inline" : "overlay";
  }

  set mode(value: ArkDrawerMode | null | undefined) {
    reflectAttr(this, "mode", value);
  }

  /** Abre a gaveta: adiciona `open`, que faz o resto. */
  show(): void {
    if (!this.open) this.setAttribute("open", "");
  }

  /** Fecha publicando `ark-close` com o motivo (padrão "api"); a saída anima antes de esconder. */
  close(reason: ArkDrawerCloseReason = "api"): void {
    if (!this.open) return;
    this.pendingReason = reason;
    this.removeAttribute("open");
  }

  // --- Abertura e fechamento ---

  // Preset de slide pelo lado: a gaveta entra vindo da própria borda e sai por ela.
  private preset(): ArkMotionPreset {
    const presets: Record<ArkDrawerSide, ArkMotionPreset> = {
      left: "slide-left",
      right: "slide-right",
      top: "slide-down",
      bottom: "slide-up"
    };
    return presets[this.side];
  }

  private openNow(): void {
    if (this.state === "open") return;
    this.state = "open";
    this.setAttribute("data-ark-state", "open");
    this.updateAppearance();
    this.warnWithoutName();

    if (this.mode === "overlay") {
      // Percorre a própria largura/altura: entra de fora da viewport. Overlay é modal: a página para de rolar.
      void openPopover(this, this.preset(), { distance: "100%", easing: "sheet", lockScroll: !this.noScrollLock });
      this.releaseTrap?.();
      this.releaseTrap = trapFocus(this, {
        initial: this.initialFocus(),
        onOutsidePointer: () => {
          if (!this.persistent) this.close("backdrop");
        }
      });
    } else {
      // No fluxo o espaço já existe: um deslocamento curto (token) basta; a saída anterior fica preenchida.
      for (const animation of this.getAnimations()) animation.cancel();
      void arkEnter(this, this.preset(), { easing: "sheet" });
    }

    const emit = (): void => {
      if (this.state === "open") this.dispatchEvent(new CustomEvent("ark-open", { bubbles: true, composed: true }));
    };
    // Aberto já ao conectar (open no HTML, hidratação de SSR, framework que grava a prop antes de inserir): o evento
    // sai num microtask, para chegar a quem se inscreve no mesmo ciclo em que o nó entrou (os wrappers React e
    // Angular ligam os listeners dos overlays durante a montagem) em vez de disparar antes de alguém escutar.
    if (this.openingOnConnect) queueMicrotask(emit);
    else emit();
  }

  private closeNow(reason: ArkDrawerCloseReason): void {
    if (this.state !== "open") return;
    this.state = "closing";
    this.setAttribute("data-ark-state", "closing");
    this.releaseTrap?.();
    this.releaseTrap = null;

    this.dispatchEvent(new CustomEvent("ark-close", { detail: { reason }, bubbles: true, composed: true }));

    const exit =
      this.mode === "overlay"
        ? closePopover(this, this.preset(), { duration: "quick", easing: "in", distance: "100%" })
        : arkExit(this, this.preset(), { duration: "quick", easing: "in" });
    void exit.then(() => {
      if (this.state !== "closing") return;
      this.state = "closed";
      this.removeAttribute("data-ark-state");
    });
  }

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
      "[ark-drawer] sem `label`, `aria-label` ou `aria-labelledby`: a gaveta fica sem nome acessível.",
      this
    );
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || this.state !== "open" || this.mode !== "overlay") return;
    event.preventDefault();
    event.stopPropagation();
    if (!this.persistent) this.close("escape");
  };

  // --- Aparência ---

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  // Tamanho no eixo da gaveta: preset ou comprimento CSS (número vira px) numa custom property inline.
  private sizeClass(horizontal: boolean): string {
    const raw = (this.getAttribute("size") || "md").trim().toLowerCase();
    const presets: Record<"sm" | "md" | "lg", { w: string; h: string }> = {
      sm: { w: "ark:w-72", h: "ark:h-64" },
      md: { w: "ark:w-96", h: "ark:h-80" },
      lg: { w: "ark:w-[32rem]", h: "ark:h-[28rem]" }
    };
    const preset = presets[raw as "sm" | "md" | "lg"];
    if (preset) {
      this.style.removeProperty("--ark-drawer-size");
      return horizontal ? preset.w : preset.h;
    }
    this.style.setProperty("--ark-drawer-size", cssLength(raw) ?? "24rem");
    return horizontal ? "ark:w-(--ark-drawer-size)" : "ark:h-(--ark-drawer-size)";
  }

  private computeClasses(): string[] {
    const side = this.side;
    const overlay = this.mode === "overlay";
    const horizontal = side === "left" || side === "right";

    // Overlay redefine o que o UA dá a [popover]; o display vem do components.css (host fechado oculto).
    const base = overlay
      ? "ark:fixed ark:m-0 ark:overflow-y-auto ark:overscroll-contain ark:border-border ark:bg-surface ark:text-fg ark:shadow-xl ark:outline-none"
      : "ark:relative ark:overflow-y-auto ark:border-border ark:bg-surface ark:text-fg ark:outline-none";
    const overlaySides: Record<ArkDrawerSide, string> = {
      left: "ark:inset-y-0 ark:left-0 ark:right-auto ark:h-full ark:max-w-full ark:border-r",
      right: "ark:inset-y-0 ark:right-0 ark:left-auto ark:h-full ark:max-w-full ark:border-l",
      top: "ark:inset-x-0 ark:top-0 ark:bottom-auto ark:w-full ark:max-h-full ark:border-b",
      bottom: "ark:inset-x-0 ark:bottom-0 ark:top-auto ark:w-full ark:max-h-full ark:border-t"
    };
    const inlineSides: Record<ArkDrawerSide, string> = {
      left: "ark:max-w-full ark:border-r",
      right: "ark:max-w-full ark:border-l",
      top: "ark:max-h-full ark:border-b",
      bottom: "ark:max-h-full ark:border-t"
    };

    return [base, overlay ? overlaySides[side] : inlineSides[side], this.sizeClass(horizontal)]
      .join(" ")
      .split(/\s+/)
      .filter(Boolean);
  }

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

  private syncFooter(): void {
    const footer = this.querySelector<HTMLElement>(':scope > [slot="footer"]');
    if (footer) applyTestHooks(this, "drawer", footer, "footer");
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
    const overlay = this.mode === "overlay";
    const label = this.getAttribute("label");

    // O popover só existe no overlay; o inline fica no fluxo. Trocar de modo aberto não é suportado.
    if (this.state === "closed") {
      if (overlay) {
        this.setAttribute("popover", "manual");
      } else {
        this.removeAttribute("popover");
      }
    }

    if (overlay) {
      this.setAttribute("role", "dialog");
      this.setAttribute("aria-modal", "true");
    } else {
      this.setAttribute("role", "region");
      this.removeAttribute("aria-modal");
    }
    this.setAttribute("tabindex", "-1");
    this.setAttribute("data-ark-side", this.side);
    this.setAttribute("data-ark-mode", this.mode);

    this.syncHeader(label, !this.hasAttribute("no-close-button"));

    // Nome acessível: o título; sem ele um aria-label do usuário fica.
    if (label && this.titleEl) {
      this.setAttribute("aria-labelledby", this.titleId);
      this.appliedLabelledBy = this.titleId;
    } else if (this.appliedLabelledBy && this.getAttribute("aria-labelledby") === this.appliedLabelledBy) {
      this.removeAttribute("aria-labelledby");
      this.appliedLabelledBy = null;
    }

    this.applyOwnClasses(this.computeClasses());

    applyTestHooks(this, "drawer", this);
    if (this.headerEl) applyTestHooks(this, "drawer", this.headerEl, "header");
    if (this.titleEl) applyTestHooks(this, "drawer", this.titleEl, "title");
    if (this.closeEl) applyTestHooks(this, "drawer", this.closeEl, "close");
    this.syncFooter();
  }
}

export default ArkDrawer;
