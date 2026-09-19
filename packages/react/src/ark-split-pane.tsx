import type { ArkSplitPaneStyleOptions } from "@tooark/core";
import type React from "react";
import { createElement, type PropsWithChildren, useEffect, useRef } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";

export type ArkSplitPaneProps = PropsWithChildren<
  ArkSplitPaneStyleOptions & {
    /** Tamanhos dos paineis em percentuais, na ordem dos filhos (ex.: [30, 70]); faltantes sao distribuidos. */
    sizes?: number[];
    className?: string;
    /** Tamanhos mudaram por arrasto ou teclado: detail.sizes e a lista normalizada. Persistir e do app. */
    onResize?: (event: CustomEvent<{ sizes: number[] }>) => void;
  }
>;

export function ArkSplitPane(props: ArkSplitPaneProps): React.JSX.Element {
  const { children, className, sizes, localeJson, onResize, ...rest } = props;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    ensureTooarkComponentsRegistered();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onResize) return;

    const handler = (event: Event) => onResize(event as CustomEvent<{ sizes: number[] }>);
    el.addEventListener("ark-resize", handler);
    return () => el.removeEventListener("ark-resize", handler);
  }, [onResize]);

  const attrs: Record<string, string | undefined | React.Ref<HTMLElement>> = {
    ...rest,
    ref,
    class: className,
    sizes: sizes ? sizes.join(",") : undefined,
    "locale-json": localeJson
  };

  return createElement("ark-split-pane", attrs, children);
}
