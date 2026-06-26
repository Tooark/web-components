import type { ArkChart } from "@tooark/chart";
import type { EChartsOption } from "@tooark/chart";

const meta = {
  title: "Chart/ArkChart",
  parameters: {
    docs: {
      description: {
        component:
          "Grafico baseado em ECharts exposto como Custom Element <ark-chart>. As opcoes do ECharts sao passadas pela propriedade `option` (objeto). Atributos: theme, renderer, height e auto-resize. Funciona em projetos puros e nos frameworks via DOM nativo."
      }
    }
  },
  argTypes: {
    type: { control: "select", options: ["bar", "line", "pie", "scatter"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    renderer: { control: "radio", options: ["canvas", "svg"] },
    height: { control: "text" },
    autoResize: { control: "boolean" }
  },
  args: {
    type: "bar",
    theme: "light",
    renderer: "canvas",
    height: "360px",
    autoResize: true
  }
};

export default meta;

type ChartType = "bar" | "line" | "pie" | "scatter";

type StoryArgs = {
  type: ChartType;
  theme: "auto" | "light" | "dark";
  renderer: "canvas" | "svg";
  height: string;
  autoResize: boolean;
};

const categories = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const revenue = [820, 932, 901, 1290, 1330, 1520];
const cost = [620, 700, 680, 910, 980, 1100];

function buildOption(type: ChartType): EChartsOption {
  const base: EChartsOption = {
    tooltip: { trigger: type === "pie" ? "item" : "axis" },
    legend: { top: 0 },
    grid: { left: 48, right: 24, top: 40, bottom: 32 }
  };

  if (type === "pie") {
    return {
      ...base,
      grid: undefined,
      series: [
        {
          name: "Receita por mes",
          type: "pie",
          radius: ["40%", "70%"],
          itemStyle: { borderRadius: 8, borderWidth: 2 },
          data: categories.map((name, i) => ({ name, value: revenue[i] }))
        }
      ]
    };
  }

  if (type === "scatter") {
    return {
      ...base,
      xAxis: { type: "value", name: "Custo" },
      yAxis: { type: "value", name: "Receita" },
      series: [
        {
          name: "Custo x Receita",
          type: "scatter",
          symbolSize: 16,
          data: cost.map((c, i) => [c, revenue[i]])
        }
      ]
    };
  }

  return {
    ...base,
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series: [
      { name: "Receita", type, data: revenue, smooth: type === "line" },
      { name: "Custo", type, data: cost, smooth: type === "line" }
    ]
  };
}

function renderChart(args: StoryArgs): HTMLElement {
  const el = document.createElement("ark-chart") as ArkChart;
  el.setAttribute("theme", args.theme);
  el.setAttribute("renderer", args.renderer);
  el.setAttribute("height", args.height);
  el.setAttribute("auto-resize", String(args.autoResize));

  el.style.display = "block";
  el.style.width = "640px";
  el.style.maxWidth = "100%";

  el.option = buildOption(args.type);

  el.addEventListener("ark-chart-click", (event) => {
    console.log("ark-chart-click", (event as CustomEvent).detail);
  });

  return el;
}

export const Playground = {
  render: renderChart
};

export const LineDark = {
  args: {
    type: "line",
    theme: "dark"
  },
  render: renderChart
};

export const Pie = {
  args: {
    type: "pie"
  },
  render: renderChart
};

export const ScatterSvg = {
  args: {
    type: "scatter",
    renderer: "svg"
  },
  render: renderChart
};
