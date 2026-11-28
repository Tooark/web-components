import type { ArkThemeSelected } from "@tooark/tokens";
import type { EChartsOption } from "echarts";

/** Tema do gráfico. "auto" segue o color-scheme do host, ou a preferência do sistema sem lado fixo. */
export type ArkChartTheme = "auto" | ArkThemeSelected;

/**
 * Cores do gráfico: "default" é a paleta do ECharts (e o tema dark embutido); "tokens" monta o tema a partir dos
 * tokens `--ark-color-*` da página, com fundo transparente.
 */
export type ArkChartPalette = "default" | "tokens";

/** Renderer usado pelo ECharts. */
export type ArkChartRenderer = "canvas" | "svg";

/** Tipos de gráfico de conveniência (atalhos sobre as series do ECharts). */
export type ArkChartType = "line" | "bar" | "pie" | "scatter" | "radar" | "gauge" | "candlestick" | "custom";

export type ArkChartOptions = {
  /** Opções nativas do ECharts (fonte da verdade da renderização). */
  option: EChartsOption;
  /** Tema visual. Default: "auto". */
  theme?: ArkChartTheme;
  /**
   * Cores: "tokens" segue os tokens `--ark-color-*` (séries nos intents, texto, eixos, grade e tooltip) com fundo
   * transparente, e cai no padrão sem o CSS dos tokens na página. Default: "default".
   */
  palette?: ArkChartPalette;
  /** Renderer do ECharts. Default: "canvas". */
  renderer?: ArkChartRenderer;
  /** Redimensiona o gráfico junto com o container. Default: true. */
  autoResize?: boolean;
};

/** Opções de `resolveTokenColors`. */
export type ArkTokenColorOptions = {
  /** Lado das cores: "auto" segue o color-scheme de `element`. Padrão: "auto". */
  theme?: ArkChartTheme;
  /** Onde ler os tokens (um override de marca num trecho da página vale ali). Padrão: `document.body`. */
  element?: HTMLElement;
};

/** Re-export do tipo nativo do ECharts para conveniência dos consumidores. */
export type { EChartsOption };
