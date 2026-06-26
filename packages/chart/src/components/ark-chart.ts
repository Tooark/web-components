import type { EChartsOption } from "echarts";
import { createChart, type ArkChartInstance } from "../engine";
import type { ArkChartRenderer, ArkChartTheme } from "../types";

/**
 * Custom Element que renderiza um gráfico ECharts.
 *
 * Funciona em projetos puros e nos frameworks (React/Angular/Vue) via DOM nativo.
 * As opções do ECharts são passadas pela propriedade `option` (objeto), não por atributo:
 *
 *   const el = document.createElement("ark-chart");
 *   el.option = { xAxis: { type: "category", data: [...] }, series: [...] };
 *   document.body.appendChild(el);
 *
 * Atributos: `theme` ("auto" | "light" | "dark"), `renderer` ("canvas" | "svg"),
 * `height` (ex.: "320px" | "20rem") e `auto-resize` ("false" desliga).
 *
 * Eventos: dispara `ark-chart-click` (bubbles/composed) ao clicar em uma série,
 * com `detail` = params nativos do ECharts.
 */
export class ArkChart extends HTMLElement {
  static readonly tagName = "ark-chart";

  private container: HTMLDivElement | null = null;
  private instance: ArkChartInstance | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private pendingOption: EChartsOption | null = null;

  static get observedAttributes(): string[] {
    return ["theme", "renderer", "height", "auto-resize"];
  }

  /** Opções nativas do ECharts. Atribuir re-renderiza o gráfico. */
  get option(): EChartsOption | null {
    return this.pendingOption;
  }

  set option(value: EChartsOption | null) {
    this.pendingOption = value;
    if (this.instance && value) {
      this.instance.setOption(value, { notMerge: true });
    } else if (value) {
      // Ainda não conectado: aplica no connectedCallback.
      this.render();
    }
  }

  connectedCallback(): void {
    this.render();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    if (name === "height" && this.container) {
      this.container.style.height = this.getHeight();
      this.instance?.resize();
      return;
    }

    if (name === "auto-resize") {
      this.syncAutoResize();
      return;
    }

    // theme / renderer exigem reconstrução da instância.
    this.render();
  }

  private getTheme(): ArkChartTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    if (value === "light" || value === "dark") return value;
    return "auto";
  }

  private getRenderer(): ArkChartRenderer {
    return this.getAttribute("renderer") === "svg" ? "svg" : "canvas";
  }

  private getHeight(): string {
    return this.getAttribute("height")?.trim() || "320px";
  }

  private isAutoResize(): boolean {
    return this.getAttribute("auto-resize") !== "false";
  }

  private render(): void {
    if (!this.pendingOption) return;

    this.teardown();

    this.style.display = this.style.display || "block";

    const container = document.createElement("div");
    container.setAttribute("part", "canvas");
    container.style.width = "100%";
    container.style.height = this.getHeight();
    this.appendChild(container);
    this.container = container;

    this.instance = createChart(container, {
      option: this.pendingOption,
      theme: this.getTheme(),
      renderer: this.getRenderer()
    });

    this.instance.chart.on("click", (params) => {
      this.dispatchEvent(
        new CustomEvent("ark-chart-click", {
          detail: params,
          bubbles: true,
          composed: true
        })
      );
    });

    this.syncAutoResize();
  }

  private syncAutoResize(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (!this.isAutoResize() || !this.container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.instance?.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  private teardown(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.instance?.destroy();
    this.instance = null;
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

export default ArkChart;
