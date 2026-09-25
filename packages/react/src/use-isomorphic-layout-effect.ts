import { useEffect, useLayoutEffect } from "react";

// Listeners de eventos que o elemento pode emitir já ao conectar (o ark-open de um overlay aberto na montagem, num
// microtask): o layout effect roda no commit, logo depois de o nó entrar no DOM, e o useEffect só depois da pintura.
// No servidor cai no useEffect, que não roda lá e evita o aviso do React 18 sobre useLayoutEffect no SSR.

/** useLayoutEffect no navegador; useEffect no servidor. */
export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
