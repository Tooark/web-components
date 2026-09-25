import type { ArkMotionPreset, ArkToastOptions, ArkToastPosition, ArkToastType } from "@tooark/core";
import { arkEnter, arkExit, isPopoverOpen, resolveLocale } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

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

/**
 * Pilha de toasts da página. Não é chamado diretamente: escuta `ark-toast` e
 * `ark-toast-dismiss` em window, disparados pelo serviço `toast` do
 * @tooark/core, o que mantém serviço e elemento desacoplados. Mostra até
 * `max-visible` de cada vez e enfileira o excedente. A pilha é um
 * `popover="manual"` próprio: fica no top layer sem z-index, acima de
 * dialogs e menus, e é reaberta a cada toast novo para voltar ao topo da
 * pilha do top layer quando um overlay abriu depois dela.
 */
export class ArkToaster extends HTMLElementBase {
  static readonly tagName = "ark-toaster";

  private root: HTMLDivElement | null = null;
  private toasts: ArkToastItem[] = [];
  private timers = new Map<string, number>();
  private entered = new Set<string>();
  private exiting = new Set<string>();

  static get observedAttributes(): string[] {
    return ["theme", "position", "rich-colors", "close-button", "max-visible", "duration", "lang", "testid"];
  }

  connectedCallback(): void {
    this.build();
    window.addEventListener("ark-toast", this.handleToast as EventListener);
    window.addEventListener("ark-toast-dismiss", this.handleDismiss as EventListener);
  }

  disconnectedCallback(): void {
    window.removeEventListener("ark-toast", this.handleToast as EventListener);
    window.removeEventListener("ark-toast-dismiss", this.handleDismiss as EventListener);

    for (const timer of this.timers.values()) {
      window.clearTimeout(timer);
    }
    this.timers.clear();
  }

  attributeChangedCallback(): void {
    // Posição, rich-colors, close-button, lang e testid mudam os cards já montados: recria todos (sem reanimar a
    // entrada, que `entered` lembra).
    this.root?.replaceChildren();
    this.render();
  }

  toast(options: ArkToastOptions): string {
    const id = options.id || `ark-toast-${Math.random().toString(36).slice(2, 10)}`;
    const item: ArkToastItem = {
      ...options,
      id,
      createdAt: Date.now(),
      type: options.type || "default"
    };

    // Mesmo id: o card antigo sai e o toast volta ao topo como um novo.
    if (this.toasts.some((toast) => toast.id === id)) {
      this.cardOf(id)?.remove();
      this.entered.delete(id);
    }
    this.toasts = [item, ...this.toasts.filter((toast) => toast.id !== id)];
    // O render agenda o fechamento dos visíveis; o mesmo id recomeça a contagem.
    this.clearTimer(id);
    this.render();
    // Um overlay aberto depois da pilha ficaria por cima dela: reentrar no top layer a põe acima de novo.
    this.raise();

    return id;
  }

  dismiss(id?: string): void {
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

    const card = this.cardOf(id);
    if (card) {
      this.exiting.add(id);
      arkExit(card, this.getExitPreset()).then(finalize);
    } else {
      finalize();
    }
  }

  private cardOf(id: string): HTMLElement | null {
    return this.root?.querySelector<HTMLElement>(`[data-toast-id="${CSS.escape(id)}"]`) ?? null;
  }

  private readonly handleToast = (event: Event): void => {
    const detail = (event as CustomEvent<ArkToastOptions & { id?: string }>).detail;
    if (!detail?.title) return;
    this.toast(detail);
  };

  private readonly handleDismiss = (event: Event): void => {
    const detail = (event as CustomEvent<{ id?: string }>).detail;
    this.dismiss(detail?.id);
  };

  private getPosition(): ArkToastPosition {
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

  private getMaxVisible(): number {
    const parsed = Number(this.getAttribute("max-visible") || "4");
    if (!Number.isFinite(parsed)) return 4;
    return Math.max(1, Math.floor(parsed));
  }

  private getBaseDuration(): number {
    const parsed = Number(this.getAttribute("duration") || "4000");
    if (!Number.isFinite(parsed)) return 4000;
    return Math.max(0, Math.floor(parsed));
  }

  private getCloseLabel(): string {
    return resolveLocale(this.getAttribute("lang") || "en", undefined).close;
  }

  private hasCloseButton(): boolean {
    return !this.hasAttribute("close-button") || this.getAttribute("close-button") !== "false";
  }

  private hasRichColors(): boolean {
    return this.hasAttribute("rich-colors");
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  private scheduleDismiss(toast: ArkToastItem): void {
    this.clearTimer(toast.id);
    const duration = toast.duration ?? this.getBaseDuration();
    if (duration <= 0 || toast.type === "loading") return;

    const timer = window.setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);

    this.timers.set(toast.id, timer);
  }

  // --- Pilha no top layer ---

  // A pilha entra no top layer enquanto há toasts e sai quando esvazia; o display fica no components.css.
  private syncPopover(): void {
    if (!this.root || typeof this.root.showPopover !== "function") return;
    const open = isPopoverOpen(this.root);
    try {
      if (this.toasts.length > 0 && !open) {
        this.root.showPopover();
      } else if (this.toasts.length === 0 && open) {
        this.root.hidePopover();
      }
    } catch {
      // Desconectado no meio: nada a fazer.
    }
  }

  private raise(): void {
    if (!this.root || !isPopoverOpen(this.root) || typeof this.root.hidePopover !== "function") return;
    // Esconder tiraria o foco de um toast que o usuário está lendo pelo teclado: nesse caso fica onde está.
    if (this.root.contains(document.activeElement)) return;
    try {
      this.root.hidePopover();
      this.root.showPopover();
    } catch {
      // Desconectado no meio: nada a fazer.
    }
  }

  private getPalette(): ArkToasterPalette {
    // Redefine o que o UA dá a [popover] (inset, margin, border, padding, overflow, cores); o display vem do
    // components.css, para a pilha vazia ficar oculta mesmo com display do autor.
    return {
      stack:
        "ark:fixed ark:inset-auto ark:m-0 ark:w-full ark:max-w-sm ark:flex-col ark:gap-3 ark:overflow-visible ark:border-0 ark:bg-transparent ark:p-4 ark:text-inherit ark:pointer-events-none",
      toastBase:
        "ark:pointer-events-auto ark:rounded-xl ark:border ark:border-border ark:bg-surface/95 ark:p-4 ark:shadow-lg ark:backdrop-blur",
      title: "ark:text-sm ark:font-semibold ark:text-fg",
      description: "ark:mt-1 ark:text-xs ark:text-fg-soft",
      closeButton:
        "ark:rounded-md ark:border ark:border-border-strong ark:px-2 ark:py-1 ark:text-xs ark:text-fg-muted ark:transition ark:hover:bg-surface-muted",
      actionButton:
        "ark:rounded-md ark:px-2 ark:py-1 ark:text-xs ark:font-medium ark:text-primary-fg ark:bg-primary ark:transition ark:hover:bg-primary-hover",
      cancelButton:
        "ark:rounded-md ark:px-2 ark:py-1 ark:text-xs ark:font-medium ark:text-fg-muted ark:transition ark:hover:bg-surface-muted",
      icon: "ark:text-sm"
    };
  }

  private getEnterPreset(): ArkMotionPreset {
    return this.getPosition().startsWith("top") ? "slide-down" : "slide-up";
  }

  private getExitPreset(): ArkMotionPreset {
    const position = this.getPosition();
    if (position.endsWith("right")) return "slide-right";
    if (position.endsWith("left")) return "slide-left";
    return "fade";
  }

  private getPositionClasses(position: ArkToastPosition): string {
    if (position === "top-left") return "ark:left-0 ark:top-0 ark:items-start";
    if (position === "top-center") return "ark:left-1/2 ark:top-0 ark:-translate-x-1/2 ark:items-center";
    if (position === "top-right") return "ark:right-0 ark:top-0 ark:items-end";
    if (position === "bottom-left") return "ark:bottom-0 ark:left-0 ark:items-start";
    if (position === "bottom-center") return "ark:bottom-0 ark:left-1/2 ark:-translate-x-1/2 ark:items-center";
    return "ark:bottom-0 ark:right-0 ark:items-end";
  }

  private getToastTypeClasses(type: ArkToastType, richColors: boolean): string {
    if (!richColors) return "";

    if (type === "success") return "ark:border-success-border/60 ark:bg-success-soft ark:text-success-soft-fg";
    if (type === "info") return "ark:border-info-border/60 ark:bg-info-soft ark:text-info-soft-fg";
    if (type === "warning") return "ark:border-warning-border/60 ark:bg-warning-soft ark:text-warning-soft-fg";
    if (type === "error") return "ark:border-danger-border/60 ark:bg-danger-soft ark:text-danger-soft-fg";
    if (type === "loading") return "ark:border-info-border/60 ark:bg-info-soft ark:text-info-soft-fg";

    return "";
  }

  private getToastIcon(type: ArkToastType): string {
    if (type === "success") return "✓";
    if (type === "info") return "i";
    if (type === "warning") return "!";
    if (type === "error") return "x";
    if (type === "loading") return "...";
    return "•";
  }

  private build(): void {
    if (!this.root) {
      this.root = document.createElement("div");
      this.root.setAttribute("part", "stack");
      this.root.setAttribute("popover", "manual");
      this.appendChild(this.root);
    }

    this.render();
  }

  // Incremental: os cards da lista ficam onde estão (recriar um card focado jogaria o foco do teclado no body e
  // o leitor de tela perderia o toast que estava lendo, e um card em saída perderia a animação), os que saíram da
  // lista vão embora e só os novos são criados, cada um na posição da lista (o mais novo no topo).
  private render(): void {
    if (!this.root) return;

    const palette = this.getPalette();
    this.root.className = `${palette.stack} ${this.getPositionClasses(this.getPosition())}`;
    applyTestHooks(this, "toaster", this.root);
    this.syncPopover();

    // Até max-visible cards; o excedente (os mais antigos) espera na fila com o relógio parado e entra quando um sai.
    const visible = this.toasts.slice(0, this.getMaxVisible());
    const activeIds = new Set(visible.map((toast) => toast.id));
    for (const toast of this.toasts) {
      if (!activeIds.has(toast.id)) {
        this.clearTimer(toast.id);
      } else if (!this.timers.has(toast.id) && !this.exiting.has(toast.id)) {
        this.scheduleDismiss(toast);
      }
    }
    for (const id of this.entered) {
      if (!activeIds.has(id)) this.entered.delete(id);
    }

    const existing = new Map<string, HTMLElement>();
    for (const card of Array.from(this.root.querySelectorAll<HTMLElement>("[data-toast-id]"))) {
      const id = card.dataset.toastId ?? "";
      if (activeIds.has(id)) {
        existing.set(id, card);
      } else {
        card.remove();
      }
    }

    // Do mais antigo (fim da pilha) ao mais novo: um card novo entra antes do card do toast seguinte na lista.
    let next: HTMLElement | null = null;
    for (let index = visible.length - 1; index >= 0; index--) {
      const toast = visible[index];
      let card = existing.get(toast.id);
      if (!card) {
        card = this.buildCard(toast, palette);
        this.root.insertBefore(card, next);
        if (!this.entered.has(toast.id)) {
          this.entered.add(toast.id);
          arkEnter(card, this.getEnterPreset());
        }
      }
      next = card;
    }
  }

  private buildCard(toast: ArkToastItem, palette: ArkToasterPalette): HTMLElement {
    const card = document.createElement("section");
    card.setAttribute("part", "toast");
    card.dataset.toastId = toast.id;
    // Cada card compartilha o hook "toaster-toast"; desambigue via data-toast-id.
    applyTestHooks(this, "toaster", card, "toast");
    card.className = `${palette.toastBase} ${this.getToastTypeClasses(toast.type, this.hasRichColors())}`.trim();

    const row = document.createElement("div");
    row.className = "ark:flex ark:items-start ark:gap-3";

    const icon = document.createElement("span");
    icon.className = `${palette.icon} ark:mt-0.5 ark:inline-flex ark:h-5 ark:w-5 ark:items-center ark:justify-center ark:rounded-full ark:border ark:border-current/20`;
    icon.textContent = this.getToastIcon(toast.type);

    const content = document.createElement("div");
    content.className = "ark:min-w-0 ark:flex-1";

    const title = document.createElement("h4");
    title.className = palette.title;
    applyTestHooks(this, "toaster", title, "toast-title");
    title.textContent = toast.title;
    content.appendChild(title);

    if (toast.description) {
      const description = document.createElement("p");
      description.className = palette.description;
      applyTestHooks(this, "toaster", description, "toast-description");
      description.textContent = toast.description;
      content.appendChild(description);
    }

    row.appendChild(icon);
    row.appendChild(content);

    if (this.hasCloseButton()) {
      const close = document.createElement("button");
      close.type = "button";
      close.className = palette.closeButton;
      applyTestHooks(this, "toaster", close, "toast-close");
      close.textContent = this.getCloseLabel();
      close.addEventListener("click", () => this.dismiss(toast.id));
      row.appendChild(close);
    }

    card.appendChild(row);

    if (toast.actionLabel || toast.cancelLabel) {
      const actions = document.createElement("div");
      actions.className = "ark:mt-3 ark:flex ark:items-center ark:justify-end ark:gap-2";

      if (toast.cancelLabel) {
        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.className = palette.cancelButton;
        applyTestHooks(this, "toaster", cancel, "toast-cancel");
        cancel.textContent = toast.cancelLabel;
        cancel.addEventListener("click", () => this.dismiss(toast.id));
        actions.appendChild(cancel);
      }

      if (toast.actionLabel) {
        const action = document.createElement("button");
        action.type = "button";
        action.className = palette.actionButton;
        applyTestHooks(this, "toaster", action, "toast-action");
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

    return card;
  }
}

export default ArkToaster;
