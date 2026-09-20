import { prefersReducedMotion } from "@tooark/core";
import { inView } from "motion";
import { resolveTargets } from "./internal";
import { arkStaggerEnter } from "./stagger";
import type { ArkMotionTargets, ArkRevealOptions } from "./types";

/**
 * Scroll reveal: esconde os alvos e anima a entrada quando cada um aparece
 * na viewport. Retorna uma função de cleanup que para a observação.
 * @param targets Os elementos a serem observados.
 * @param options As opções de configuração do reveal.
 * @returns Uma função de cleanup que para a observação dos elementos.
 */
export function arkReveal(targets: ArkMotionTargets, options: ArkRevealOptions = {}): () => void {
  // Resolve os elementos de destino para garantir que estamos lidando com uma lista de elementos.
  const elements = resolveTargets(targets);

  // Retorna imediatamente se não houver elementos para observar ou se o usuário preferir animações reduzidas.
  if (elements.length === 0 || prefersReducedMotion()) {
    return () => undefined;
  }

  // Define se a animação deve ocorrer apenas uma vez.
  const once = options.once ?? true;
  const stops: Array<() => void> = [];

  // Inicializa a lista de funções de cleanup para cada elemento observado.
  for (const el of elements) {
    el.style.opacity = "0";
    el.style.willChange = "opacity, transform";

    // Configura a observação do elemento usando a função inView. O `once` é do próprio inView: sem cleanup
    // devolvido ele para de observar o elemento depois da primeira entrada, então o callback não roda de novo.
    const stop = inView(
      el,
      () => {
        el.style.opacity = "";
        void arkStaggerEnter([el], { ...options, interval: 0 });

        if (!once) {
          // Cleanup ao sair da viewport: re-esconde para animar de novo
          return () => {
            el.style.opacity = "0";
          };
        }
        return undefined;
      },
      { amount: options.amount ?? 0.25, margin: options.margin as never }
    );

    // Adiciona a função de cleanup do elemento à lista de stops.
    stops.push(stop);
  }

  // Retorna uma função de cleanup que chama todas as funções de stop armazenadas.
  return () => {
    for (const stop of stops) stop();
  };
}
