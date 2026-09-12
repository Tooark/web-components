// Helpers de animação via Web Animations API (WAAPI), baseados nos motion
// tokens. Não exigem CSS importado: leem as custom properties --ark-* do
// elemento e caem nos valores canônicos de @tooark/tokens quando ausentes.

import type { ArkDuration, ArkEasing } from "@tooark/tokens";
import { ARK_DURATION_MS, ARK_EASING_CSS, ARK_MOTION_DISTANCE } from "@tooark/tokens";
import type { ArkMotionOptions, ArkMotionPreset } from "./types";

/** Indica se o usuário pediu movimento reduzido no sistema. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function readToken(element: HTMLElement, name: string): string {
  if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") return "";
  return window.getComputedStyle(element).getPropertyValue(name).trim();
}

function parseCssDuration(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1000 : amount;
}

function resolveDuration(element: HTMLElement, duration: ArkDuration | number): number {
  if (prefersReducedMotion()) return 0;
  if (typeof duration === "number") return Math.max(0, duration);

  const fromCss = parseCssDuration(readToken(element, `--ark-duration-${duration}`));
  return fromCss ?? ARK_DURATION_MS[duration];
}

function resolveEasing(element: HTMLElement, easing: ArkEasing | string): string {
  if (easing in ARK_EASING_CSS) {
    return readToken(element, `--ark-ease-${easing}`) || ARK_EASING_CSS[easing as ArkEasing];
  }
  return easing;
}

function resolveDistance(element: HTMLElement, distance?: string): string {
  return distance || readToken(element, "--ark-motion-distance") || ARK_MOTION_DISTANCE;
}

function hiddenTransform(preset: ArkMotionPreset, distance: string): string {
  if (preset === "slide-up") return `translateY(${distance})`;
  if (preset === "slide-down") return `translateY(calc(${distance} * -1))`;
  if (preset === "slide-left") return `translateX(calc(${distance} * -1))`;
  if (preset === "slide-right") return `translateX(${distance})`;
  if (preset === "scale") return "scale(0.95)";
  return "none";
}

function afterAnimation(animation: Animation): Promise<void> {
  return animation.finished.then(
    () => undefined,
    () => undefined
  );
}

function runAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: ArkMotionOptions,
  defaults: Required<Pick<ArkMotionOptions, "duration" | "easing">>,
  fill: FillMode
): Promise<void> {
  if (typeof element.animate !== "function") return Promise.resolve();

  const animation = element.animate(keyframes, {
    duration: resolveDuration(element, options.duration ?? defaults.duration),
    easing: resolveEasing(element, options.easing ?? defaults.easing),
    fill
  });

  return afterAnimation(animation);
}

/**
 * Anima a entrada de um elemento (estado oculto do preset → estado natural).
 * Resolve quando a animação termina (imediatamente com movimento reduzido).
 */
export function arkEnter(
  element: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  const distance = resolveDistance(element, options.distance);
  const keyframes: Keyframe[] = [
    { opacity: 0, transform: hiddenTransform(preset, distance) },
    { opacity: 1, transform: "none" }
  ];
  return runAnimation(element, keyframes, options, { duration: "default", easing: "out" }, "backwards");
}

/**
 * Anima a saída de um elemento (estado natural → estado oculto do preset).
 * O elemento permanece no DOM oculto (fill forwards) até o caller removê-lo.
 */
export function arkExit(
  element: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  const distance = resolveDistance(element, options.distance);
  const keyframes: Keyframe[] = [
    { opacity: 1, transform: "none" },
    { opacity: 0, transform: hiddenTransform(preset, distance) }
  ];
  return runAnimation(element, keyframes, options, { duration: "quick", easing: "in" }, "forwards");
}
