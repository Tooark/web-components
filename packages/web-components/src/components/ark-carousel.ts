import "../styles/tailwind.css";
import type { ArkCarouselSnap, ArkIntent, ArkThemeSelected } from "@tooark/core";

type ArkCarouselPalette = {
  frame: string;
  viewport: string;
  track: string;
  slideSurface: string;
  arrowButton: string;
  dotButton: string;
  dotActive: string;
};

export class ArkCarousel extends HTMLElement {
  static readonly tagName = "ark-carousel";

  private root: HTMLDivElement | null = null;
  private viewportEl: HTMLDivElement | null = null;
  private trackEl: HTMLDivElement | null = null;
  private dotsEl: HTMLDivElement | null = null;
  private arrowPrevEl: HTMLButtonElement | null = null;
  private arrowNextEl: HTMLButtonElement | null = null;

  private slides: HTMLElement[] = [];
  private slideStepPx = 0;
  private currentIndex = 0;

  private dragging = false;
  private dragStartX = 0;
  private dragOffsetPx = 0;

  private autoplayId: number | null = null;

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
      "snap"
    ];
  }

  connectedCallback(): void {
    this.captureSlides();
    this.currentIndex = this.normalizeIndex(this.getStartIndex());
    this.build();
    this.startAutoplay();

    this.addEventListener("mouseenter", this.handleMouseEnter);
    this.addEventListener("mouseleave", this.handleMouseLeave);
    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback(): void {
    this.stopAutoplay();
    this.removeEventListener("mouseenter", this.handleMouseEnter);
    this.removeEventListener("mouseleave", this.handleMouseLeave);
    window.removeEventListener("resize", this.handleResize);
  }

  attributeChangedCallback(name: string): void {
    if (name === "start-index") {
      this.currentIndex = this.normalizeIndex(this.getStartIndex());
    }

    this.build();
    this.startAutoplay();
  }

  private readonly handleMouseEnter = (): void => {
    this.stopAutoplay();
  };

  private readonly handleMouseLeave = (): void => {
    this.startAutoplay();
  };

  private readonly handleResize = (): void => {
    this.measureSlideStep();
    this.applyTrackTransform();
    this.renderDots();
  };

  private getTheme(): ArkThemeSelected {
    const theme = (this.getAttribute("theme") || "auto").toLowerCase();
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  private getIntent(): ArkIntent {
    const intent = (this.getAttribute("intent") || "primary").toLowerCase();
    if (intent === "primary" || intent === "secondary" || intent === "success" || intent === "warning" || intent === "danger" || intent === "info" || intent === "neutral") {
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

  private isDragFree(): boolean {
    return this.hasAttribute("drag-free");
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

  private getPalette(theme: ArkThemeSelected, intent: ArkIntent): ArkCarouselPalette {
    const lightIntent: Record<ArkIntent, { dotActive: string; frameBorder: string; shadow: string }> = {
      primary: { dotActive: "bg-slate-900", frameBorder: "border-slate-200", shadow: "shadow-slate-200/70" },
      secondary: { dotActive: "bg-slate-700", frameBorder: "border-slate-200", shadow: "shadow-slate-200/70" },
      success: { dotActive: "bg-emerald-600", frameBorder: "border-emerald-200", shadow: "shadow-emerald-200/60" },
      warning: { dotActive: "bg-amber-500", frameBorder: "border-amber-200", shadow: "shadow-amber-200/60" },
      danger: { dotActive: "bg-red-600", frameBorder: "border-red-200", shadow: "shadow-red-200/60" },
      info: { dotActive: "bg-sky-600", frameBorder: "border-sky-200", shadow: "shadow-sky-200/60" },
      neutral: { dotActive: "bg-zinc-700", frameBorder: "border-zinc-200", shadow: "shadow-zinc-200/70" }
    };

    const darkIntent: Record<ArkIntent, { dotActive: string; frameBorder: string; shadow: string }> = {
      primary: { dotActive: "bg-slate-100", frameBorder: "border-slate-700", shadow: "shadow-black/30" },
      secondary: { dotActive: "bg-slate-300", frameBorder: "border-slate-700", shadow: "shadow-black/30" },
      success: { dotActive: "bg-emerald-400", frameBorder: "border-emerald-700", shadow: "shadow-black/30" },
      warning: { dotActive: "bg-amber-300", frameBorder: "border-amber-700", shadow: "shadow-black/30" },
      danger: { dotActive: "bg-red-400", frameBorder: "border-red-700", shadow: "shadow-black/30" },
      info: { dotActive: "bg-sky-400", frameBorder: "border-sky-700", shadow: "shadow-black/30" },
      neutral: { dotActive: "bg-zinc-300", frameBorder: "border-zinc-700", shadow: "shadow-black/30" }
    };

    if (theme === "dark") {
      const intentStyles = darkIntent[intent];
      return {
        frame: `rounded-2xl border bg-slate-900 p-4 shadow-lg ${intentStyles.frameBorder} ${intentStyles.shadow}`,
        viewport: "overflow-hidden rounded-xl bg-slate-950",
        track: "flex select-none touch-pan-y",
        slideSurface: "rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-slate-100",
        arrowButton: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-slate-200 transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed",
        dotButton: "h-2.5 w-2.5 rounded-full bg-slate-600 transition hover:bg-slate-500",
        dotActive: intentStyles.dotActive
      };
    }

    const intentStyles = lightIntent[intent];
    return {
      frame: `rounded-2xl border bg-white p-4 shadow-lg ${intentStyles.frameBorder} ${intentStyles.shadow}`,
      viewport: "overflow-hidden rounded-xl bg-slate-50",
      track: "flex select-none touch-pan-y",
      slideSurface: "rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900",
      arrowButton: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-40 disabled:cursor-not-allowed",
      dotButton: "h-2.5 w-2.5 rounded-full bg-slate-300 transition hover:bg-slate-400",
      dotActive: intentStyles.dotActive
    };
  }

  private captureSlides(): void {
    if (this.slides.length > 0) return;

    const initialSlides = Array.from(this.children).filter((node): node is HTMLElement => {
      return node instanceof HTMLElement && !node.hasAttribute("data-ark-carousel-root");
    });

    this.slides = initialSlides;

    for (const slide of this.slides) {
      this.removeChild(slide);
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();

    if (!this.isAutoplayEnabled() || this.slides.length <= 1) return;

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

  private goTo(index: number, options?: { emit?: boolean }): void {
    this.currentIndex = this.normalizeIndex(index);
    this.applyTrackTransform();
    this.renderDots();
    this.syncArrowState();

    if (options?.emit) {
      this.dispatchEvent(
        new CustomEvent("ark-slide-change", {
          detail: { index: this.currentIndex },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  private prev = (): void => {
    this.stopAutoplay();
    this.goTo(this.currentIndex - 1, { emit: true });
  };

  private next = (): void => {
    this.stopAutoplay();
    this.goTo(this.currentIndex + 1, { emit: true });
  };

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

    this.dotsEl.innerHTML = "";
    const totalDots = this.getMaxIndex() + 1;
    if (totalDots <= 1 || !this.shouldShowDots()) return;

    const theme = this.getTheme();
    const intent = this.getIntent();
    const accentColor = this.getAccentColor();
    const palette = this.getPalette(theme, intent);

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `${palette.dotButton} ${i === this.currentIndex ? palette.dotActive : ""}`.trim();
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);

      if (i === this.currentIndex && accentColor) {
        dot.style.backgroundColor = accentColor;
      }

      dot.addEventListener("click", () => {
        this.stopAutoplay();
        this.goTo(i, { emit: true });
      });
      this.dotsEl.appendChild(dot);
    }
  }

  private measureSlideStep(): void {
    if (!this.trackEl) return;

    const first = this.trackEl.children.item(0) as HTMLElement | null;
    const second = this.trackEl.children.item(1) as HTMLElement | null;
    if (!first) {
      this.slideStepPx = 0;
      return;
    }

    if (second) {
      this.slideStepPx = second.offsetLeft - first.offsetLeft;
      return;
    }

    this.slideStepPx = first.getBoundingClientRect().width;
  }

  private applyTrackTransform(): void {
    if (!this.trackEl) return;

    const offset = this.slideStepPx * this.currentIndex;
    this.trackEl.style.transform = `translate3d(${-offset + this.dragOffsetPx}px, 0, 0)`;
  }

  private bindDragHandlers(viewport: HTMLDivElement, track: HTMLDivElement): void {
    const getClientX = (event: PointerEvent): number => event.clientX;

    viewport.onpointerdown = (event: PointerEvent) => {
      if (this.slides.length <= 1) return;

      this.dragging = true;
      this.dragStartX = getClientX(event);
      this.dragOffsetPx = 0;
      track.style.transition = "none";
      viewport.setPointerCapture(event.pointerId);
      this.stopAutoplay();
    };

    viewport.onpointermove = (event: PointerEvent) => {
      if (!this.dragging) return;

      this.dragOffsetPx = getClientX(event) - this.dragStartX;
      this.applyTrackTransform();
    };

    const finishDrag = (event: PointerEvent): void => {
      if (!this.dragging) return;

      this.dragging = false;
      viewport.releasePointerCapture(event.pointerId);
      track.style.transition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";

      const movement = this.dragOffsetPx;
      const step = Math.max(1, this.slideStepPx);
      const projected = this.currentIndex - movement / step;
      const threshold = this.getSnapMode() === "proximity" ? 0.18 : 0.32;

      if (!this.isDragFree() && Math.abs(movement) / step < threshold) {
        this.dragOffsetPx = 0;
        this.applyTrackTransform();
        return;
      }

      this.dragOffsetPx = 0;
      this.goTo(Math.round(projected), { emit: true });
    };

    viewport.onpointerup = finishDrag;
    viewport.onpointercancel = finishDrag;
    viewport.onpointerleave = (event: PointerEvent) => {
      if (this.dragging) finishDrag(event);
    };
  }

  private build(): void {
    this.captureSlides();

    if (this.root) {
      this.root.remove();
      this.root = null;
      this.viewportEl = null;
      this.trackEl = null;
      this.dotsEl = null;
      this.arrowPrevEl = null;
      this.arrowNextEl = null;
    }

    const theme = this.getTheme();
    const intent = this.getIntent();
    const palette = this.getPalette(theme, intent);
    const accentColor = this.getAccentColor();
    const slidesPerView = this.getSlidesPerView();
    const gap = this.getGap();

    const root = document.createElement("div");
    root.setAttribute("part", "container");
    root.setAttribute("data-ark-carousel-root", "true");
    root.className = `${palette.frame} relative`;

    const viewport = document.createElement("div");
    viewport.setAttribute("part", "viewport");
    viewport.className = palette.viewport;

    const track = document.createElement("div");
    track.setAttribute("part", "track");
    track.className = palette.track;
    track.style.gap = `${gap}px`;
    track.style.transition = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";
    track.style.willChange = "transform";
    track.style.cursor = "grab";

    const slideWidth = `calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`;

    for (const slide of this.slides) {
      slide.setAttribute("part", "slide");
      slide.className = `${palette.slideSurface} ${slide.getAttribute("class") || ""}`.trim();
      slide.style.flex = `0 0 ${slideWidth}`;
      track.appendChild(slide);
    }

    viewport.appendChild(track);
    root.appendChild(viewport);

    if (this.shouldShowArrows()) {
      const arrowsWrap = document.createElement("div");
      arrowsWrap.className = "pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2";

      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = `${palette.arrowButton} pointer-events-auto`;
      prev.setAttribute("aria-label", "Previous slide");
      prev.innerHTML = "&#10094;";
      prev.addEventListener("click", this.prev);

      const next = document.createElement("button");
      next.type = "button";
      next.className = `${palette.arrowButton} pointer-events-auto`;
      next.setAttribute("aria-label", "Next slide");
      next.innerHTML = "&#10095;";
      next.addEventListener("click", this.next);

      if (accentColor) {
        prev.style.borderColor = accentColor;
        next.style.borderColor = accentColor;
      }

      arrowsWrap.appendChild(prev);
      arrowsWrap.appendChild(next);
      root.appendChild(arrowsWrap);

      this.arrowPrevEl = prev;
      this.arrowNextEl = next;
    }

    const dots = document.createElement("div");
    dots.setAttribute("part", "dots");
    dots.className = "mt-4 flex items-center justify-center gap-2";
    root.appendChild(dots);

    this.root = root;
    this.viewportEl = viewport;
    this.trackEl = track;
    this.dotsEl = dots;

    this.appendChild(root);
    this.bindDragHandlers(viewport, track);

    this.currentIndex = this.normalizeIndex(this.currentIndex);

    queueMicrotask(() => {
      this.measureSlideStep();
      this.applyTrackTransform();
      this.renderDots();
      this.syncArrowState();
    });
  }
}

export default ArkCarousel;
