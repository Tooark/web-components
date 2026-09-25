import type { ArkDuration, ArkEasing, ArkMotionPreset } from "@tooark/core";
import { ARK_DURATION_MS, ARK_MOTION_DISTANCE, prefersReducedMotion } from "@tooark/core";
import type { ArkMotionTargets } from "./types";

/**
 * Curvas dos tokens --ark-ease-* no formato aceito pela lib Motion (linear = bezier identidade).
 * @remarks As curvas são definidas como arrays de quatro números representando os pontos de controle
 * da função bezier cúbica.
 */
export const ARK_EASE_BEZIER: Record<ArkEasing, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  standard: [0.2, 0, 0, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  "in-out": [0.4, 0, 0.2, 1],
  overshoot: [0.34, 1.56, 0.64, 1],
  sheet: [0.32, 0.72, 0, 1]
};

/** Valor de uma custom property (token --ark-*) no elemento, ou "" sem elemento ou fora do navegador. */
function readToken(element: Element | undefined, name: string): string {
  if (!element || typeof getComputedStyle !== "function") return "";
  return getComputedStyle(element).getPropertyValue(name).trim();
}

/** "250ms" ou "0.25s" em milissegundos; null para qualquer outra coisa. */
function parseCssDurationMs(value: string): number | null {
  const match = /^(-?\d*\.?\d+)(ms|s)$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]);
  return match[2] === "s" ? amount * 1000 : amount;
}

/** "cubic-bezier(a, b, c, d)" ou "linear" como os quatro pontos que a lib Motion aceita; null para o resto. */
function parseCubicBezier(value: string): [number, number, number, number] | null {
  if (value === "linear") return [0, 0, 1, 1];
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(value);
  if (!match) return null;
  const points = match[1].split(",").map((part) => Number(part.trim()));
  return points.length === 4 && points.every(Number.isFinite) ? (points as [number, number, number, number]) : null;
}

/**
 * Normaliza seletor, elemento, array ou NodeList numa lista de HTMLElement.
 * @param targets O(s) alvo(s) a serem normalizados.
 * @returns Uma lista de elementos HTML.
 */
export function resolveTargets(targets: ArkMotionTargets): HTMLElement[] {
  // Verifica se o alvo é uma string (seletor CSS) e resolve os elementos correspondentes.
  if (typeof targets === "string") {
    // Se o documento não estiver disponível (ex: SSR), retorna uma lista vazia.
    if (typeof document === "undefined") {
      return [];
    }

    // Seleciona todos os elementos correspondentes ao seletor CSS.
    return Array.from(document.querySelectorAll<HTMLElement>(targets));
  }

  // Verifica se o alvo é um único elemento e o encapsula em um array.
  if (targets instanceof Element) {
    return targets instanceof HTMLElement ? [targets] : [];
  }

  // Assume que o alvo é um array ou NodeList e filtra apenas os elementos HTML.
  return Array.from(targets).filter((el): el is HTMLElement => el instanceof HTMLElement);
}

/**
 * Resolve a duração em segundos a partir de um valor em milissegundos ou token ArkDuration. O token vem da
 * página (--ark-duration-* no elemento) e cai no espelho JS quando o CSS da lib não está carregado.
 * @param element O elemento de onde ler o token.
 * @param duration A duração desejada em milissegundos ou como token ArkDuration.
 * @param fallback O token ArkDuration a ser usado caso duration não seja fornecido.
 * @returns A duração em segundos, respeitando a preferência de redução de movimento.
 */
export function resolveDurationSec(
  element: Element | undefined,
  duration: ArkDuration | number | undefined,
  fallback: ArkDuration
): number {
  // Retorna 0 se o usuário preferir animações reduzidas.
  if (prefersReducedMotion()) {
    return 0;
  }

  // Garante que a duração seja um número válido em segundos.
  if (typeof duration === "number") {
    return Math.max(0, duration) / 1000;
  }

  // Token: o valor da página, senão o espelho JS; depois para segundos.
  const token = duration ?? fallback;
  return (parseCssDurationMs(readToken(element, `--ark-duration-${token}`)) ?? ARK_DURATION_MS[token]) / 1000;
}

/**
 * Resolve a curva de animação a partir de um token ArkEasing, array bezier ou nome. O token vem da página
 * (--ark-ease-* no elemento) e cai no espelho JS quando o CSS da lib não está carregado.
 * @param element O elemento de onde ler o token.
 * @param ease A curva desejada como token ArkEasing, array bezier ou nome.
 * @returns A curva de animação correspondente, padrão: token out.
 */
export function resolveEase(
  element: Element | undefined,
  ease: ArkEasing | number[] | string | undefined
): number[] | string {
  if (Array.isArray(ease)) {
    return ease;
  }

  // Token (ou nenhum valor, que é o token out): a curva da página, senão o espelho JS.
  const token = ease === undefined ? "out" : ease in ARK_EASE_BEZIER ? (ease as ArkEasing) : null;
  if (token) {
    return parseCubicBezier(readToken(element, `--ark-ease-${token}`)) ?? ARK_EASE_BEZIER[token];
  }

  // Nome próprio da lib Motion ("easeInOut"...), repassado como veio.
  return ease as string;
}

/**
 * Converte a distância CSS ("0.75rem", "24px") para px.
 * @param element O elemento HTML de referência para unidades relativas (em).
 * @param distance A distância desejada como string CSS.
 * @returns A distância em pixels.
 */
export function resolveDistancePx(element: HTMLElement | undefined, distance?: string): number {
  // A distância pedida, senão o token da página (--ark-motion-distance), senão o espelho JS.
  const value = distance || readToken(element, "--ark-motion-distance") || ARK_MOTION_DISTANCE;
  const amount = Number.parseFloat(value);

  // Retorna um valor padrão caso a distância não seja um número finito.
  if (!Number.isFinite(amount)) {
    return 12;
  }

  // Converte a distância para pixels com base na unidade CSS.
  if (value.endsWith("rem")) {
    // Obtém o tamanho da fonte raiz (root) para conversão de rem para px.
    const rootSize =
      typeof document !== "undefined" ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize) : 16;

    return amount * (rootSize || 16);
  }

  // Converte a distância para pixels caso a unidade seja px (padrão) ou não especificada.
  if (value.endsWith("em") && element) {
    // Obtém o tamanho da fonte do elemento para conversão de em para px.
    return amount * (Number.parseFloat(getComputedStyle(element).fontSize) || 16);
  }

  return amount;
}

/**
 * Offset inicial (x/y/scale) do estado oculto de cada preset.
 * @param preset O preset de animação desejado.
 * @param distancePx A distância em pixels para o deslocamento.
 * @returns Um objeto contendo os offsets iniciais (x/y/scale) correspondentes.
 */
export function hiddenOffset(preset: ArkMotionPreset, distancePx: number): { x?: number; y?: number; scale?: number } {
  // Determina o offset inicial com base no preset de animação.
  if (preset === "slide-up") {
    return { y: distancePx };
  }
  if (preset === "slide-down") {
    return { y: -distancePx };
  }
  if (preset === "slide-left") {
    return { x: -distancePx };
  }
  if (preset === "slide-right") {
    return { x: distancePx };
  }
  if (preset === "scale") {
    return { scale: 0.95 };
  }

  return {};
}
