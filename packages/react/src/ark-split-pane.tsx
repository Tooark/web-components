import type { ArkSplitPaneStyleOptions } from "@tooark/core";
import type { ArkSplitPane as ArkSplitPaneElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkSplitPaneProps = PropsWithChildren<
  ArkSplitPaneStyleOptions & {
    /** Tamanhos dos paineis em percentuais, na ordem dos filhos (ex.: [30, 70]); faltantes sao distribuidos. */
    sizes?: number[];
    className?: string;
    /** Tamanhos mudaram por arrasto ou teclado: detail.sizes e a lista normalizada. Persistir e do app. */
    onResize?: (event: CustomEvent<{ sizes: number[] }>) => void;
  }
>;

export const ArkSplitPane = forwardRef<ArkSplitPaneElement, ArkSplitPaneProps>(
  function ArkSplitPane(props, forwardedRef): React.JSX.Element {
    const { children, className, sizes, localeJson, onResize, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkSplitPaneElement>(forwardedRef);

    useEffect(() => {
      ensureTooarkComponentsRegistered();
    }, []);

    useEffect(() => {
      const el = ref.current;
      if (!el || !onResize) return;

      const handler = (event: Event) => onResize(event as CustomEvent<{ sizes: number[] }>);
      el.addEventListener("ark-resize", handler);
      return () => el.removeEventListener("ark-resize", handler);
    }, [ref, onResize]);

    const attrs: Record<string, string | undefined | React.Ref<ArkSplitPaneElement>> = {
      ...rest,
      ref: setRef,
      class: className,
      sizes: sizes ? sizes.join(",") : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-split-pane", attrs, children);
  }
);
