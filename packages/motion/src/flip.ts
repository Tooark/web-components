import { prefersReducedMotion } from "@tooark/core";
import { animate } from "motion";
import { resolveTargets } from "./internal";
import type { ArkFlipOptions, ArkMotionTargets } from "./types";

/**
 * Animação FLIP: mede a posição dos elementos, aplica a mutação de DOM
 * (reordenar, inserir, filtrar) e anima cada item da posição antiga para
 * a nova com física de spring.
 */
export async function arkFlip(
  targets: ArkMotionTargets,
  mutate: () => void,
  options: ArkFlipOptions = {}
): Promise<void> {
  const elements = resolveTargets(targets);

  if (elements.length === 0 || prefersReducedMotion()) {
    mutate();
    return;
  }

  const first = new Map<HTMLElement, DOMRect>();
  for (const el of elements) {
    first.set(el, el.getBoundingClientRect());
  }

  mutate();

  const animations: Array<Promise<unknown>> = [];
  for (const el of elements) {
    const before = first.get(el);
    if (!before || !el.isConnected) continue;

    const after = el.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (dx === 0 && dy === 0) continue;

    const keyframes: Record<string, [number, number]> = {};
    if (dx !== 0) keyframes.x = [dx, 0];
    if (dy !== 0) keyframes.y = [dy, 0];

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

  await Promise.all(animations);
}
