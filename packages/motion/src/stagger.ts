import { prefersReducedMotion } from "@tooark/core";
import { animate, stagger } from "motion";
import { hiddenOffset, resolveDistancePx, resolveDurationSec, resolveEase, resolveTargets } from "./internal";
import type { ArkMotionTargets, ArkStaggerOptions } from "./types";

/**
 * Entrada escalonada de uma lista de elementos usando os motion tokens.
 * Resolve quando todos os itens terminam (imediatamente com reduced motion).
 */
export async function arkStaggerEnter(targets: ArkMotionTargets, options: ArkStaggerOptions = {}): Promise<void> {
  const elements = resolveTargets(targets);
  if (elements.length === 0) return;

  if (prefersReducedMotion()) {
    for (const el of elements) {
      el.style.opacity = "";
      el.style.transform = "";
    }
    return;
  }

  const preset = options.preset ?? "slide-up";
  const distancePx = resolveDistancePx(elements[0], options.distance);
  const offset = hiddenOffset(preset, distancePx);

  const keyframes: Record<string, [number, number]> = { opacity: [0, 1] };
  if (offset.x !== undefined) keyframes.x = [offset.x, 0];
  if (offset.y !== undefined) keyframes.y = [offset.y, 0];
  if (offset.scale !== undefined) keyframes.scale = [offset.scale, 1];

  await animate(elements, keyframes, {
    duration: resolveDurationSec(options.duration, "default"),
    ease: resolveEase(options.ease) as never,
    delay: stagger((options.interval ?? 60) / 1000, { from: options.from ?? "first" })
  });
}
