import type { ArkDuration, ArkEasing, ArkMotionPreset } from "@tooark/core";
import { ARK_DURATION_MS, ARK_MOTION_DISTANCE, prefersReducedMotion } from "@tooark/core";
import type { ArkMotionTargets } from "./types";

/** Curvas dos tokens --ark-ease-* no formato aceito pela lib Motion (linear = bezier identidade). */
export const ARK_EASE_BEZIER: Record<ArkEasing, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  standard: [0.2, 0, 0, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  "in-out": [0.4, 0, 0.2, 1],
  overshoot: [0.34, 1.56, 0.64, 1]
};

export function resolveTargets(targets: ArkMotionTargets): HTMLElement[] {
  if (typeof targets === "string") {
    if (typeof document === "undefined") return [];
    return Array.from(document.querySelectorAll<HTMLElement>(targets));
  }
  if (targets instanceof Element) {
    return targets instanceof HTMLElement ? [targets] : [];
  }
  return Array.from(targets).filter((el): el is HTMLElement => el instanceof HTMLElement);
}

/** Duração em segundos (unidade da lib Motion); 0 com prefers-reduced-motion. */
export function resolveDurationSec(duration: ArkDuration | number | undefined, fallback: ArkDuration): number {
  if (prefersReducedMotion()) return 0;
  if (typeof duration === "number") return Math.max(0, duration) / 1000;
  return ARK_DURATION_MS[duration ?? fallback] / 1000;
}

export function resolveEase(ease: ArkEasing | number[] | string | undefined): number[] | string {
  if (Array.isArray(ease)) return ease;
  if (typeof ease === "string" && ease in ARK_EASE_BEZIER) return ARK_EASE_BEZIER[ease as ArkEasing];
  return ease ?? ARK_EASE_BEZIER.out;
}

/** Converte a distância CSS ("0.75rem", "24px") para px. */
export function resolveDistancePx(element: HTMLElement | undefined, distance?: string): number {
  const value = distance || ARK_MOTION_DISTANCE;
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return 12;

  if (value.endsWith("rem")) {
    const rootSize =
      typeof document !== "undefined" ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize) : 16;
    return amount * (rootSize || 16);
  }
  if (value.endsWith("em") && element) {
    return amount * (Number.parseFloat(getComputedStyle(element).fontSize) || 16);
  }
  return amount;
}

/** Offset inicial (x/y/scale) do estado oculto de cada preset. */
export function hiddenOffset(preset: ArkMotionPreset, distancePx: number): { x?: number; y?: number; scale?: number } {
  if (preset === "slide-up") return { y: distancePx };
  if (preset === "slide-down") return { y: -distancePx };
  if (preset === "slide-left") return { x: -distancePx };
  if (preset === "slide-right") return { x: distancePx };
  if (preset === "scale") return { scale: 0.95 };
  return {};
}
