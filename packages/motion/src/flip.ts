import { prefersReducedMotion } from "@tooark/core";
import { animate } from "motion";
import { resolveTargets } from "./internal";
import type { ArkFlipOptions, ArkMotionTargets } from "./types";

/**
 * Animação FLIP: mede a posição dos elementos, aplica a mutação de DOM (reordenar, inserir, filtrar) e anima cada
 * item da posição antiga para a nova com física de spring. Resolve quando todas as animações terminam; com movimento
 * reduzido só aplica a mutação.
 */
export async function arkFlip(
  targets: ArkMotionTargets,
  mutate: () => void,
  options: ArkFlipOptions = {}
): Promise<void> {
  // Resolve os elementos alvo da animação.
  const elements = resolveTargets(targets);

  // Se não houver elementos ou se o usuário preferir animações reduzidas, aplica a mutação e retorna.
  if (elements.length === 0 || prefersReducedMotion()) {
    mutate();
    return;
  }

  // Mapa para armazenar a posição inicial de cada elemento.
  const first = new Map<HTMLElement, DOMRect>();

  // Captura a posição inicial de cada elemento.
  for (const el of elements) {
    first.set(el, el.getBoundingClientRect());
  }

  // Aplica a mutação de DOM para que possamos medir a nova posição dos elementos.
  mutate();

  // Captura a posição final de cada elemento após a mutação.
  const animations: Array<Promise<unknown>> = [];

  // Itera sobre cada elemento para calcular a diferença de posição e criar as animações.
  for (const el of elements) {
    // Pega a posição inicial do elemento antes da mutação.
    const before = first.get(el);

    // Se não houver posição inicial ou o elemento não estiver mais conectado ao DOM, pula a animação.
    if (!before || !el.isConnected) {
      continue;
    }

    // Captura a posição final do elemento após a mutação.
    const after = el.getBoundingClientRect();

    // Calcula a diferença de posição entre a posição inicial e final.
    const dx = before.left - after.left;
    const dy = before.top - after.top;

    // Se não houver diferença de posição, pula a animação.
    if (dx === 0 && dy === 0) {
      continue;
    }

    // Cria os keyframes para a animação com base na diferença de posição.
    const keyframes: Record<string, [number, number]> = {};

    // Adiciona os keyframes apenas se houver diferença de posição em x ou y.
    if (dx !== 0) {
      keyframes.x = [dx, 0];
    }
    if (dy !== 0) {
      keyframes.y = [dy, 0];
    }

    // Adiciona a animação à lista de animações a serem aguardadas.
    animations.push(
      Promise.resolve(
        animate(el, keyframes, {
          type: "spring",
          stiffness: options.stiffness ?? 350,
          damping: options.damping ?? 32
        })
      )
    );
  }

  // Aguarda todas as animações terminarem antes de continuar.
  await Promise.all(animations);
}
