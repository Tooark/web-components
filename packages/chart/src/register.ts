import { ArkChart } from "./components";

/**
 * Registra o Custom Element `<ark-chart>` no navegador.
 * Chame antes de usar o componente em qualquer ambiente (puro, React, Angular, Vue).
 */
export function registerTooarkChart(): void {
  // Fora do navegador (SSR) não há registro de elementos: no-op, e o cliente registra na hidratação.
  if (typeof customElements === "undefined") return;
  if (!customElements.get(ArkChart.tagName)) {
    customElements.define(ArkChart.tagName, ArkChart);
  }
}
