import type React from "react";
import { useCallback, useRef } from "react";

// O wrapper precisa do elemento (liga eventos e grava propriedades) e o app também pode pedir o mesmo nó por `ref`.
// Uma callback ref só, que preenche as duas: a interna e a encaminhada. Callback ref do app que devolve limpeza
// (React 19) é respeitada como o React faria: ao desmontar roda a limpeza, e não uma chamada com null.
// A ref interna é o mesmo objeto em todo render (useRef): os efeitos dos wrappers a listam nas dependências só porque
// o Biome não sabe que este hook devolve algo estável, e ela nunca faz um efeito rodar de novo.

/** Ref interna do wrapper e a callback ref que a preenche junto com a `ref` encaminhada pelo app. */
export function useForwardedRef<T extends HTMLElement>(
  forwarded: React.ForwardedRef<T>
): [React.RefObject<T | null>, (node: T | null) => void] {
  const local = useRef<T | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  const setRef = useCallback(
    (node: T | null): void => {
      local.current = node;
      if (typeof forwarded === "function") {
        if (node) {
          const result = (forwarded as (instance: T | null) => unknown)(node);
          cleanup.current = typeof result === "function" ? (result as () => void) : null;
        } else if (cleanup.current) {
          cleanup.current();
          cleanup.current = null;
        } else {
          forwarded(null);
        }
      } else if (forwarded) {
        forwarded.current = node;
      }
    },
    [forwarded]
  );

  return [local, setRef];
}
