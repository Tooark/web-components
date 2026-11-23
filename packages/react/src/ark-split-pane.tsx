import type { ArkSplitPaneStyleOptions } from "@tooark/core";
import type { ArkSplitPane as ArkSplitPaneElement } from "@tooark/web-components";
import type React from "react";
import { createElement, forwardRef, type PropsWithChildren, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { ensureTooarkComponentsRegistered } from "./register.js";
import { useForwardedRef } from "./use-forwarded-ref.js";

export type ArkSplitPaneProps = PropsWithChildren<
  ArkDomProps<
    ArkSplitPaneStyleOptions & {
      /** Tamanhos dos painéis em percentuais, na ordem dos filhos (ex.: [30, 70]); faltantes são distribuídos. */
      sizes?: number[];
      className?: string;
      /** Tamanhos mudaram por arrasto ou teclado: detail.sizes é a lista normalizada. Persistir é do app. */
      onResize?: (event: CustomEvent<{ sizes: number[] }>) => void;
    }
  >
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

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      sizes: sizes ? sizes.join(",") : undefined,
      "locale-json": localeJson
    };

    return createElement("ark-split-pane", attrs, children);
  }
);
