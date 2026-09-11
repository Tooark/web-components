import { prefersReducedMotion } from "@tooark/core";
import { animate } from "motion";
import type { ArkSwipeDirection, ArkSwipeOptions } from "./types";

/**
 * Gesto de swipe com feedback visual e retorno com física de spring.
 * Retorna uma função de cleanup que remove os listeners.
 */
export function arkSwipe(element: HTMLElement, options: ArkSwipeOptions): () => void {
  const axis = options.axis ?? "x";
  const threshold = options.threshold ?? 48;
  const velocityThreshold = options.velocityThreshold ?? 500;
  const feedback = options.feedback ?? true;
  const resistance = Math.min(1, Math.max(0, options.resistance ?? 0.4));

  let pointerId: number | null = null;
  let startPos = 0;
  let delta = 0;
  let lastPos = 0;
  let lastTime = 0;
  let velocity = 0;

  const readPos = (event: PointerEvent): number => (axis === "x" ? event.clientX : event.clientY);

  const applyFeedback = (value: number): void => {
    if (!feedback) return;
    const damped = value * (1 - resistance);
    element.style.transform = axis === "x" ? `translateX(${damped}px)` : `translateY(${damped}px)`;
  };

  const springBack = (): void => {
    if (!feedback) return;
    element.style.transform = "";
    if (prefersReducedMotion()) return;

    const damped = delta * (1 - resistance);
    const keyframes = axis === "x" ? { x: [damped, 0] } : { y: [damped, 0] };
    animate(element, keyframes as never, {
      type: "spring",
      stiffness: 420,
      damping: 34,
      velocity: -velocity * (1 - resistance)
    });
  };

  const onPointerDown = (event: PointerEvent): void => {
    if (pointerId !== null || !event.isPrimary) return;
    pointerId = event.pointerId;
    startPos = lastPos = readPos(event);
    lastTime = event.timeStamp;
    delta = 0;
    velocity = 0;
    element.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    const pos = readPos(event);
    const elapsed = event.timeStamp - lastTime;
    if (elapsed > 0) {
      velocity = ((pos - lastPos) / elapsed) * 1000;
    }
    lastPos = pos;
    lastTime = event.timeStamp;
    delta = pos - startPos;
    applyFeedback(delta);
  };

  const finish = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    element.releasePointerCapture(event.pointerId);

    const triggered = Math.abs(delta) >= threshold || Math.abs(velocity) >= velocityThreshold;
    if (triggered && delta !== 0) {
      const direction: ArkSwipeDirection = axis === "x" ? (delta < 0 ? "left" : "right") : delta < 0 ? "up" : "down";
      options.onSwipe(direction, { delta, velocity });
    }

    springBack();
    delta = 0;
  };

  const previousTouchAction = element.style.touchAction;
  element.style.touchAction = axis === "x" ? "pan-y" : "pan-x";

  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);

  return () => {
    element.style.touchAction = previousTouchAction;
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", finish);
    element.removeEventListener("pointercancel", finish);
  };
}
