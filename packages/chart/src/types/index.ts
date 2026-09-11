import type { ArkThemeSelected } from "@tooark/tokens";
import type { EChartsOption } from "echarts";

/** Tema do gráfico. "auto" segue a preferência do sistema (prefers-color-scheme). */
export type ArkChartTheme = "auto" | ArkThemeSelected;

/** Renderer usado pelo ECharts. */
export type ArkChartRenderer = "canvas" | "svg";

/** Tipos de gráfico de conveniência (atalhos sobre as series do ECharts). */
export type ArkChartType = "line" | "bar" | "pie" | "scatter" | "radar" | "gauge" | "candlestick" | "custom";

export type ArkChartOptions = {
  /** Opções nativas do ECharts (fonte da verdade da renderização). */
  option: EChartsOption;
  /** Tema visual. Default: "auto". */
  theme?: ArkChartTheme;
  /** Renderer do ECharts. Default: "canvas". */
  renderer?: ArkChartRenderer;
  /** Redimensiona o gráfico junto com o container. Default: true. */
  autoResize?: boolean;
};

/** Re-export do tipo nativo do ECharts para conveniência dos consumidores. */
export type { EChartsOption };
