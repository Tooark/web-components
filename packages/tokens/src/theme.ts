import type { ArkThemeSelected } from "./types";

/**
 * Resolve o tema efetivo ("light" | "dark") de um elemento pelo seu color-scheme computado: a página (ou um ancestral
 * com theme="dark") decide, e só "light dark"/"normal" caem na preferência do sistema. Sem DOM devolve "light".
 * @param element O elemento cujo color-scheme computado será usado para determinar o tema.
 * @returns "light" ou "dark" baseado no color-scheme do elemento ou na preferência do sistema.
 */
export function resolveColorScheme(element?: Element | null): ArkThemeSelected {
  // Sem DOM devolve "light".
  if (typeof window === "undefined") {
    return "light";
  }

  // Tenta resolver pelo color-scheme computado do elemento.
  if (element && typeof window.getComputedStyle === "function") {
    const scheme = window.getComputedStyle(element).colorScheme || "";
    const dark = scheme.includes("dark");
    const light = scheme.includes("light");

    // Se o color-scheme inclui apenas "dark" ou apenas "light", retorna o tema correspondente.
    if (dark && !light) {
      return "dark";
    }
    if (light && !dark) {
      return "light";
    }
  }

  // Se não conseguiu resolver pelo color-scheme do elemento, usa a preferência do sistema.
  const prefersDark =
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDark ? "dark" : "light";
}
