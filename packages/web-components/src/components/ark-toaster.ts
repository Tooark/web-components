import "../styles/tailwind.css";
import { arkEnter, arkExit } from "@tooark/core";
import type { ArkMotionPreset, ArkThemeSelected, ArkToastOptions, ArkToastPosition, ArkToastType } from "@tooark/core";

type ArkToastItem = ArkToastOptions & {
  id: string;
  type: ArkToastType;
  createdAt: number;
};

type ArkToasterPalette = {
  stack: string;
  toastBase: string;
  title: string;
  description: string;
  closeButton: string;
  actionButton: string;
  cancelButton: string;
  icon: string;
};

export class ArkToaster extends HTMLElement {
  static readonly tagName = "ark-toaster";

  private root: HTMLDivElement | null = null;
  private toasts: ArkToastItem[] = [];
  private timers = new Map<string, number>();
  private entered = new Set<string>();
  private exiting = new Set<string>();

  static get observedAttributes (): string[] {
    return ["theme", "position", "rich-colors", "close-button", "max-visible", "duration"];
  }

  connectedCallback (): void {
    this.build();
    window.addEventListener("ark-toast", this.handleToast as EventListener);
    window.addEventListener("ark-toast-dismiss", this.handleDismiss as EventListener);
  }

  disconnectedCallback (): void {
    window.removeEventListener("ark-toast", this.handleToast as EventListener);
    window.removeEventListener("ark-toast-dismiss", this.handleDismiss as EventListener);

    for (const timer of this.timers.values()) {
      window.clearTimeout(timer);
    }
    this.timers.clear();
  }

  attributeChangedCallback (): void {
    this.render();
  }

  toast (options: ArkToastOptions): string {
    const id = options.id || `ark-toast-${Math.random().toString(36).slice(2, 10)}`;
    const item: ArkToastItem = {
      ...options,
      id,
      createdAt: Date.now(),
      type: options.type || "default"
    };

    this.toasts = [item, ...this.toasts.filter((toast) => toast.id !== id)];

    const maxVisible = this.getMaxVisible();
    if (this.toasts.length > maxVisible) {
      const removed = this.toasts.slice(maxVisible);
      this.toasts = this.toasts.slice(0, maxVisible);
      for (const toast of removed) {
        this.clearTimer(toast.id);
      }
    }

    this.scheduleDismiss(item);
    this.render();

    return id;
  }

  dismiss (id?: string): void {
    if (!id) {
      for (const toast of [...this.toasts]) {
        this.dismiss(toast.id);
      }
      return;
    }

    if (this.exiting.has(id)) return;
    this.clearTimer(id);

    const finalize = (): void => {
      this.exiting.delete(id);
      this.entered.delete(id);
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
      this.render();
    };

    const card = this.root?.querySelector<HTMLElement>(`[data-toast-id="${id}"]`);
    if (card) {
      this.exiting.add(id);
      arkExit(card, this.getExitPreset()).then(finalize);
    } else {
      finalize();
    }
  }

  private readonly handleToast = (event: Event): void => {
    const detail = (event as CustomEvent<ArkToastOptions & { id?: string }>).detail;
    if (!detail || !detail.title) return;
    this.toast(detail);
  };

  private readonly handleDismiss = (event: Event): void => {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    this.dismiss(detail?.id);
  };

  private getTheme (): ArkThemeSelected {
    const theme = (this.getAttribute("theme") || "auto").toLowerCase();
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";

    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  private getPosition (): ArkToastPosition {
    const position = (this.getAttribute("position") || "bottom-right").toLowerCase();
    if (
      position === "top-left" ||
      position === "top-center" ||
      position === "top-right" ||
      position === "bottom-left" ||
      position === "bottom-center" ||
      position === "bottom-right"
    ) {
      return position;
    }
    return "bottom-right";
  }

  private getMaxVisible (): number {
    const parsed = Number(this.getAttribute("max-visible") || "4");
    if (!Number.isFinite(parsed)) return 4;
    return Math.max(1, Math.floor(parsed));
  }

  private getBaseDuration (): number {
    const parsed = Number(this.getAttribute("duration") || "4000");
    if (!Number.isFinite(parsed)) return 4000;
    return Math.max(0, Math.floor(parsed));
  }

  private hasCloseButton (): boolean {
    return !this.hasAttribute("close-button") || this.getAttribute("close-button") !== "false";
  }

  private hasRichColors (): boolean {
    return this.hasAttribute("rich-colors");
  }

  private clearTimer (id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private scheduleDismiss (toast: ArkToastItem): void {
    this.clearTimer(toast.id);
    const duration = toast.duration ?? this.getBaseDuration();
    if (duration <= 0 || toast.type === "loading") return;

    const timer = window.setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);

    this.timers.set(toast.id, timer);
  }

  private getPalette (theme: ArkThemeSelected): ArkToasterPalette {
    if (theme === "dark") {
      return {
        stack: "fixed z-[9999] flex w-full max-w-sm flex-col gap-3 p-4 pointer-events-none",
        toastBase: "pointer-events-auto rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-lg shadow-black/40 backdrop-blur",
        title: "text-sm font-semibold text-slate-100",
        description: "mt-1 text-xs text-slate-300",
        closeButton: "rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-800",
        actionButton: "rounded-md px-2 py-1 text-xs font-medium text-slate-900 bg-slate-100 transition hover:bg-white",
        cancelButton: "rounded-md px-2 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-800",
        icon: "text-sm"
      };
    }

    return {
      stack: "fixed z-[9999] flex w-full max-w-sm flex-col gap-3 p-4 pointer-events-none",
      toastBase: "pointer-events-auto rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/80 backdrop-blur",
      title: "text-sm font-semibold text-slate-900",
      description: "mt-1 text-xs text-slate-600",
      closeButton: "rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100",
      actionButton: "rounded-md px-2 py-1 text-xs font-medium text-white bg-slate-900 transition hover:bg-slate-800",
      cancelButton: "rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100",
      icon: "text-sm"
    };
  }

  private getEnterPreset (): ArkMotionPreset {
    return this.getPosition().startsWith("top") ? "slide-down" : "slide-up";
  }

  private getExitPreset (): ArkMotionPreset {
    const position = this.getPosition();
    if (position.endsWith("right")) return "slide-right";
    if (position.endsWith("left")) return "slide-left";
    return "fade";
  }

  private getPositionClasses (position: ArkToastPosition): string {
    if (position === "top-left") return "left-0 top-0 items-start";
    if (position === "top-center") return "left-1/2 top-0 -translate-x-1/2 items-center";
    if (position === "top-right") return "right-0 top-0 items-end";
    if (position === "bottom-left") return "bottom-0 left-0 items-start";
    if (position === "bottom-center") return "bottom-0 left-1/2 -translate-x-1/2 items-center";
    return "bottom-0 right-0 items-end";
  }

  private getToastTypeClasses (type: ArkToastType, richColors: boolean): string {
    if (!richColors) return "";

    if (type === "success") return "border-emerald-400/60 bg-emerald-50 text-emerald-900";
    if (type === "info") return "border-sky-400/60 bg-sky-50 text-sky-900";
    if (type === "warning") return "border-amber-400/60 bg-amber-50 text-amber-900";
    if (type === "error") return "border-red-400/60 bg-red-50 text-red-900";
    if (type === "loading") return "border-indigo-400/60 bg-indigo-50 text-indigo-900";

    return "";
  }

  private getToastIcon (type: ArkToastType): string {
    if (type === "success") return "✓";
    if (type === "info") return "i";
    if (type === "warning") return "!";
    if (type === "error") return "x";
    if (type === "loading") return "...";
    return "•";
  }

  private build (): void {
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.setAttribute("part", "stack");
      this.appendChild(this.root);
    }

    this.render();
  }

  private render (): void {
    if (!this.root) return;

    const theme = this.getTheme();
    const position = this.getPosition();
    const richColors = this.hasRichColors();
    const closeButton = this.hasCloseButton();
    const palette = this.getPalette(theme);

    this.root.className = `${palette.stack} ${this.getPositionClasses(position)}`;
    this.root.innerHTML = "";

    const activeIds = new Set(this.toasts.map((toast) => toast.id));
    for (const id of this.entered) {
      if (!activeIds.has(id)) this.entered.delete(id);
    }

    for (const toast of this.toasts) {
      const card = document.createElement("section");
      card.setAttribute("part", "toast");
      card.dataset.toastId = toast.id;
      card.className = `${palette.toastBase} ${this.getToastTypeClasses(toast.type, richColors)}`.trim();

      const row = document.createElement("div");
      row.className = "flex items-start gap-3";

      const icon = document.createElement("span");
      icon.className = `${palette.icon} mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current/20`;
      icon.textContent = this.getToastIcon(toast.type);

      const content = document.createElement("div");
      content.className = "min-w-0 flex-1";

      const title = document.createElement("h4");
      title.className = palette.title;
      title.textContent = toast.title;
      content.appendChild(title);

      if (toast.description) {
        const description = document.createElement("p");
        description.className = palette.description;
        description.textContent = toast.description;
        content.appendChild(description);
      }

      row.appendChild(icon);
      row.appendChild(content);

      if (closeButton) {
        const close = document.createElement("button");
        close.type = "button";
        close.className = palette.closeButton;
        close.textContent = "Close";
        close.addEventListener("click", () => this.dismiss(toast.id));
        row.appendChild(close);
      }

      card.appendChild(row);

      if (toast.actionLabel || toast.cancelLabel) {
        const actions = document.createElement("div");
        actions.className = "mt-3 flex items-center justify-end gap-2";

        if (toast.cancelLabel) {
          const cancel = document.createElement("button");
          cancel.type = "button";
          cancel.className = palette.cancelButton;
          cancel.textContent = toast.cancelLabel;
          cancel.addEventListener("click", () => this.dismiss(toast.id));
          actions.appendChild(cancel);
        }

        if (toast.actionLabel) {
          const action = document.createElement("button");
          action.type = "button";
          action.className = palette.actionButton;
          action.textContent = toast.actionLabel;
          action.addEventListener("click", () => {
            this.dispatchEvent(
              new CustomEvent("ark-toast-action", {
                detail: { id: toast.id, actionId: toast.actionId || null },
                bubbles: true,
                composed: true
              })
            );
            this.dismiss(toast.id);
          });
          actions.appendChild(action);
        }

        card.appendChild(actions);
      }

      this.root.appendChild(card);

      if (this.exiting.has(toast.id)) {
        // Re-render durante uma saída em andamento: mantém o card oculto
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
      } else if (!this.entered.has(toast.id)) {
        this.entered.add(toast.id);
        arkEnter(card, this.getEnterPreset());
      }
    }
  }
}

export default ArkToaster;
