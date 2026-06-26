import { ArkChart } from "./components";

/**
 * Registra o Custom Element `<ark-chart>` no navegador.
 * Chame antes de usar o componente em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkChart(): void {
  if (!customElements.get(ArkChart.tagName)) {
    customElements.define(ArkChart.tagName, ArkChart);
  }
}
