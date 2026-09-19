import { type ArkTooltipSide, coerceBooleanAttr, isPopoverOpen, openPopover, positionAnchored } from "@tooark/core";
import { applyTestHooks } from "./test-hooks";

/** Contador para o id do balão, que o `aria-describedby` do gatilho referencia. */
let tooltipSeq = 0;

/**
 * Dica de contexto. O host envolve o gatilho do usuário (primeiro filho sem
 * `slot`) sem movê-lo e cria o balão: `role="tooltip"` com `popover="manual"`,
 * para escapar de `overflow` e ficar no top layer. O texto vem de `content`;
 * conteúdo rico vem num filho `slot="content"`, que então É o balão (o
 * componente só escreve `popover`, `role`, `id` e o hook nele; o visual vem do
 * components.css). O gatilho recebe `aria-describedby` do balão e precisa ser
 * focável por conta própria.
 *
 * Abre em hover (depois de `delay`) e em foco (na hora); fecha ao sair, ao
 * perder o foco, com Esc e no pointerdown. Posicionado por `positionAnchored`
 * de core, com flip quando não cabe. Entrada `fade` quick, sem saída animada.
 */
export class ArkTooltip extends HTMLElement {
  static readonly tagName = "ark-tooltip";

  private ownClasses: string[] = [];
  private syncingClass = false;
  private observer: MutationObserver | null = null;
  /** Balão criado pelo componente, usado quando não há filho `slot="content"`. */
  private ownBubble: HTMLDivElement | null = null;
  /** Balão em uso: o próprio ou o filho `slot="content"` do usuário. */
  private bubble: HTMLElement | null = null;
  private trigger: HTMLElement | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private disposePosition: (() => void) | null = null;
  private isOpen = false;
  private syncingOpen = false;
  /** Clique em andamento no gatilho: o foco que ele dá não reabre a dica que o pointerdown acabou de dispensar. */
  private pointerPressed = false;
  private readonly bubbleId = `ark-tooltip-${++tooltipSeq}`;

  static get observedAttributes(): string[] {
    return ["content", "side", "delay", "open", "theme", "class", "testid"];
  }

  constructor() {
    super();
    // pointerover/pointerout (não enter/leave) para valer também em eventos sintéticos; relatedTarget filtra
    // movimentos internos, e o balão é filho do host, então passar o ponteiro sobre ele não fecha.
    this.addEventListener("pointerover", this.handlePointerOver);
    this.addEventListener("pointerout", this.handlePointerOut);
    this.addEventListener("pointerdown", this.handlePointerDown);
    this.addEventListener("pointerup", this.handlePointerUp);
    this.addEventListener("pointercancel", this.handlePointerUp);
    this.addEventListener("focusin", this.handleFocusIn);
    this.addEventListener("focusout", this.handleFocusOut);
  }

  connectedCallback(): void {
    if (!this.observer) {
      this.observer = new MutationObserver(() => this.updateAppearance());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
    if (this.hasAttribute("open")) this.show();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.clearTimer();
    document.removeEventListener("keydown", this.handleDocumentKeydown, true);
    this.disposePosition?.();
    this.disposePosition = null;
    this.isOpen = false;
    this.wireTrigger(null);
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;

    if (name === "open") {
      if (this.syncingOpen) return;
      if (this.hasAttribute("open")) {
        this.show();
      } else {
        this.hide();
      }
      return;
    }
    this.updateAppearance();
    if (this.isOpen) this.place();
  }

  /** Aberto (atributo `open`, refletido do estado do balão). */
  get open(): boolean {
    return this.isOpen;
  }

  set open(value: boolean | string | null | undefined) {
    const next = coerceBooleanAttr(value);
    if (next) {
      this.show();
    } else {
      this.hide();
    }
  }

  /** Abre na hora, sem o atraso do hover. */
  show(): void {
    this.clearTimer();
    if (this.isOpen || !this.isConnected) return;
    const bubble = this.bubble;
    if (!bubble || !this.trigger) return;

    this.isOpen = true;
    this.reflectOpen(true);
    void openPopover(bubble, "fade", { duration: "quick" });
    this.place();
    document.addEventListener("keydown", this.handleDocumentKeydown, true);
  }

  /** Fecha na hora, sem animação de saída. */
  hide(): void {
    this.clearTimer();
    if (!this.isOpen) return;

    this.isOpen = false;
    this.reflectOpen(false);
    document.removeEventListener("keydown", this.handleDocumentKeydown, true);
    this.disposePosition?.();
    this.disposePosition = null;

    const bubble = this.bubble;
    if (!bubble) return;
    // Sem saída animada: cancela uma entrada em curso e esconde.
    if (typeof bubble.getAnimations === "function") {
      for (const animation of bubble.getAnimations()) animation.cancel();
    }
    if (isPopoverOpen(bubble)) {
      try {
        bubble.hidePopover();
      } catch {
        // Já escondido: nada a fazer.
      }
    }
  }

  private reflectOpen(open: boolean): void {
    this.syncingOpen = true;
    this.toggleAttribute("open", open);
    this.syncingOpen = false;
  }

  private getDelay(): number {
    const parsed = Number(this.getAttribute("delay") ?? "200");
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 200;
  }

  private getSide(): ArkTooltipSide {
    const side = (this.getAttribute("side") || "").toLowerCase();
    return side === "bottom" || side === "left" || side === "right" ? side : "top";
  }

  private clearTimer(): void {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private scheduleShow(): void {
    if (this.isOpen || this.openTimer !== null) return;
    const delay = this.getDelay();
    if (delay === 0) {
      this.show();
      return;
    }
    this.openTimer = setTimeout(() => {
      this.openTimer = null;
      this.show();
    }, delay);
  }

  private place(): void {
    this.disposePosition?.();
    this.disposePosition = null;
    if (!this.bubble || !this.trigger) return;
    this.disposePosition = positionAnchored(this.bubble, this.trigger, {
      side: this.getSide(),
      align: "center",
      offset: 6
    });
  }

  // --- Interação ---

  private isInside(target: EventTarget | null): boolean {
    return target instanceof Node && this.contains(target);
  }

  private readonly handlePointerOver = (event: PointerEvent): void => {
    if (this.isInside(event.relatedTarget)) return;
    this.scheduleShow();
  };

  private readonly handlePointerOut = (event: PointerEvent): void => {
    if (this.isInside(event.relatedTarget)) return;
    this.hide();
  };

  // Clicar no gatilho dispensa a dica; ela volta só depois de sair e entrar de novo.
  private readonly handlePointerDown = (): void => {
    this.pointerPressed = true;
    this.hide();
  };

  private readonly handlePointerUp = (): void => {
    this.pointerPressed = false;
  };

  private readonly handleFocusIn = (): void => {
    this.clearTimer();
    if (this.pointerPressed) {
      this.pointerPressed = false;
      return;
    }
    this.show();
  };

  private readonly handleFocusOut = (event: FocusEvent): void => {
    if (this.isInside(event.relatedTarget)) return;
    this.hide();
  };

  // Esc dispensa a dica aberta antes de chegar a quem mais escuta (um dialog em volta, por exemplo).
  private readonly handleDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape" || !this.isOpen) return;
    event.stopPropagation();
    this.hide();
  };

  // --- Estrutura ---

  private wireTrigger(next: HTMLElement | null): void {
    const current = this.trigger;
    if (current && (current !== next || !this.bubble)) {
      const ids = (current.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter((id) => id && id !== this.bubbleId);
      if (ids.length > 0) {
        current.setAttribute("aria-describedby", ids.join(" "));
      } else {
        current.removeAttribute("aria-describedby");
      }
    }
    this.trigger = next;
    if (!next || !this.bubble) return;

    // Exceção ARIA das regras transversais: só aria-* no gatilho do usuário.
    const ids = (next.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (!ids.includes(this.bubble.id)) next.setAttribute("aria-describedby", [...ids, this.bubble.id].join(" "));
  }

  // O balão é o filho slot="content" do usuário quando existe; senão o nó próprio, criado com o texto de content.
  private syncBubble(): void {
    const custom = this.querySelector<HTMLElement>(':scope > [slot="content"]');
    const content = this.getAttribute("content");
    let next: HTMLElement | null = null;

    if (custom) {
      this.ownBubble?.remove();
      this.ownBubble = null;
      next = custom;
    } else if (content !== null) {
      if (!this.ownBubble) {
        const bubble = document.createElement("div");
        bubble.setAttribute("data-ark-chrome", "bubble");
        bubble.className = "ark:pointer-events-none";
        this.appendChild(bubble);
        this.ownBubble = bubble;
      }
      this.ownBubble.textContent = content;
      next = this.ownBubble;
    } else {
      this.ownBubble?.remove();
      this.ownBubble = null;
    }

    if (this.bubble && this.bubble !== next) {
      this.hide();
      if (this.bubble !== this.ownBubble) {
        this.bubble.removeAttribute("popover");
        this.bubble.removeAttribute("role");
        if (this.bubble.id === this.bubbleId) this.bubble.removeAttribute("id");
      }
    }
    this.bubble = next;
    if (!next) return;

    if (next.getAttribute("popover") !== "manual") next.setAttribute("popover", "manual");
    next.setAttribute("role", "tooltip");
    if (!next.id) next.id = this.bubbleId;
    applyTestHooks(this, "tooltip", next, "bubble");
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
    this.syncBubble();

    // O gatilho é o primeiro filho do usuário sem slot; os nós do componente ficam de fora.
    const trigger = Array.from(this.children).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.hasAttribute("slot") && !child.hasAttribute("data-ark-chrome")
    );
    this.wireTrigger(trigger ?? null);

    this.applyOwnClasses(["ark:inline-flex"]);
    applyTestHooks(this, "tooltip", this);
  }
}

export default ArkTooltip;
