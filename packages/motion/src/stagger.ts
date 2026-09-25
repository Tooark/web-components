import { prefersReducedMotion } from "@tooark/core";
import { animate, stagger } from "motion";
import { hiddenOffset, resolveDistancePx, resolveDurationSec, resolveEase, resolveTargets } from "./internal";
import type { ArkMotionTargets, ArkStaggerOptions } from "./types";

/**
 * Entrada escalonada de uma lista de elementos usando os motion tokens.
 * Resolve quando todos os itens terminam (imediatamente com reduced motion).
 * @param targets Os elementos a serem animados.
 * @param options As opções de configuração do stagger.
 * @returns Uma Promise que resolve quando todos os itens terminam a animação.
 */
export async function arkStaggerEnter(targets: ArkMotionTargets, options: ArkStaggerOptions = {}): Promise<void> {
  // Resolve os elementos de destino para garantir que estamos lidando com uma lista de elementos.
  const elements = resolveTargets(targets);

  // Retorna imediatamente se não houver elementos para animar.
  if (elements.length === 0) {
    return;
  }

  // Retorna imediatamente se o usuário preferir animações reduzidas.
  if (prefersReducedMotion()) {
    // Remove qualquer estilo de opacidade e transformação aplicado anteriormente.
    for (const el of elements) {
      el.style.opacity = "";
      el.style.transform = "";
    }

    return;
  }

  // Determina o preset de animação, a distância em pixels e o deslocamento inicial com base no preset.
  const preset = options.preset ?? "slide-up";
  const distancePx = resolveDistancePx(elements[0], options.distance);
  const offset = hiddenOffset(preset, distancePx);

  // Cria os keyframes iniciais para a animação com base no deslocamento calculado.
  const keyframes: Record<string, [number, number]> = { opacity: [0, 1] };

  // Adiciona os keyframes de transformação com base no deslocamento calculado.
  if (offset.x !== undefined) {
    keyframes.x = [offset.x, 0];
  }
  if (offset.y !== undefined) {
    keyframes.y = [offset.y, 0];
  }
  if (offset.scale !== undefined) {
    keyframes.scale = [offset.scale, 1];
  }

  // Aplica a animação aos elementos com os keyframes e as opções de stagger.
  await animate(elements, keyframes, {
    duration: resolveDurationSec(elements[0], options.duration, "default"),
    ease: resolveEase(elements[0], options.ease) as never,
    delay: stagger((options.interval ?? 60) / 1000, { from: options.from ?? "first" })
  });
}
