// Focus trap para overlays modais abertos pela Popover API, que não aplica
// `inert` ao resto da página: o trap cobre teclado e ponteiro no lugar dele.

import { focusableElements } from "./focusable";

/** Opções do focus trap. */
export type ArkFocusTrapOptions = {
  /** Quem recebe o foco ao ativar. Padrão: o primeiro focável do container, ou o próprio container. */
  initial?: HTMLElement | null;
  /** Quem recebe o foco de volta ao liberar. Padrão: o elemento focado no momento da ativação. */
  returnTo?: HTMLElement | null;
  /** Chamado a cada pointerdown iniciado fora do container (o evento já foi cancelado); serve para fechar no scrim. */
  onOutsidePointer?: (event: PointerEvent) => void;
};

type Trap = {
  activate(): void;
  pause(): void;
};

/** Eventos de ponteiro cancelados na captura quando começam fora do container. */
const POINTER_EVENTS = [
  "pointerdown",
  "pointerup",
  "pointercancel",
  "mousedown",
  "mouseup",
  "click",
  "auxclick",
  "contextmenu",
  "touchstart",
  "touchend"
];

/** Eventos que encerram um gesto iniciado fora: depois deles não vem mais nenhum click daquele pointerdown. */
const GESTURE_END = ["click", "auxclick", "contextmenu", "pointercancel"];

// Traps aninhados (dialog que abre dialog): só o do topo escuta; os de baixo pausam até ele ser liberado.
const stack: Trap[] = [];

function isInsideOpenPopover(target: Element): boolean {
  try {
    return target.closest(":popover-open") !== null;
  } catch {
    // Sem :popover-open no navegador não há top layer para considerar.
    return false;
  }
}

/**
 * Prende o foco em `container` enquanto um overlay modal está aberto e devolve a função que o libera. A Popover
 * API não aplica `inert` ao resto da página, então o trap cobre o que `inert` cobriria: Tab e Shift+Tab ciclam
 * entre os focáveis do container, foco que escapa volta, e eventos de ponteiro iniciados fora são cancelados na
 * captura antes de chegar ao alvo (e reportados em `onOutsidePointer`). Popovers abertos por cima (menu, tooltip,
 * toaster) ficam fora do trap: são o próprio overlay em uso. Traps aninhados empilham: só o mais recente escuta.
 * Ao liberar, o foco volta a `returnTo`. No-op sem DOM.
 */
export function trapFocus(container: HTMLElement, options: ArkFocusTrapOptions = {}): () => void {
  if (typeof document === "undefined") return () => undefined;

  const doc = container.ownerDocument;
  const returnTo = options.returnTo ?? (doc.activeElement instanceof HTMLElement ? doc.activeElement : null);

  const owns = (target: EventTarget | null): boolean =>
    target instanceof Node &&
    (target === container || container.contains(target) || (target instanceof Element && isInsideOpenPopover(target)));

  const focusContainer = (): void => {
    if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
    container.focus();
  };

  const focusInside = (): void => {
    const first = focusableElements(container)[0];
    if (first) {
      first.focus();
    } else {
      focusContainer();
    }
  };

  // Tab e Shift+Tab ciclam; com o foco no container (ou fora) Tab vai ao primeiro e Shift+Tab ao último.
  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    const active = doc.activeElement;
    if (active instanceof Element && !container.contains(active) && isInsideOpenPopover(active)) return;

    const list = focusableElements(container);
    if (list.length === 0) {
      event.preventDefault();
      focusContainer();
      return;
    }

    const index = active instanceof HTMLElement ? list.indexOf(active) : -1;
    if (event.shiftKey) {
      if (index <= 0) {
        event.preventDefault();
        list[list.length - 1].focus();
      }
    } else if (index === -1 || index === list.length - 1) {
      event.preventDefault();
      list[0].focus();
    }
  };

  const handleFocusIn = (event: FocusEvent): void => {
    if (!owns(event.target)) focusInside();
  };

  // O ponteiro é solto só no fim do gesto: se o pointerdown fora fechar o overlay (e liberar o trap), o click do
  // mesmo gesto ainda seria entregue ao que está atrás do scrim.
  let listening = false;
  let pointerBound = false;
  let gesture = false;

  const bindPointer = (): void => {
    if (pointerBound) return;
    pointerBound = true;
    for (const type of POINTER_EVENTS) doc.addEventListener(type, handlePointer, { capture: true, passive: false });
  };

  const unbindPointer = (): void => {
    if (!pointerBound) return;
    pointerBound = false;
    for (const type of POINTER_EVENTS) doc.removeEventListener(type, handlePointer, true);
  };

  function handlePointer(event: Event): void {
    if (owns(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "pointerdown") {
      gesture = true;
      options.onOutsidePointer?.(event as PointerEvent);
    } else if (GESTURE_END.includes(event.type)) {
      gesture = false;
      if (!listening) unbindPointer();
    }
  }

  const trap: Trap = {
    activate(): void {
      listening = true;
      doc.addEventListener("keydown", handleKeydown, true);
      doc.addEventListener("focusin", handleFocusIn, true);
      bindPointer();
    },
    pause(): void {
      listening = false;
      doc.removeEventListener("keydown", handleKeydown, true);
      doc.removeEventListener("focusin", handleFocusIn, true);
      if (!gesture) unbindPointer();
    }
  };

  stack[stack.length - 1]?.pause();
  stack.push(trap);
  trap.activate();

  const initial = options.initial;
  if (initial === container) {
    focusContainer();
  } else if (initial && container.contains(initial)) {
    initial.focus();
  } else {
    focusInside();
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    trap.pause();

    const index = stack.indexOf(trap);
    const wasTop = index === stack.length - 1;
    if (index >= 0) stack.splice(index, 1);
    if (wasTop) stack[stack.length - 1]?.activate();

    if (returnTo?.isConnected) returnTo.focus();
  };
}
