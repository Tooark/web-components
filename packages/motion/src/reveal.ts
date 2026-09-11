import { prefersReducedMotion } from "@tooark/core";
import { inView } from "motion";
import { resolveTargets } from "./internal";
import { arkStaggerEnter } from "./stagger";
import type { ArkMotionTargets, ArkRevealOptions } from "./types";

/**
 * Scroll reveal: esconde os alvos e anima a entrada quando cada um aparece
 * na viewport. Retorna uma função de cleanup que para a observação.
 */
export function arkReveal(targets: ArkMotionTargets, options: ArkRevealOptions = {}): () => void {
  const elements = resolveTargets(targets);
  if (elements.length === 0 || prefersReducedMotion()) return () => undefined;

  const once = options.once ?? true;
  const stops: Array<() => void> = [];

  for (const el of elements) {
    el.style.opacity = "0";
    el.style.willChange = "opacity, transform";

    let revealed = false;
    const stop = inView(
      el,
      () => {
        if (once && revealed) return;
        revealed = true;
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

    stops.push(stop);
  }

  return () => {
    for (const stop of stops) stop();
  };
}
