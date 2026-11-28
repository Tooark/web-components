// Entry point for the chart package
import "./tag-map";

// Custom Element
export { ArkChart } from "./components";

// Tipos
// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkChartInstance } from "./engine";
export { createChart, resolveChartTheme, resolveTokenColors } from "./engine";
export { registerTooarkChart } from "./register";
export type {
  ArkChartOptions,
  ArkChartPalette,
  ArkChartRenderer,
  ArkChartTheme,
  ArkChartType,
  ArkTokenColorOptions,
  EChartsOption
} from "./types";
