// Helpers de animação via Web Animations API (WAAPI), baseados nos motion
// tokens. Não exigem CSS importado: leem as custom properties --ark-* do
// elemento e caem nos valores canônicos de @tooark/tokens quando ausentes.

import type { ArkDuration, ArkEasing } from "@tooark/tokens";
import { ARK_DURATION_MS, ARK_EASING_CSS, ARK_MOTION_DISTANCE } from "@tooark/tokens";
import type { ArkMotionOptions, ArkMotionPreset } from "./types";

/**
 * Indica se o usuário pediu movimento reduzido no sistema.
 * @returns `true` se o usuário pediu movimento reduzido, `false` caso contrário.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Lê o valor de uma custom property CSS do elemento.
 * @param element O elemento do qual ler a custom property.
 * @param name O nome da custom property CSS.
 * @returns O valor da custom property CSS como string.
 */
function readToken(element: HTMLElement, name: string): string {
  // Se não houver window ou getComputedStyle, retorna string vazia.
  if (typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return "";
  }

  return window.getComputedStyle(element).getPropertyValue(name).trim();
}

/**
 * Converte uma duração CSS em milissegundos.
 * @param value O valor da duração CSS (ex: "200ms", "0.3s").
 * @returns A duração em milissegundos, ou `null` se o valor não for válido.
 */
function parseCssDuration(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value);

  // Se não houver correspondência, retorna null.
  if (!match) {
    return null;
  }

  // Converte a quantidade para número.
  const amount = Number(match[1]);

  // Converte a unidade para milissegundos.
  return match[2] === "s" ? amount * 1000 : amount;
}

/**
 * Resolve a duração de animação considerando movimento reduzido e valores CSS.
 * @param element O elemento para o qual resolver a duração.
 * @param duration A duração como número ou chave de ArkDuration.
 * @returns A duração em milissegundos.
 */
function resolveDuration(element: HTMLElement, duration: ArkDuration | number): number {
  // Se o usuário pediu movimento reduzido, retorna 0.
  if (prefersReducedMotion()) {
    return 0;
  }

  // Se a duração for um número, retorna o valor garantidamente não negativo.
  if (typeof duration === "number") {
    return Math.max(0, duration);
  }

  // Lê a duração da custom property CSS correspondente ao ArkDuration.
  const fromCss = parseCssDuration(readToken(element, `--ark-duration-${duration}`));

  // Se não houver valor CSS, usa o valor padrão do ArkDuration.
  return fromCss ?? ARK_DURATION_MS[duration];
}

/**
 * Resolve a função de easing considerando valores CSS.
 * @param element O elemento para o qual resolver a easing.
 * @param easing A easing como string ou chave de ArkEasing.
 * @returns A função de easing como string.
 */
function resolveEasing(element: HTMLElement, easing: ArkEasing | string): string {
  // Se a easing for uma chave de ArkEasing, tenta ler o valor da custom property CSS correspondente.
  if (easing in ARK_EASING_CSS) {
    return readToken(element, `--ark-ease-${easing}`) || ARK_EASING_CSS[easing as ArkEasing];
  }

  // Se não for uma chave de ArkEasing, retorna a string de easing fornecida.
  return easing;
}

/**
 * Resolve a distância de animação considerando valores CSS.
 * @param element O elemento para o qual resolver a distância.
 * @param distance A distância como string opcional.
 * @returns A distância como string.
 */
function resolveDistance(element: HTMLElement, distance?: string): string {
  // Retorna a distância fornecida, ou a distância definida na custom property CSS, ou o valor padrão.
  return distance || readToken(element, "--ark-motion-distance") || ARK_MOTION_DISTANCE;
}

/**
 * Transforma o elemento para o estado oculto correspondente ao preset e à distância fornecida.
 * @param preset O preset de animação.
 * @param distance A distância de animação como string.
 * @returns A transformação CSS correspondente ao estado oculto.
 */
function hiddenTransform(preset: ArkMotionPreset, distance: string): string {
  if (preset === "slide-up") {
    return `translateY(${distance})`;
  }
  if (preset === "slide-down") {
    return `translateY(calc(${distance} * -1))`;
  }
  if (preset === "slide-left") {
    return `translateX(calc(${distance} * -1))`;
  }
  if (preset === "slide-right") {
    return `translateX(${distance})`;
  }
  if (preset === "scale") {
    return "scale(0.95)";
  }
  return "none";
}

/**
 * Aguarda a conclusão de uma animação.
 * @param animation A animação cuja conclusão será aguardada.
 * @returns Uma Promise que resolve quando a animação termina.
 */
function afterAnimation(animation: Animation): Promise<void> {
  return animation.finished.then(
    () => undefined,
    () => undefined
  );
}

/**
 * Executa a animação no elemento fornecido com os keyframes e opções especificadas.
 * @param element O elemento a ser animado.
 * @param keyframes Os keyframes da animação.
 * @param options As opções de animação fornecidas pelo usuário.
 * @param defaults Os valores padrão para duração e easing.
 * @param fill O modo de preenchimento da animação.
 * @returns Uma Promise que resolve quando a animação termina.
 */
function runAnimation(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: ArkMotionOptions,
  defaults: Required<Pick<ArkMotionOptions, "duration" | "easing">>,
  fill: FillMode
): Promise<void> {
  // verifica se o elemento suporta animações Web Animations API
  if (typeof element.animate !== "function") {
    return Promise.resolve();
  }

  // executa a animação com os keyframes e opções fornecidas
  const animation = element.animate(keyframes, {
    duration: resolveDuration(element, options.duration ?? defaults.duration),
    easing: resolveEasing(element, options.easing ?? defaults.easing),
    fill
  });

  // aguarda a conclusão da animação antes de resolver a Promise
  return afterAnimation(animation);
}

/**
 * Anima a entrada de um elemento (estado oculto do preset → estado natural).
 * Resolve quando a animação termina (imediatamente com movimento reduzido).
 * @param element O elemento a ser animado.
 * @param preset O preset de animação a ser usado.
 * @param options As opções de animação fornecidas pelo usuário.
 * @returns Uma Promise que resolve quando a animação termina.
 */
export function arkEnter(
  element: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  // resolve a distância de movimento com base nas opções fornecidas e no elemento
  const distance = resolveDistance(element, options.distance);

  // define os keyframes da animação de entrada com base no preset e na distância calculada
  const keyframes: Keyframe[] = [
    { opacity: 0, transform: hiddenTransform(preset, distance) },
    { opacity: 1, transform: "none" }
  ];

  // executa a animação de entrada com os keyframes e opções fornecidas
  return runAnimation(element, keyframes, options, { duration: "default", easing: "out" }, "backwards");
}

/**
 * Anima a saída de um elemento (estado natural → estado oculto do preset).
 * O elemento permanece no DOM oculto (fill forwards) até o caller removê-lo.
 * @param element O elemento a ser animado.
 * @param preset O preset de animação a ser usado.
 * @param options As opções de animação fornecidas pelo usuário.
 * @returns Uma Promise que resolve quando a animação termina.
 */
export function arkExit(
  element: HTMLElement,
  preset: ArkMotionPreset = "fade",
  options: ArkMotionOptions = {}
): Promise<void> {
  // resolve a distância de movimento com base nas opções fornecidas e no elemento
  const distance = resolveDistance(element, options.distance);

  // define os keyframes da animação de saída com base no preset e na distância calculada
  const keyframes: Keyframe[] = [
    { opacity: 1, transform: "none" },
    { opacity: 0, transform: hiddenTransform(preset, distance) }
  ];

  // executa a animação de saída com os keyframes e opções fornecidas
  return runAnimation(element, keyframes, options, { duration: "quick", easing: "in" }, "forwards");
}
