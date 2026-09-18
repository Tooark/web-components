// Abertura e fechamento animados de um host com atributo `popover`: a Popover
// API dá top layer e ::backdrop; arkEnter/arkExit dão o motion pelos tokens.

import { arkEnter, arkExit } from "../motion/animate";
import type { ArkMotionOptions, ArkMotionPreset } from "../motion/types";

// Saídas em andamento por host: uma reabertura no meio da animação invalida o hidePopover() pendente.
const closing = new WeakMap<HTMLElement, object>();

/** Indica se o host está aberto como popover (no top layer). `false` sem suporte à Popover API. */
export function isPopoverOpen(host: Element): boolean {
  try {
    return host.matches(":popover-open");
  } catch {
    return false;
  }
}

function cancelAnimations(host: HTMLElement): void {
  if (typeof host.getAnimations !== "function") return;
  for (const animation of host.getAnimations()) animation.cancel();
}

/**
 * Mostra o host como popover (top layer) e anima a entrada com `arkEnter`; resolve ao fim da entrada, imediato
 * com movimento reduzido. O host precisa do atributo `popover` e de estar conectado. Uma saída ainda em curso é
 * cancelada. Sem suporte à Popover API só anima.
 */
export function openPopover(
  host: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  closing.delete(host);
  // A saída anterior fica com fill forwards (opacidade 0) até ser cancelada.
  cancelAnimations(host);

  if (!isPopoverOpen(host) && typeof host.showPopover === "function") {
    try {
      host.showPopover();
    } catch {
      // Já aberto ou desconectado: nada a fazer.
    }
  }

  return arkEnter(host, preset, options);
}

/**
 * Anima a saída com `arkExit` e só então tira o host do top layer com `hidePopover()`, para a animação rodar
 * visível; resolve depois de escondido. Se `openPopover` for chamado no meio, a saída é abandonada e o host
 * continua aberto.
 */
export function closePopover(
  host: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  const token = {};
  closing.set(host, token);

  return arkExit(host, preset, options).then(() => {
    if (closing.get(host) !== token) return;
    closing.delete(host);

    if (isPopoverOpen(host) && typeof host.hidePopover === "function") {
      try {
        host.hidePopover();
      } catch {
        // Já escondido ou desconectado: nada a fazer.
      }
    }
  });
}
