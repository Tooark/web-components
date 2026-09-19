import type { ArkCarouselSnap, ArkIntent } from "@tooark/core";
import { prefersReducedMotion } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

type ArkCarouselPalette = {
  frame: string;
  arrowButton: string;
  dotButton: string;
  dotActive: string;
};

/**
 * Marca os nós criados pelo componente (overlay de setas/dots) para
 * distingui-los dos slides do usuário sem tocar nestes.
 */
const CHROME_ATTR = "data-ark-chrome";

/**
 * Carousel com CSS scroll snap: o PRÓPRIO host é o container rolável e os
 * slides são os filhos diretos, exatamente onde o usuário os declarou — nada
 * é movido, então frameworks podem adicionar e remover slides à vontade.
 * Setas e dots vivem num overlay `position: sticky` (ver components.css).
 * Arrasto com mouse é emulado; touch/trackpad usam a rolagem nativa.
 */
export class ArkCarousel extends HTMLElement {
  static readonly tagName = "ark-carousel";

  private overlayEl: HTMLDivElement | null = null;
  private dotsEl: HTMLDivElement | null = null;
  private arrowPrevEl: HTMLButtonElement | null = null;
  private arrowNextEl: HTMLButtonElement | null = null;

  private currentIndex = 0;
  private autoplayId: number | null = null;
  private scrollTimer: number | null = null;
  private mountFrame: number | null = null;
  private observer: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;

  // Arrasto com mouse.
  private dragging = false;
  private dragStartX = 0;
  private dragStartScroll = 0;
  private dragMoved = false;

  static get observedAttributes(): string[] {
    return [
      "theme",
      "intent",
      "accent-color",
      "slides-per-view",
      "gap",
      "start-index",
      "loop",
      "autoplay",
      "autoplay-delay",
      "show-dots",
      "show-arrows",
      "drag-free",
      "snap",
      "class",
      "testid"
    ];
  }

  constructor() {
    super();
    this.addEventListener("scroll", this.handleScroll, { passive: true });
    this.addEventListener("pointerdown", this.handlePointerDown);
    this.addEventListener("pointermove", this.handlePointerMove);
    this.addEventListener("pointerup", this.handlePointerUp);
    this.addEventListener("pointercancel", this.handlePointerUp);
    // Um arrasto não deve virar click no slide.
    this.addEventListener(
      "click",
      (event) => {
        if (this.dragMoved) {
          event.preventDefault();
          event.stopPropagation();
          this.dragMoved = false;
        }
      },
      { capture: true }
    );
    this.addEventListener("mouseenter", this.handleMouseEnter);
    this.addEventListener("mouseleave", this.handleMouseLeave);
    this.addEventListener("focusin", this.handleMouseEnter);
    this.addEventListener("focusout", this.handleMouseLeave);
  }

  connectedCallback(): void {
    this.build();

    if (!this.observer) {
      this.observer = new MutationObserver((records) => {
        // Só reage a slides do usuário; ignora as mutações do próprio overlay.
        const relevant = records.some((record) =>
          [...record.addedNodes, ...record.removedNodes].some(
            (node) => node instanceof HTMLElement && !node.hasAttribute(CHROME_ATTR)
          )
        );
        if (relevant) this.handleSlidesChanged();
      });
      this.observer.observe(this, { childList: true });
    }

    if (!this.resizeObserver && typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.renderDots();
        this.goTo(this.currentIndex, { behavior: "auto" });
      });
      this.resizeObserver.observe(this);
    }

    this.currentIndex = this.normalizeIndex(this.getStartIndex());
    // O offsetLeft dos slides so existe depois do layout, entao o posicionamento inicial espera um frame. Ele parte
    // do indice ATUAL, nao do start-index: um next()/click no primeiro frame ja mudou o indice e disparou o evento, e
    // voltar ao inicio aqui deixava a rolagem suave seguir sozinha ate o slide, com um segundo ark-slide-change.
    this.mountFrame = requestAnimationFrame(() => {
      this.mountFrame = null;
      this.goTo(this.currentIndex, { behavior: "auto" });
      this.startAutoplay();
    });
  }

  disconnectedCallback(): void {
    if (this.mountFrame !== null) {
      cancelAnimationFrame(this.mountFrame);
      this.mountFrame = null;
    }
    this.stopAutoplay();
    this.observer?.disconnect();
    this.observer = null;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.scrollTimer !== null) {
      window.clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;

    if (name === "start-index") {
      this.goTo(this.getStartIndex(), { emit: true });
      return;
    }

    this.build();
    this.startAutoplay();
  }

  /** Índice do slide atual (primeiro visível). */
  get index(): number {
    return this.currentIndex;
  }

  /** Slides do usuário: filhos diretos que não são o overlay do componente. */
  get slides(): HTMLElement[] {
    return Array.from(this.children).filter(
      (node): node is HTMLElement => node instanceof HTMLElement && !node.hasAttribute(CHROME_ATTR)
    );
  }

  next(): void {
    this.stopAutoplay();
    this.goTo(this.currentIndex + 1, { emit: true });
  }

  prev(): void {
    this.stopAutoplay();
    this.goTo(this.currentIndex - 1, { emit: true });
  }

  // --- Atributos ---

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "primary").toLowerCase();
    if (
      intent === "primary" ||
      intent === "secondary" ||
      intent === "success" ||
      intent === "warning" ||
      intent === "danger" ||
      intent === "info" ||
      intent === "neutral"
    ) {
      return intent;
    }
    return "primary";
  }

  private getAccentColor(): string | null {
    const color = this.getAttribute("accent-color")?.trim();
    return color || null;
  }

  private getSlidesPerView(): number {
    const parsed = Number(this.getAttribute("slides-per-view") || "1");
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.floor(parsed));
  }

  private getGap(): number {
    const parsed = Number(this.getAttribute("gap") || "12");
    if (!Number.isFinite(parsed)) return 12;
    return Math.max(0, parsed);
  }

  private getStartIndex(): number {
    const parsed = Number(this.getAttribute("start-index") || "0");
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.floor(parsed));
  }

  private isLoopEnabled(): boolean {
    return this.hasAttribute("loop");
  }

  private isAutoplayEnabled(): boolean {
    return this.hasAttribute("autoplay");
  }

  private getAutoplayDelay(): number {
    const parsed = Number(this.getAttribute("autoplay-delay") || "4200");
    if (!Number.isFinite(parsed)) return 4200;
    return Math.max(1200, parsed);
  }

  private shouldShowDots(): boolean {
    return !this.hasAttribute("show-dots") || this.getAttribute("show-dots") !== "false";
  }

  private shouldShowArrows(): boolean {
    return !this.hasAttribute("show-arrows") || this.getAttribute("show-arrows") !== "false";
  }

  private getSnapMode(): ArkCarouselSnap {
    const value = (this.getAttribute("snap") || "mandatory").toLowerCase();
    return value === "proximity" ? "proximity" : "mandatory";
  }

  private getMaxIndex(): number {
    return Math.max(0, this.slides.length - this.getSlidesPerView());
  }

  private normalizeIndex(index: number): number {
    const maxIndex = this.getMaxIndex();
    if (maxIndex <= 0) return 0;

    if (this.isLoopEnabled()) {
      if (index < 0) return maxIndex;
      if (index > maxIndex) return 0;
      return index;
    }

    return Math.min(maxIndex, Math.max(0, index));
  }

  private getPalette(intent: ArkIntent): ArkCarouselPalette {
    const byIntent: Record<ArkIntent, { dotActive: string; frameBorder: string }> = {
      primary: { dotActive: "ark:bg-primary", frameBorder: "ark:border-border" },
      secondary: { dotActive: "ark:bg-secondary", frameBorder: "ark:border-border" },
      success: { dotActive: "ark:bg-success", frameBorder: "ark:border-success-border" },
      warning: { dotActive: "ark:bg-warning", frameBorder: "ark:border-warning-border" },
      danger: { dotActive: "ark:bg-danger", frameBorder: "ark:border-danger-border" },
      info: { dotActive: "ark:bg-info", frameBorder: "ark:border-info-border" },
      neutral: { dotActive: "ark:bg-neutral", frameBorder: "ark:border-neutral-border" }
    };

    const intentStyles = byIntent[intent];
    return {
      frame: `ark:rounded-2xl ark:border ark:bg-surface-muted ark:shadow-lg ${intentStyles.frameBorder}`,
      arrowButton:
        "ark:inline-flex ark:h-9 ark:w-9 ark:items-center ark:justify-center ark:rounded-full ark:border ark:border-border-strong ark:bg-surface ark:text-fg-soft ark:transition ark:hover:bg-surface-muted ark:focus:outline-none ark:focus-visible:ring-2 ark:focus-visible:ring-ring ark:disabled:opacity-40 ark:disabled:cursor-not-allowed",
      dotButton: "ark:h-2.5 ark:w-2.5 ark:rounded-full ark:bg-muted ark:transition ark:hover:bg-fg-placeholder",
      dotActive: intentStyles.dotActive
    };
  }

  // --- Navegação ---

  private slideOffset(index: number): number {
    const slide = this.slides[index];
    return slide ? slide.offsetLeft : 0;
  }

  private goTo(index: number, options?: { emit?: boolean; behavior?: ScrollBehavior }): void {
    const nextIndex = this.normalizeIndex(index);
    const changed = nextIndex !== this.currentIndex;
    this.currentIndex = nextIndex;

    const behavior: ScrollBehavior = options?.behavior ?? (prefersReducedMotion() ? "auto" : "smooth");
    const left = this.slideOffset(nextIndex);
    if (Math.abs(this.scrollLeft - left) > 1) {
      this.scrollTo({ left, behavior });
    }

    this.renderDots();
    this.syncArrowState();

    if (changed && options?.emit) {
      this.emitSlideChange();
    }
  }

  private emitSlideChange(): void {
    this.dispatchEvent(
      new CustomEvent("ark-slide-change", {
        detail: { index: this.currentIndex },
        bubbles: true,
        composed: true
      })
    );
  }

  /** Índice do slide mais próximo da borda esquerda visível. */
  private indexFromScroll(): number {
    const slides = this.slides;
    if (slides.length === 0) return 0;
    const left = this.scrollLeft;
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - left);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return Math.min(best, this.getMaxIndex());
  }

  private readonly handleScroll = (): void => {
    if (this.scrollTimer !== null) window.clearTimeout(this.scrollTimer);
    // Rolagem nativa (touch/trackpad/setas): sincroniza o índice ao parar.
    this.scrollTimer = window.setTimeout(() => {
      this.scrollTimer = null;
      const index = this.indexFromScroll();
      if (index !== this.currentIndex) {
        this.currentIndex = index;
        this.renderDots();
        this.syncArrowState();
        this.emitSlideChange();
      }
    }, 80);
  };

  private handleSlidesChanged(): void {
    this.slides.forEach((slide, index) => {
      applyTestHooks(this, "carousel", slide, `slide-${index}`);
    });
    this.currentIndex = this.normalizeIndex(this.currentIndex);
    this.renderDots();
    this.syncArrowState();
    this.startAutoplay();
  }

  // --- Arrasto com mouse (touch usa a rolagem nativa) ---

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== "mouse" || event.button !== 0 || this.slides.length <= 1) return;
    if ((event.target as HTMLElement | null)?.closest(`[${CHROME_ATTR}]`)) return;

    this.dragging = true;
    this.dragMoved = false;
    this.dragStartX = event.clientX;
    this.dragStartScroll = this.scrollLeft;
    this.setAttribute("data-ark-dragging", "");
    this.setPointerCapture(event.pointerId);
    this.stopAutoplay();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    const delta = event.clientX - this.dragStartX;
    if (Math.abs(delta) > 4) this.dragMoved = true;
    this.scrollLeft = this.dragStartScroll - delta;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (!this.dragging) return;
    this.dragging = false;
    if (this.hasPointerCapture(event.pointerId)) this.releasePointerCapture(event.pointerId);
    // Restaurar o snap faz o navegador "encaixar" no slide mais próximo.
    this.removeAttribute("data-ark-dragging");
    const index = this.indexFromScroll();
    this.goTo(index, { emit: true });
  };

  // --- Autoplay ---

  private readonly handleMouseEnter = (): void => {
    this.stopAutoplay();
  };

  private readonly handleMouseLeave = (): void => {
    this.startAutoplay();
  };

  private startAutoplay(): void {
    this.stopAutoplay();

    // Movimento automático contínuo é desligado com prefers-reduced-motion.
    if (!this.isAutoplayEnabled() || this.slides.length <= 1 || prefersReducedMotion()) return;
    if (this.matches(":hover, :focus-within")) return;

    this.autoplayId = window.setInterval(() => {
      this.goTo(this.currentIndex + 1, { emit: true });
    }, this.getAutoplayDelay());
  }

  private stopAutoplay(): void {
    if (this.autoplayId !== null) {
      window.clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  // --- Overlay: setas e dots ---

  private syncArrowState(): void {
    if (!this.arrowPrevEl || !this.arrowNextEl) return;

    if (this.isLoopEnabled()) {
      this.arrowPrevEl.disabled = false;
      this.arrowNextEl.disabled = false;
      return;
    }

    const max = this.getMaxIndex();
    this.arrowPrevEl.disabled = this.currentIndex <= 0;
    this.arrowNextEl.disabled = this.currentIndex >= max;
  }

  private renderDots(): void {
    if (!this.dotsEl) return;

    this.dotsEl.replaceChildren();
    const totalDots = this.getMaxIndex() + 1;
    this.dotsEl.hidden = totalDots <= 1 || !this.shouldShowDots();
    if (this.dotsEl.hidden) return;

    const palette = this.getPalette(this.getIntent());
    const accentColor = this.getAccentColor();

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      const active = i === this.currentIndex;
      dot.className = `${palette.dotButton} ${active ? palette.dotActive : ""}`.trim();
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      if (active) dot.setAttribute("aria-current", "true");
      applyTestHooks(this, "carousel", dot, `dot-${i}`);

      if (active && accentColor) {
        dot.style.backgroundColor = accentColor;
      }

      dot.addEventListener("click", () => {
        this.stopAutoplay();
        this.goTo(i, { emit: true });
      });
      this.dotsEl.appendChild(dot);
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

  private build(): void {
    const palette = this.getPalette(this.getIntent());
    const accentColor = this.getAccentColor();

    // Host: frame + container rolável (estrutura em components.css).
    this.style.setProperty("--ark-carousel-per-view", String(this.getSlidesPerView()));
    this.style.setProperty("--ark-carousel-gap", `${this.getGap()}px`);
    this.applyOwnClasses(palette.frame.split(/\s+/).filter(Boolean));
    if (this.getSnapMode() === "proximity") {
      this.setAttribute("data-ark-snap", "proximity");
    } else {
      this.removeAttribute("data-ark-snap");
    }
    applyTestHooks(this, "carousel", this);
    this.slides.forEach((slide, index) => {
      applyTestHooks(this, "carousel", slide, `slide-${index}`);
    });

    // Overlay sticky: sempre o PRIMEIRO filho, cobrindo a área visível.
    if (!this.overlayEl) {
      const overlay = document.createElement("div");
      overlay.setAttribute(CHROME_ATTR, "overlay");
      this.prepend(overlay);
      this.overlayEl = overlay;
    }
    const overlay = this.overlayEl;
    overlay.replaceChildren();
    applyTestHooks(this, "carousel", overlay, "overlay");

    this.arrowPrevEl = null;
    this.arrowNextEl = null;

    if (this.shouldShowArrows()) {
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = `${palette.arrowButton} ark:pointer-events-auto ark:absolute ark:left-2 ark:top-1/2 ark:-translate-y-1/2`;
      applyTestHooks(this, "carousel", prev, "arrow-prev");
      prev.setAttribute("aria-label", "Previous slide");
      prev.innerHTML = "&#10094;";
      prev.addEventListener("click", () => this.prev());

      const next = document.createElement("button");
      next.type = "button";
      next.className = `${palette.arrowButton} ark:pointer-events-auto ark:absolute ark:right-2 ark:top-1/2 ark:-translate-y-1/2`;
      applyTestHooks(this, "carousel", next, "arrow-next");
      next.setAttribute("aria-label", "Next slide");
      next.innerHTML = "&#10095;";
      next.addEventListener("click", () => this.next());

      if (accentColor) {
        prev.style.borderColor = accentColor;
        next.style.borderColor = accentColor;
      }

      overlay.appendChild(prev);
      overlay.appendChild(next);
      this.arrowPrevEl = prev;
      this.arrowNextEl = next;
    }

    const dots = document.createElement("div");
    dots.className =
      "ark:pointer-events-auto ark:absolute ark:left-1/2 ark:top-full ark:mt-3 ark:flex ark:-translate-x-1/2 ark:items-center ark:gap-2";
    applyTestHooks(this, "carousel", dots, "dots");
    overlay.appendChild(dots);
    this.dotsEl = dots;

    this.currentIndex = this.normalizeIndex(this.currentIndex);
    this.renderDots();
    this.syncArrowState();
  }
}

export default ArkCarousel;
