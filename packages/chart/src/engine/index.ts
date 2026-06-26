import * as echarts from "echarts";
import type { EChartsType, EChartsOption } from "echarts";
import type { ArkThemeSelected } from "@tooark/tokens";
import type { ArkChartOptions, ArkChartTheme } from "../types";

export type ArkChartInstance = {
  /** Instância nativa do ECharts (para uso avançado: on/off, dispatchAction, etc.). */
  readonly chart: EChartsType;
  /** Aplica novas opções. `notMerge` substitui ao invés de mesclar. */
  setOption(option: EChartsOption, opts?: { notMerge?: boolean }): void;
  /** Troca o tema (re-inicializa o ECharts preservando a opção atual). */
  setTheme(theme: ArkChartTheme): void;
  /** Redimensiona o gráfico ao tamanho atual do container. */
  resize(): void;
  /** Tema efetivamente aplicado (após resolver "auto"). */
  resolvedTheme(): ArkThemeSelected;
  /** Libera a instância do ECharts. */
  destroy(): void;
};

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Resolve "auto" para "light"/"dark" conforme a preferência do sistema. */
export function resolveChartTheme(theme: ArkChartTheme | undefined): ArkThemeSelected {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return prefersDark() ? "dark" : "light";
}

/**
 * Cria um gráfico ECharts dentro de `container`.
 *
 * O ECharts exige que o container tenha dimensões definidas (altura/largura)
 * antes do `init` — garanta isso via CSS no elemento que você passar.
 */
export function createChart(container: HTMLElement, options: ArkChartOptions): ArkChartInstance {
  const renderer = options.renderer ?? "canvas";
  let currentOption = options.option;
  let resolved = resolveChartTheme(options.theme);

  const init = (): EChartsType => {
    const instance = echarts.init(container, resolved === "dark" ? "dark" : undefined, { renderer });
    instance.setOption(currentOption);
    return instance;
  };

  let chart = init();

  return {
    get chart() {
      return chart;
    },
    setOption: (option, opts) => {
      currentOption = option;
      chart.setOption(option, { notMerge: opts?.notMerge ?? false });
    },
    setTheme: (theme) => {
      const next = resolveChartTheme(theme);
      if (next === resolved && !chart.isDisposed()) return;
      resolved = next;
      chart.dispose();
      chart = init();
    },
    resize: () => {
      if (!chart.isDisposed()) chart.resize();
    },
    resolvedTheme: () => resolved,
    destroy: () => {
      if (!chart.isDisposed()) chart.dispose();
    }
  };
}
