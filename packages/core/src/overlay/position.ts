// Posicionamento ancorado por JS para overlays no top layer (menu, tooltip):
// CSS anchor positioning não é dependência. O painel precisa ser position:
// fixed (o padrão de [popover]); a posição vai em left/top inline.

/** Lado da âncora onde o painel abre. */
export type ArkAnchorSide = "top" | "bottom" | "left" | "right";

/** Alinhamento do painel ao longo do lado escolhido. */
export type ArkAnchorAlign = "start" | "center" | "end";

/** Retângulo em coordenadas da viewport; um ponto é um retângulo de largura e altura zero. */
export type ArkAnchorRect = { x: number; y: number; width: number; height: number };

/** Lado e alinhamento efetivos depois do flip, para transform-origin e setas. */
export type ArkAnchorPlacement = { side: ArkAnchorSide; align: ArkAnchorAlign };

/** Opções de `positionAnchored`. */
export type ArkPositionAnchoredOptions = {
  /** Lado preferido. Padrão: "bottom". */
  side?: ArkAnchorSide;
  /** Alinhamento ao longo do lado. Padrão: "start". */
  align?: ArkAnchorAlign;
  /** Distância entre âncora e painel, em px. Padrão: 4. */
  offset?: number;
  /** Margem mínima até as bordas da viewport, em px. Padrão: 8. */
  padding?: number;
  /** Chamado a cada posicionamento com o lado e o alinhamento efetivos. */
  onPlace?: (placement: ArkAnchorPlacement) => void;
};

const OPPOSITE: Record<ArkAnchorSide, ArkAnchorSide> = { top: "bottom", bottom: "top", left: "right", right: "left" };

function toRect(anchor: Element | ArkAnchorRect): ArkAnchorRect {
  if (anchor instanceof Element) {
    const rect = anchor.getBoundingClientRect();
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
  }
  return anchor;
}

// Quando o painel é maior que a viewport, prevalece a margem inicial.
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function spaceOn(side: ArkAnchorSide, rect: ArkAnchorRect, viewportWidth: number, viewportHeight: number): number {
  if (side === "bottom") return viewportHeight - (rect.y + rect.height);
  if (side === "top") return rect.y;
  if (side === "right") return viewportWidth - (rect.x + rect.width);
  return rect.x;
}

// Na ordem em que o CSSOM serializa (horizontal, vertical), para o valor lido bater com o escrito.
function transformOrigin(side: ArkAnchorSide, align: ArkAnchorAlign): string {
  if (side === "top" || side === "bottom") {
    const horizontal = align === "start" ? "left" : align === "end" ? "right" : "center";
    return `${horizontal} ${side === "bottom" ? "top" : "bottom"}`;
  }
  const vertical = align === "start" ? "top" : align === "end" ? "bottom" : "center";
  return `${side === "right" ? "left" : "right"} ${vertical}`;
}

/**
 * Posiciona `panel` (position: fixed, em geral um popover aberto) junto de `anchor`, a partir de
 * `getBoundingClientRect()`: lado preferido com flip para o oposto quando não cabe e o oposto tem mais espaço,
 * alinhamento ao longo do lado e deslizamento para caber na viewport. Escreve left/top e transform-origin inline
 * e `data-ark-side`/`data-ark-align` no painel, e reposiciona em scroll e resize até o dispose devolvido rodar.
 * Mede o painel por offsetWidth/offsetHeight, então um transform de entrada não entra na conta. No-op sem DOM.
 */
export function positionAnchored(
  panel: HTMLElement,
  anchor: Element | ArkAnchorRect,
  options: ArkPositionAnchoredOptions = {}
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const offset = options.offset ?? 4;
  const padding = options.padding ?? 8;
  const align = options.align ?? "start";

  const place = (): void => {
    const rect = toRect(anchor);
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;

    let side = options.side ?? "bottom";
    const needed = (side === "top" || side === "bottom" ? height : width) + offset + padding;
    const available = spaceOn(side, rect, viewportWidth, viewportHeight);
    if (available < needed && spaceOn(OPPOSITE[side], rect, viewportWidth, viewportHeight) > available) {
      side = OPPOSITE[side];
    }

    let x: number;
    let y: number;
    if (side === "top" || side === "bottom") {
      y = side === "bottom" ? rect.y + rect.height + offset : rect.y - height - offset;
      x =
        align === "start" ? rect.x : align === "end" ? rect.x + rect.width - width : rect.x + (rect.width - width) / 2;
    } else {
      x = side === "right" ? rect.x + rect.width + offset : rect.x - width - offset;
      y =
        align === "start"
          ? rect.y
          : align === "end"
            ? rect.y + rect.height - height
            : rect.y + (rect.height - height) / 2;
    }
    x = clamp(x, padding, viewportWidth - width - padding);
    y = clamp(y, padding, viewportHeight - height - padding);

    panel.style.left = `${Math.round(x)}px`;
    panel.style.top = `${Math.round(y)}px`;
    panel.style.transformOrigin = transformOrigin(side, align);
    panel.setAttribute("data-ark-side", side);
    panel.setAttribute("data-ark-align", align);
    options.onPlace?.({ side, align });
  };

  place();
  window.addEventListener("scroll", place, { capture: true, passive: true });
  window.addEventListener("resize", place);

  return () => {
    window.removeEventListener("scroll", place, true);
    window.removeEventListener("resize", place);
  };
}
