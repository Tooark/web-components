import { prefersReducedMotion } from "@tooark/core";
import { animate } from "motion";
import type { ArkSwipeDirection, ArkSwipeOptions } from "./types";

/**
 * Gesto de swipe com feedback visual e retorno com física de spring.
 * Retorna uma função de cleanup que remove os listeners.
 * @param element O elemento HTML que receberá o gesto de swipe.
 * @param options As opções de configuração do swipe, incluindo eixo, limiar, resistência e callback.
 * @returns Uma função de cleanup que remove os listeners.
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

  // Lê a posição atual do ponteiro com base no eixo configurado.
  const readPos = (event: PointerEvent): number => (axis === "x" ? event.clientX : event.clientY);

  // Aplica o feedback visual de swipe enquanto o usuário arrasta o elemento.
  const applyFeedback = (value: number): void => {
    // Se o feedback visual estiver desativado, não aplica a transformação.
    if (!feedback) {
      return;
    }

    // Aplica a resistência ao valor do swipe.
    const damped = value * (1 - resistance);

    // Atualiza a transformação do elemento com base no valor amortecido.
    element.style.transform = axis === "x" ? `translateX(${damped}px)` : `translateY(${damped}px)`;
  };

  // Anima o elemento de volta à posição original com física de spring.
  const springBack = (): void => {
    // Se o feedback visual estiver desativado, não aplica a animação de retorno.
    if (!feedback) {
      return;
    }

    // Remove a transformação do elemento antes de aplicar a animação de retorno.
    element.style.transform = "";

    // Se o usuário preferir animações reduzidas, não aplica a animação de retorno.
    if (prefersReducedMotion()) {
      return;
    }

    // Calcula o valor amortecido com base na resistência configurada.
    const damped = delta * (1 - resistance);

    // Cria os keyframes para a animação de retorno com base no valor amortecido.
    const keyframes = axis === "x" ? { x: [damped, 0] } : { y: [damped, 0] };

    // Aplica a animação de retorno usando a biblioteca de animação.
    animate(element, keyframes as never, {
      type: "spring",
      stiffness: 420,
      damping: 34,
      velocity: -velocity * (1 - resistance)
    });
  };

  // Manipulador de evento para quando o ponteiro é pressionado.
  const onPointerDown = (event: PointerEvent): void => {
    // Ignora o evento se já houver um ponteiro ativo ou se o ponteiro não for primário.
    if (pointerId !== null || !event.isPrimary) {
      return;
    }

    pointerId = event.pointerId;
    startPos = lastPos = readPos(event);
    lastTime = event.timeStamp;
    delta = 0;
    velocity = 0;
    element.setPointerCapture(event.pointerId);
  };

  // Manipulador de evento para quando o ponteiro é movido.
  const onPointerMove = (event: PointerEvent): void => {
    // Ignora o evento se o ponteiro não for o ativo.
    if (event.pointerId !== pointerId) {
      return;
    }

    // Calcula a posição atual do ponteiro e o tempo decorrido desde o último evento.
    const pos = readPos(event);
    const elapsed = event.timeStamp - lastTime;

    // Calcula a velocidade do ponteiro com base na mudança de posição e no tempo decorrido.
    if (elapsed > 0) {
      velocity = ((pos - lastPos) / elapsed) * 1000;
    }

    // Atualiza a posição e o tempo do último evento para o próximo cálculo de velocidade.
    lastPos = pos;
    lastTime = event.timeStamp;
    delta = pos - startPos;

    // Aplica o feedback visual com base no deslocamento atual.
    applyFeedback(delta);
  };

  // Manipulador de evento para quando o ponteiro é liberado ou cancelado.
  const finish = (event: PointerEvent): void => {
    // Ignora o evento se o ponteiro não for o ativo.
    if (event.pointerId !== pointerId) {
      return;
    }

    // Libera o ponteiro e redefine o estado interno.
    pointerId = null;
    element.releasePointerCapture(event.pointerId);

    // Determina se o gesto de swipe foi acionado com base no deslocamento e na velocidade.
    const triggered = Math.abs(delta) >= threshold || Math.abs(velocity) >= velocityThreshold;

    // Aciona o callback de swipe se o gesto foi detectado e o deslocamento não for zero.
    if (triggered && delta !== 0) {
      const direction: ArkSwipeDirection = axis === "x" ? (delta < 0 ? "left" : "right") : delta < 0 ? "up" : "down";
      options.onSwipe(direction, { delta, velocity });
    }

    // Restaura o elemento à sua posição original usando a animação de spring back.
    springBack();
    delta = 0;
  };

  // Armazena a ação de toque anterior e define a ação de toque apropriada para o eixo do swipe.
  const previousTouchAction = element.style.touchAction;
  element.style.touchAction = axis === "x" ? "pan-y" : "pan-x";

  // Adiciona os manipuladores de eventos para o ponteiro.
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);

  // Retorna uma função de limpeza que remove os manipuladores de eventos e restaura a ação de toque original.
  return () => {
    element.style.touchAction = previousTouchAction;
    element.removeEventListener("pointerdown", onPointerDown);
    element.removeEventListener("pointermove", onPointerMove);
    element.removeEventListener("pointerup", finish);
    element.removeEventListener("pointercancel", finish);
  };
}
