import type { ArkThemeSelected } from "./types";

/**
 * Resolve o tema efetivo ("light" | "dark") de um elemento pelo seu color-scheme computado: a página (ou um ancestral
 * com theme="dark") decide, e só "light dark"/"normal" caem na preferência do sistema. Sem DOM devolve "light".
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

/**
 * Observa o tema efetivo de um elemento e chama `onChange` quando `resolveColorScheme(element)` passa a devolver
 * outro valor: atributos de `<html>` e `<body>` (`class`, `style`, `data-theme`, `theme`, onde os apps trocam o
 * tema) e a preferência do sistema via `matchMedia`. Devolve a função que para de observar. No-op sem DOM.
 */
export function observeColorScheme(element: Element, onChange: (theme: ArkThemeSelected) => void): () => void {
  if (typeof window === "undefined" || typeof MutationObserver === "undefined") return () => undefined;

  let current = resolveColorScheme(element);
  const check = (): void => {
    const next = resolveColorScheme(element);
    if (next === current) return;
    current = next;
    onChange(next);
  };

  const observer = new MutationObserver(check);
  const options = { attributes: true, attributeFilter: ["class", "style", "data-theme", "theme"] };
  observer.observe(document.documentElement, options);
  if (document.body) observer.observe(document.body, options);

  const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  media?.addEventListener("change", check);

  return () => {
    observer.disconnect();
    media?.removeEventListener("change", check);
  };
}
