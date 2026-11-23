// Entry point @tooark/react/chart: o wrapper do ark-chart, fora da entrada principal para que o ECharts (peer do
// @tooark/chart) só entre no app que importa este caminho. Também tipa a tag crua <ark-chart> com as propriedades JS.
import { type ArkChart as ArkChartElement, type EChartsOption, registerTooarkChart } from "@tooark/chart";
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

/** Atributos da tag `ark-chart`, os mesmos da entrada principal, mais as propriedades JS. */
type ArkChartTagProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  testid?: string;
  theme?: "auto" | "light" | "dark";
  palette?: "default" | "tokens";
  renderer?: "canvas" | "svg";
  height?: string;
  "auto-resize"?: boolean | "false";
  /** Opções nativas do ECharts (propriedade JS; o React 19 a atribui como propriedade). */
  option?: EChartsOption | null;
};

// A tag crua ganha `option` no JSX: o bloco da entrada principal só tem os atributos. Redeclarar com um tipo mais
// estreito (os mesmos atributos e mais a propriedade) é aceito pela herança de ArkIntrinsicElements.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ark-chart": ArkChartTagProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-chart": ArkChartTagProps;
    }
  }
}

export type ArkChartProps = ArkDomProps<{
  /** Opções nativas do ECharts; trocar a referência re-renderiza o gráfico (`notMerge`). */
  option?: EChartsOption | null;
  /** auto (segue o color-scheme da página), light ou dark. Padrão: "auto". */
  theme?: "auto" | "light" | "dark";
  /** default (paleta do ECharts) ou tokens (cores dos tokens `--ark-color-*`, @tooark/chart 1.7+). Padrão: "default". */
  palette?: "default" | "tokens";
  /** Padrão: "canvas". */
  renderer?: "canvas" | "svg";
  /** Altura do gráfico (comprimento CSS). Padrão: "320px". */
  height?: string;
  /** Redimensiona junto com o contêiner. Padrão: true. */
  autoResize?: boolean;
  testid?: string;
  className?: string;
  /** Clique numa série, com os params nativos do ECharts em `detail`. */
  onChartClick?: (event: CustomEvent) => void;
}>;

export const ArkChart = forwardRef<ArkChartElement, ArkChartProps>(
  function ArkChart(props, forwardedRef): React.JSX.Element {
    const { className, option, autoResize, onChartClick, ...rest } = props;
    const [ref, setRef] = useForwardedRef<ArkChartElement>(forwardedRef);

    useEffect(() => {
      registerTooarkChart();
    }, []);

    // Pela propriedade, como no React 18 (que gravaria o objeto como texto no atributo), e só quando a referência
    // muda: cada atribuição re-renderiza o gráfico com notMerge.
    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (el && el.option !== (option ?? null)) el.option = option ?? null;
    }, [ref, option]);

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el || !onChartClick) return;
      const handle = (event: Event): void => onChartClick(event as CustomEvent);
      el.addEventListener("ark-chart-click", handle);
      return () => el.removeEventListener("ark-chart-click", handle);
    }, [ref, onChartClick]);

    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      "auto-resize": autoResize === false ? "false" : undefined
    };

    return createElement("ark-chart", attrs);
  }
);
