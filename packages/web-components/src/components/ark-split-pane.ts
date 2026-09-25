import { type ArkLocale, type ArkSplitPaneDirection, resolveLocale } from "@tooark/core";
import { HTMLElementBase } from "./html-element-base";
import { applyTestHooks } from "./test-hooks";

/** Passo das setas em pontos percentuais; com Shift, o grande. */
const STEP = 2;
const BIG_STEP = 10;

type Drag = {
  handle: number;
  pointerId: number;
  start: number;
  sizes: number[];
  space: number;
};

/**
 * Painéis redimensionáveis. Os filhos do usuário são os painéis e ficam onde
 * estão; as alças são nós próprios acrescentados ao FIM do host (marcados
 * `data-ark-chrome`), nunca intercalados. O host é uma grid cujas faixas vêm
 * de `sizes` (painel, alça, painel...): cada alça recebe a coluna/linha
 * explícita e os painéis se auto-posicionam nas faixas restantes na ordem do
 * DOM, sem que o componente os toque (`data-min`/`data-max` só são lidos).
 * Alças são `role="separator"` focáveis: setas redimensionam por teclado e o
 * arrasto usa pointer capture. `sizes` é a fonte da verdade (o atributo é
 * reescrito a cada mudança) e `ark-resize` publica os tamanhos; persistir é
 * do app. Nada anima: redimensionar é interação de alta frequência.
 */
export class ArkSplitPane extends HTMLElementBase {
  static readonly tagName = "ark-split-pane";

  private handles: HTMLDivElement[] = [];
  private observer: MutationObserver | null = null;
  private ownClasses: string[] = [];
  private syncingClass = false;
  private drag: Drag | null = null;

  static get observedAttributes(): string[] {
    return ["direction", "sizes", "lang", "locale-json", "theme", "class", "testid"];
  }

  connectedCallback(): void {
    if (!this.observer) {
      // Painéis que entram ou saem mudam o número de alças e a distribuição.
      this.observer = new MutationObserver(() => this.updateAppearance());
      this.observer.observe(this, { childList: true });
    }
    this.updateAppearance();
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  attributeChangedCallback(name: string): void {
    if (name === "class") {
      if (!this.syncingClass) this.applyOwnClasses(this.ownClasses);
      return;
    }
    if (!this.isConnected) return;
    this.updateAppearance();
  }

  /** Eixo dos painéis. Padrão: "horizontal" (lado a lado). */
  get direction(): ArkSplitPaneDirection {
    return (this.getAttribute("direction") || "").toLowerCase() === "vertical" ? "vertical" : "horizontal";
  }

  set direction(value: ArkSplitPaneDirection) {
    this.setAttribute("direction", value);
  }

  /** Tamanhos dos painéis em percentuais que somam 100, na ordem do DOM (faltantes são distribuídos). */
  get sizes(): number[] {
    return this.normalizedSizes(this.panels().length);
  }

  set sizes(value: number[] | string) {
    // React 19 e Vue entregam aqui a string do atributo ("30,70") quando a prop vem do wrapper.
    this.setAttribute("sizes", typeof value === "string" ? value : value.map((size) => String(size)).join(","));
  }

  // --- Painéis e medidas ---

  /** Os filhos do usuário: tudo que não é chrome do componente. */
  private panels(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && !child.hasAttribute("data-ark-chrome")
    );
  }

  // Lê `sizes`, completa o que falta em partes iguais e normaliza para somar 100.
  private normalizedSizes(count: number): number[] {
    if (count === 0) return [];
    const raw = (this.getAttribute("sizes") || "")
      .split(",")
      .map((part) => Number(part.trim().replace("%", "")))
      .filter((size) => Number.isFinite(size) && size >= 0);
    const sizes = raw.slice(0, count);
    const missing = count - sizes.length;
    if (missing > 0) {
      const used = sizes.reduce((sum, size) => sum + size, 0);
      const rest = sizes.length > 0 && used < 100 ? 100 - used : 100;
      const each = sizes.length > 0 && used < 100 ? rest / missing : 100 / count;
      if (sizes.length > 0 && used >= 100)
        for (let i = 0; i < sizes.length; i += 1) sizes[i] = ((sizes[i] / used) * 100 * (count - missing)) / count;
      for (let i = 0; i < missing; i += 1) sizes.push(each);
    }
    const total = sizes.reduce((sum, size) => sum + size, 0) || 1;
    return sizes.map((size) => (size / total) * 100);
  }

  /** Espaço em px ocupado pelos painéis no eixo (o host menos as alças). */
  private panelSpace(): number {
    const horizontal = this.direction === "horizontal";
    const total = horizontal ? this.clientWidth : this.clientHeight;
    const handleSize = this.handles.reduce(
      (sum, handle) => sum + (horizontal ? handle.offsetWidth : handle.offsetHeight),
      0
    );
    return Math.max(0, total - handleSize);
  }

  // `data-min`/`data-max` do painel em percentual: número ou "N%" é percentual, "Npx" é convertido pelo espaço.
  private constraint(panel: HTMLElement, name: "min" | "max", space: number): number {
    const raw = (panel.dataset[name] || "").trim();
    const fallback = name === "min" ? 0 : 100;
    if (!raw) return fallback;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return fallback;
    if (raw.endsWith("px")) return space > 0 ? (value / space) * 100 : fallback;
    return Math.min(100, Math.max(0, value));
  }

  // --- Redimensionamento ---

  /** Move a alça `index` para que o painel anterior fique com `wanted`%, respeitando min/max do par. */
  private resizePair(index: number, wanted: number, sizes: number[], space: number): number[] {
    const panels = this.panels();
    const a = panels[index];
    const b = panels[index + 1];
    if (!a || !b) return sizes;
    const pair = sizes[index] + sizes[index + 1];
    const min = Math.max(this.constraint(a, "min", space), pair - this.constraint(b, "max", space));
    const max = Math.min(this.constraint(a, "max", space), pair - this.constraint(b, "min", space));
    const next = sizes.slice();
    next[index] = Math.min(Math.max(wanted, min), Math.max(min, max));
    next[index + 1] = pair - next[index];
    return next;
  }

  private commit(next: number[]): void {
    const current = this.sizes;
    if (next.every((size, index) => Math.abs(size - current[index]) < 0.001)) return;
    this.setAttribute("sizes", next.map((size) => size.toFixed(2).replace(/\.?0+$/, "")).join(","));
    this.dispatchEvent(new CustomEvent("ark-resize", { detail: { sizes: this.sizes }, bubbles: true, composed: true }));
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    const handle = event.currentTarget as HTMLDivElement;
    const index = this.handles.indexOf(handle);
    if (index < 0) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.focus();
    this.drag = {
      handle: index,
      pointerId: event.pointerId,
      start: this.direction === "horizontal" ? event.clientX : event.clientY,
      sizes: this.sizes,
      space: this.panelSpace()
    };
    this.setAttribute("data-ark-dragging", "");
    handle.setAttribute("data-ark-active", "");
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId || drag.space === 0) return;
    const position = this.direction === "horizontal" ? event.clientX : event.clientY;
    const delta = ((position - drag.start) / drag.space) * 100;
    this.commit(this.resizePair(drag.handle, drag.sizes[drag.handle] + delta, drag.sizes, drag.space));
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.drag = null;
    this.removeAttribute("data-ark-dragging");
    const handle = event.currentTarget as HTMLDivElement;
    handle.removeAttribute("data-ark-active");
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  };

  // Setas no eixo redimensionam (Shift acelera); Home/End levam o painel anterior ao mínimo/máximo.
  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const handle = event.currentTarget as HTMLDivElement;
    const index = this.handles.indexOf(handle);
    if (index < 0) return;
    const horizontal = this.direction === "horizontal";
    const decrease = horizontal ? "ArrowLeft" : "ArrowUp";
    const increase = horizontal ? "ArrowRight" : "ArrowDown";
    const sizes = this.sizes;
    const space = this.panelSpace();
    const step = event.shiftKey ? BIG_STEP : STEP;
    let wanted: number | null = null;
    if (event.key === decrease) wanted = sizes[index] - step;
    else if (event.key === increase) wanted = sizes[index] + step;
    else if (event.key === "Home") wanted = 0;
    else if (event.key === "End") wanted = 100;
    if (wanted === null) return;
    event.preventDefault();
    this.commit(this.resizePair(index, wanted, sizes, space));
  };

  // --- Aparência ---

  private getLocale(): ArkLocale {
    return resolveLocale(this.getAttribute("lang") || "en", this.getAttribute("locale-json") || undefined);
  }

  // Uma alça a menos que painéis, sempre ao fim do host: um painel que o usuário acrescenta depois entra
  // atrás das alças existentes, então elas são reencaixadas no fim (nós próprios podem se mover).
  private syncHandles(count: number): void {
    while (this.handles.length > count) this.handles.pop()?.remove();
    if (this.handles.length > 0 && this.handles[0] !== this.children[this.children.length - this.handles.length]) {
      this.append(...this.handles);
    }
    while (this.handles.length < count) {
      const handle = document.createElement("div");
      handle.setAttribute("data-ark-chrome", "handle");
      handle.setAttribute("role", "separator");
      handle.tabIndex = 0;
      const line = document.createElement("span");
      line.setAttribute("aria-hidden", "true");
      const grip = document.createElement("span");
      grip.setAttribute("aria-hidden", "true");
      handle.append(line, grip);
      handle.addEventListener("pointerdown", this.handlePointerDown);
      handle.addEventListener("pointermove", this.handlePointerMove);
      handle.addEventListener("pointerup", this.handlePointerUp);
      handle.addEventListener("pointercancel", this.handlePointerUp);
      handle.addEventListener("keydown", this.handleKeydown);
      this.appendChild(handle);
      this.handles.push(handle);
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
    const panels = this.panels();
    const horizontal = this.direction === "horizontal";
    const sizes = this.normalizedSizes(panels.length);
    const locale = this.getLocale();

    this.syncHandles(Math.max(0, panels.length - 1));
    this.setAttribute("data-ark-direction", this.direction);
    this.applyOwnClasses(["ark:min-h-0", "ark:min-w-0"]);

    // Faixas: painel, alça, painel... (fr para os painéis, a largura da alça para as alças).
    const tracks = sizes.map((size) => `minmax(0, ${size}fr)`).join(" var(--ark-split-pane-handle, 0.375rem) ");
    if (horizontal) {
      this.style.gridTemplateColumns = tracks;
      this.style.gridTemplateRows = "minmax(0, 1fr)";
    } else {
      this.style.gridTemplateRows = tracks;
      this.style.gridTemplateColumns = "minmax(0, 1fr)";
    }

    const space = this.panelSpace();
    this.handles.forEach((handle, index) => {
      const track = String(index * 2 + 2);
      handle.style.gridColumn = horizontal ? track : "1";
      handle.style.gridRow = horizontal ? "1" : track;
      handle.setAttribute("aria-orientation", horizontal ? "vertical" : "horizontal");
      handle.setAttribute("aria-label", locale.resize);
      const a = panels[index];
      const b = panels[index + 1];
      const pair = sizes[index] + sizes[index + 1];
      const min = a && b ? Math.max(this.constraint(a, "min", space), pair - this.constraint(b, "max", space)) : 0;
      const max = a && b ? Math.min(this.constraint(a, "max", space), pair - this.constraint(b, "min", space)) : 100;
      handle.setAttribute("aria-valuemin", String(Math.round(min)));
      handle.setAttribute("aria-valuemax", String(Math.round(Math.max(min, max))));
      handle.setAttribute("aria-valuenow", String(Math.round(sizes[index])));
      // A faixa inteira é a área de arrasto: divisor de 1px ao fundo e um pegador no meio, que ganha a cor
      // primary com hover/foco (e a faixa, o tint soft) para a alça ser reconhecível sem ser pesada.
      handle.className = [
        "ark:group ark:relative ark:flex ark:shrink-0 ark:items-center ark:justify-center ark:outline-none ark:select-none ark:touch-none ark:transition-colors ark:duration-(--ark-duration-quick) ark:hover:bg-primary-soft ark:focus-visible:bg-primary-soft ark:data-[ark-active]:bg-primary-soft",
        horizontal ? "ark:cursor-col-resize" : "ark:cursor-row-resize"
      ].join(" ");
      handle.toggleAttribute("data-ark-active", this.drag?.handle === index);
      const line = handle.firstElementChild as HTMLSpanElement | null;
      if (line) {
        line.className = [
          "ark:pointer-events-none ark:absolute ark:bg-border-strong",
          horizontal
            ? "ark:inset-y-0 ark:left-1/2 ark:w-px ark:-translate-x-1/2"
            : "ark:inset-x-0 ark:top-1/2 ark:h-px ark:-translate-y-1/2"
        ].join(" ");
      }
      const grip = handle.lastElementChild as HTMLSpanElement | null;
      if (grip && grip !== line) {
        grip.className = [
          "ark:pointer-events-none ark:relative ark:rounded-full ark:bg-border-strong ark:group-hover:bg-primary ark:group-focus-visible:bg-primary ark:group-data-[ark-active]:bg-primary",
          horizontal ? "ark:h-8 ark:w-1" : "ark:h-1 ark:w-8"
        ].join(" ");
      }
      applyTestHooks(this, "split-pane", handle, "handle");
    });

    applyTestHooks(this, "split-pane", this);
  }
}

export default ArkSplitPane;
