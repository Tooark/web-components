// Focus trap para overlays modais abertos pela Popover API, que não aplica
// `inert` ao resto da página: o trap cobre teclado e ponteiro no lugar dele.

import { canHoldFocus, focusableElements } from "./focusable";
import { isPopoverClosing } from "./popover";

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
  container: HTMLElement;
  activate(): void;
  pause(): void;
  /** Traz o foco para dentro: o último elemento focado, senão `initial`, senão o container. */
  restore(): void;
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

// Para onde o foco de cada container volta. O `returnTo` de um overlay pode estar em outro que fechou antes dele (um
// diálogo trocado por outro): a devolução sobe por aqui até achar um elemento que ainda aceite o foco.
const returns = new WeakMap<HTMLElement, HTMLElement | null>();

/** Limite da subida pela cadeia de `returnTo`, contra um ciclo entre dois overlays que se abrem um ao outro. */
const MAX_RETURN_HOPS = 8;

/** O alvo está num popover na saída do `closePopover`: ainda `:popover-open`, só até a animação acabar. */
function isInsideClosingPopover(target: Element): boolean {
  try {
    for (
      let host = target.closest(":popover-open");
      host;
      host = host.parentElement?.closest(":popover-open") ?? null
    ) {
      if (isPopoverClosing(host)) return true;
    }
  } catch {
    // Sem :popover-open no navegador não há saída em curso para considerar.
  }
  return false;
}

/**
 * O alvo está num popover aberto por cima do container. Com `leaving: false`, um popover na saída do `closePopover`
 * (ainda `:popover-open` até a animação acabar) não conta: é a regra do foco, que não pode ficar num painel que some.
 */
function isInsideOpenPopover(target: Element, leaving = true): boolean {
  try {
    if (!target.closest(":popover-open")) return false;
  } catch {
    // Sem :popover-open no navegador não há top layer para considerar.
    return false;
  }
  return leaving || !isInsideClosingPopover(target);
}

/**
 * Prende o foco em `container` enquanto um overlay modal está aberto e devolve a função que o libera. A Popover
 * API não aplica `inert` ao resto da página, então o trap cobre o que `inert` cobriria: Tab e Shift+Tab ciclam
 * entre os focáveis do container, foco que escapa volta para onde estava (o último elemento focado no container; se
 * ele saiu, `initial`; se ele não aceita o foco agora, ou sem nenhum dos dois, o próprio container), e eventos de
 * ponteiro iniciados fora são cancelados na captura antes de chegar ao alvo (e reportados em `onOutsidePointer`).
 * Popovers abertos por cima (menu, tooltip, toaster) ficam fora do trap: são o próprio overlay em uso; um que está na
 * saída do `closePopover` ainda recebe o ponteiro, mas já não segura o foco. Traps aninhados empilham: só o mais
 * recente escuta, e o container de um trap de baixo (o diálogo que abriu este) não conta como popover por cima, nem
 * para o foco nem para o ponteiro. O foco que cai no body porque o elemento focado deixou de aceitá-lo (saiu da
 * página, ficou `disabled`, entrou em `inert`, deixou de ser desenhado) vai para o container, nunca para outro
 * controle; se o elemento estava num popover por cima (um botão de toast), volta para onde estava.
 *
 * Ao liberar, o foco volta a `returnTo` num microtask, e só se ainda estiver no container ou sem dono (`body`): um
 * framework que refoca ao fim da própria atualização o elemento focado antes dela (o React, a cada commit) desfaria
 * uma devolução síncrona, e o app que levou o foco a outro lugar de propósito fica com a escolha dele. Se `returnTo`
 * já não aceita o foco (está num overlay que fechou, ou é o painel dele, ou saiu da página), vale o `returnTo` do trap
 * desse overlay; um `returnTo` no body conta como nenhum. No-op sem DOM.
 */
export function trapFocus(container: HTMLElement, options: ArkFocusTrapOptions = {}): () => void {
  if (typeof document === "undefined") return () => undefined;

  const doc = container.ownerDocument;
  // Um `returnTo` no body é o mesmo que nenhum: é onde o foco estava quando nada o tinha (o botão que abriu este overlay
  // ficou `disabled` no mesmo passo). Vale então o elemento focado agora, se está fora do container: o trap do overlay
  // que fechou nesse passo já devolveu o foco a quem o tinha aberto.
  const held = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
  const outside = container.contains(held) ? null : held;
  const returnTo = options.returnTo === doc.body ? outside : (options.returnTo ?? held);

  // O container de outro trap da pilha é um popover aberto, mas está embaixo deste: sem esta regra o diálogo que
  // abriu outro continuava recebendo o foco e os cliques com o de cima aberto.
  const isBelow = (target: Node): boolean => stack.some((other) => other !== trap && other.container.contains(target));

  // `leaving`: um popover em saída ainda conta como dono do alvo. Vale para o ponteiro (o segundo clique de um duplo
  // clique no botão de um diálogo que fecha não é um clique no scrim do de baixo) e não vale para o foco.
  const owns = (target: EventTarget | null, leaving: boolean): boolean =>
    target instanceof Node &&
    (target === container ||
      container.contains(target) ||
      (target instanceof Element && !isBelow(target) && isInsideOpenPopover(target, leaving)));

  const focusContainer = (): void => {
    if (!container.hasAttribute("tabindex")) container.setAttribute("tabindex", "-1");
    container.focus();
  };

  // Último elemento do container que teve o foco: é para onde o foco volta quando escapa.
  let lastFocused: HTMLElement | null = null;

  // Foca um elemento do container e diz se o foco ficou lá dentro: `focus()` não faz nada num elemento desabilitado
  // ou sem caixa, e nesse caso nenhum focusin avisaria que o foco continua fora.
  const tryFocus = (el: HTMLElement | null | undefined): boolean => {
    if (!el || el === container || !container.contains(el)) return false;
    el.focus();
    return container.contains(doc.activeElement);
  };

  // O foco volta para onde estava, e não para o primeiro focável do DOM: quem devolve o foco ao opener depois de o
  // overlay abrir (o React refoca, ao fim do commit, o elemento focado antes dele; um menu que fecha; o próprio app)
  // tirava o foco do campo escolhido e ele terminava no botão de fechar do cabeçalho. Um último focado que continua no
  // container mas não aceita o foco agora (o campo desabilitado durante um envio, com uma confirmação fechando por
  // cima) deixa o foco no painel: no botão de fechar, o Enter seguinte fechava o diálogo.
  const focusInside = (): void => {
    if (tryFocus(lastFocused)) return;
    if (!container.contains(lastFocused) && tryFocus(options.initial)) return;
    focusContainer();
  };

  // Tab e Shift+Tab ciclam; com o foco no container (ou fora) Tab vai ao primeiro e Shift+Tab ao último.
  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    const active = doc.activeElement;
    // Foco num popover aberto por cima (um menu do próprio overlay): o Tab é dele.
    if (active instanceof Element && !container.contains(active) && owns(active, false)) return;

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
    const target = event.target;
    if (target instanceof HTMLElement && target !== container && container.contains(target)) {
      lastFocused = target;
      return;
    }
    if (!owns(target, false)) focusInside();
  };

  // O elemento focado deixou de aceitar o foco com o trap ativo: saiu da página ou deixou de ser desenhado (o botão
  // "remover" de uma linha que some com ela), ficou `disabled` (um campo durante o envio, um `<fieldset disabled>`),
  // entrou num `inert`, ou perdeu o que o tornava focável. O navegador põe o foco no body, onde o teclado fica sem dono
  // e o Esc não chega ao overlay. Nenhum focusin avisa, então a conferência vem do focusout, um microtask depois, e da
  // remoção observada no DOM (o Firefox e o WebKit não disparam focusout quando o elemento focado sai da página). O
  // foco vai para o painel, nunca para outro controle: no botão de fechar ou num campo, o Enter que o usuário repete
  // durante um envio fechava o diálogo ou enviava de novo. Só o de um elemento de fora do container (o botão de um toast,
  // que some com ele) volta para onde estava. Um blur() do app, com o elemento ainda focável, é escolha dele; a janela
  // perdendo o foco não muda o `activeElement`.
  const recover = (target: HTMLElement): void => {
    if (!listening) return;
    const active = doc.activeElement;
    if (active && active !== doc.body) return;
    if (canHoldFocus(target)) return;
    if (target !== lastFocused) {
      focusInside();
      return;
    }
    if (!target.isConnected) lastFocused = null;
    focusContainer();
  };

  const handleFocusOut = (event: FocusEvent): void => {
    const target = event.target;
    if (event.relatedTarget || !(target instanceof HTMLElement)) return;
    queueMicrotask(() => recover(target));
  };

  const removals = new MutationObserver(() => {
    if (lastFocused && !lastFocused.isConnected) recover(lastFocused);
  });

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
    if (owns(event.target, true)) return;
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
    container,
    activate(): void {
      listening = true;
      doc.addEventListener("keydown", handleKeydown, true);
      doc.addEventListener("focusin", handleFocusIn, true);
      doc.addEventListener("focusout", handleFocusOut, true);
      removals.observe(container, { childList: true, subtree: true });
      bindPointer();
    },
    pause(): void {
      listening = false;
      doc.removeEventListener("keydown", handleKeydown, true);
      doc.removeEventListener("focusin", handleFocusIn, true);
      doc.removeEventListener("focusout", handleFocusOut, true);
      removals.disconnect();
      if (!gesture) unbindPointer();
    },
    restore: focusInside
  };

  returns.set(container, returnTo);
  stack[stack.length - 1]?.pause();
  stack.push(trap);
  trap.activate();

  const initial = options.initial;
  if (initial === container) {
    focusContainer();
  } else if (!tryFocus(initial)) {
    const first = focusableElements(container)[0];
    if (first) {
      first.focus();
    } else {
      focusContainer();
    }
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

    // Depois da atualização em curso do framework, e só se o foco não foi levado a outro lugar nesse meio tempo.
    queueMicrotask(() => {
      const active = doc.activeElement;
      if (active && active !== doc.body && !container.contains(active)) return;
      // O container voltou a ter um trap (reaberto no mesmo passo): o foco é dele.
      if (stack.some((other) => other.container === container)) return;
      let target: HTMLElement | null = returnTo;
      for (let hops = 0; target && hops < MAX_RETURN_HOPS; hops++) {
        // O body não é destino: é onde o foco estava quando nada tinha o foco.
        if (target !== doc.body && target.isConnected && !isInsideClosingPopover(target)) {
          target.focus();
          // `contains`: um elemento pode delegar o foco a um filho.
          if (target.contains(doc.activeElement)) return;
        }
        // A busca começa no próprio alvo: quem abriu pode ser o painel de outro overlay (um clique num texto dele foca
        // o host), e começar no pai pulava esse painel.
        let owner: HTMLElement | null = target;
        while (owner && !returns.has(owner)) owner = owner.parentElement;
        target = owner ? (returns.get(owner) ?? null) : null;
      }
      // Ninguém aceitou o foco (quem abriu saiu da página junto com o fechamento). Com outro overlay embaixo o foco
      // vai para ele: no body, com um modal aberto, o teclado ficava sem dono e o Esc não chegava ao diálogo. Sem
      // overlay embaixo fica como no <dialog> nativo, e o app escolhe o destino.
      stack[stack.length - 1]?.restore();
    });
  };
}
