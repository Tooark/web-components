// Tipos
export type {
  ArkChartType,
  ArkChartTheme,
  ArkChartRenderer,
  ArkChartOptions,
  EChartsOption
} from "./types";

// Engine imperativo (uso avançado / sem Custom Element)
export type { ArkChartInstance } from "./engine";
export { createChart, resolveChartTheme } from "./engine";

// Custom Element
export { ArkChart } from "./components";
export { registerTooarkChart } from "./register";
