import type { ArkChart, EChartsOption } from "@tooark/chart";
import { createChart, resolveTokenColors } from "@tooark/chart";
import { expect, waitFor, within } from "storybook/test";

const meta = {
  title: "Chart/ArkChart",
  parameters: {
    docs: {
      description: {
        component:
          "Gráfico baseado em ECharts exposto como Custom Element <ark-chart>. As opções do ECharts são passadas pela propriedade `option` (objeto). Atributos: theme, palette, renderer, height e auto-resize. Funciona em projetos puros e nos frameworks via DOM nativo."
      }
    }
  },
  argTypes: {
    type: { control: "select", options: ["bar", "line", "pie", "scatter"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    palette: { control: "radio", options: ["default", "tokens"] },
    renderer: { control: "radio", options: ["canvas", "svg"] },
    height: { control: "text" },
    autoResize: { control: "boolean" }
  },
  args: {
    type: "bar",
    theme: "light",
    palette: "default",
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
  palette: "default" | "tokens";
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
          name: "Receita por mês",
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
  if (args.palette === "tokens") el.setAttribute("palette", "tokens");
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

export const FollowsPageTheme = {
  args: {
    theme: "auto"
  },
  parameters: {
    docs: {
      description: {
        story:
          'Em `theme="auto"` o gráfico resolve o color-scheme da página e acompanha a troca em tempo de execução (`observeColorScheme` de @tooark/tokens observa html/body e a preferência do sistema). `resolvedTheme` expõe o lado aplicado.'
      }
    }
  },
  render: renderChart,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const chart = canvasElement.querySelector("ark-chart") as ArkChart;
    const root = document.documentElement;
    const before = root.style.colorScheme;
    try {
      root.style.colorScheme = "light";
      await waitFor(() => expect(chart.resolvedTheme).toBe("light"));
      root.style.colorScheme = "dark";
      await waitFor(() => expect(chart.resolvedTheme).toBe("dark"));
      // Tema fixo ignora a página.
      chart.setAttribute("theme", "light");
      await waitFor(() => expect(chart.resolvedTheme).toBe("light"));
      root.style.colorScheme = "light";
      chart.setAttribute("theme", "auto");
      await waitFor(() => expect(chart.resolvedTheme).toBe("light"));
    } finally {
      root.style.colorScheme = before;
    }
  }
};

// `option` antes de entrar no DOM só fica guardada: o gráfico nasce ao conectar, já com a largura do contêiner.
export const OptionBeforeConnect = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const chart = document.createElement("ark-chart") as ArkChart;
    chart.option = buildOption("bar");
    await expect(chart.querySelector('[part="canvas"]')).toBeNull();
    await expect(chart.resolvedTheme).toBeNull();

    canvasElement.appendChild(chart);
    const canvas = await waitFor(() => chart.querySelector('[part="canvas"]') as HTMLElement);
    await expect(canvas.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(chart.resolvedTheme).not.toBeNull();
  }
};

// Cor do token como o canvas a pinta, para comparar com o que o tema de tokens entregou ao ECharts.
function tokenRgba(token: string, side: "light" | "dark"): string {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color-scheme:${side};color:var(--ark-color-${token})`;
  document.body.appendChild(probe);
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d")!;
  context.fillStyle = getComputedStyle(probe).color;
  context.fillRect(0, 0, 1, 1);
  probe.remove();
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
}

export const TokensPalette = {
  parameters: {
    docs: {
      description: {
        story:
          '`palette="tokens"` monta o tema a partir dos tokens `--ark-color-*`: séries nos intents (primary, info, success, warning, danger, neutral), texto, eixos e legenda em `fg`/`fg-muted`, grade em `border`, tooltip em `surface-raised`, e fundo transparente, que mostra a superfície do card. O lado segue `theme` (o escuro abaixo está numa caixa escura de uma página clara). Sem o CSS dos tokens na página cai no padrão do ECharts; `resolvedPalette` diz qual valeu, e `option.color` do app continua vencendo.'
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4";
    const make = (palette: "default" | "tokens", theme: "light" | "dark"): HTMLElement => {
      const box = document.createElement("div");
      box.className = "rounded-lg border p-3";
      box.style.borderColor = "var(--ark-color-border)";
      box.style.colorScheme = theme;
      box.style.background = "var(--ark-color-surface)";
      const title = document.createElement("p");
      title.className = "text-sm mb-2";
      title.style.color = "var(--ark-color-fg-muted)";
      title.textContent = `palette="${palette}" theme="${theme}"`;
      const chart = document.createElement("ark-chart") as ArkChart;
      chart.setAttribute("theme", theme);
      if (palette === "tokens") chart.setAttribute("palette", "tokens");
      chart.setAttribute("height", "240px");
      chart.dataset.case = `${palette}-${theme}`;
      chart.option = buildOption("bar");
      box.append(title, chart);
      return box;
    };
    wrap.append(make("default", "light"), make("tokens", "light"), make("tokens", "dark"));
    const engine = document.createElement("div");
    engine.dataset.role = "engine";
    engine.style.cssText = "width: 320px; height: 200px;";
    wrap.appendChild(engine);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const byCase = (name: string): ArkChart =>
      canvasElement.querySelector(`ark-chart[data-case="${name}"]`) as ArkChart;
    await waitFor(() => expect(byCase("tokens-light").resolvedPalette).toBe("tokens"));
    await expect(byCase("default-light").resolvedPalette).toBe("default");
    await expect(byCase("tokens-dark").resolvedPalette).toBe("tokens");

    const box = canvasElement.querySelector('[data-role="engine"]') as HTMLElement;
    const instance = createChart(box, { option: buildOption("bar"), theme: "light", palette: "tokens" });
    try {
      const option = (): { color: string[]; backgroundColor: unknown } =>
        instance.chart.getOption() as unknown as { color: string[]; backgroundColor: unknown };
      await expect(instance.resolvedPalette()).toBe("tokens");
      // Séries nos intents, em rgba (o info é oklch nos tokens e chega convertido), e fundo transparente.
      await expect(option().color.slice(0, 6)).toEqual(
        ["primary", "info", "success", "warning", "danger", "neutral"].map((token) => tokenRgba(token, "light"))
      );
      await expect(option().color[1]).toMatch(/^rgba\(\d+, \d+, \d+, 1\)$/);
      await expect(option().backgroundColor).toBe("transparent");

      // O lado escuro vem do theme, mesmo numa página clara.
      instance.setTheme("dark");
      await expect(option().color[0]).toBe(tokenRgba("primary", "dark"));
      await expect(option().color[0]).not.toBe(tokenRgba("primary", "light"));

      // option.color do app vence o tema.
      instance.setOption({ ...buildOption("bar"), color: ["#123456"] }, { notMerge: true });
      await expect(option().color).toEqual(["#123456"]);

      // De volta ao padrão: paleta do ECharts e tema dark embutido.
      instance.setPalette("default");
      await expect(instance.resolvedPalette()).toBe("default");
    } finally {
      instance.destroy();
    }

    // Sem os tokens na página (aqui, anulados no contêiner) o tema de tokens não monta e vale o padrão.
    box.style.setProperty("--ark-color-primary", "initial");
    const bare = createChart(box, { option: buildOption("bar"), theme: "light", palette: "tokens" });
    try {
      await expect(bare.resolvedPalette()).toBe("default");
    } finally {
      bare.destroy();
    }

    // O atributo troca em tempo de execução, e a sonda não fica no DOM.
    const chart = byCase("tokens-light");
    chart.removeAttribute("palette");
    await waitFor(() => expect(chart.resolvedPalette).toBe("default"));
    chart.setAttribute("palette", "tokens");
    await waitFor(() => expect(chart.resolvedPalette).toBe("tokens"));
    await expect(chart.querySelectorAll("span[aria-hidden]").length).toBe(0);
  }
};

// Contraste WCAG entre duas cores `rgb()`/`rgba()` opacas.
function contrast(a: string, b: string): number {
  const luminance = (color: string): number => {
    const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((part) => {
      const v = Number(part) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Gauge e radar em `palette="tokens"`: os textos e as linhas deles não seguem os eixos do tema, e no lado escuro
// ficavam nos cinzas do tema claro do ECharts, quase invisíveis sobre a superfície escura. Agora seguem os tokens, e as
// cores que o app dá na `option` continuam vencendo.
export const TokensPaletteGaugeAndRadar = {
  render: () => {
    const box = document.createElement("div");
    box.className = "rounded-lg border p-3";
    box.style.cssText =
      "width: 560px; height: 260px; color-scheme: dark; background: var(--ark-color-surface); border-color: var(--ark-color-border);";
    return box;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const box = canvasElement.firstElementChild as HTMLElement;
    const option: EChartsOption = {
      radar: {
        center: ["74%", "55%"],
        radius: "60%",
        indicator: [
          { name: "Velocidade", max: 100 },
          { name: "Custo", max: 100 },
          { name: "Qualidade", max: 100 }
        ]
      },
      series: [
        { type: "gauge", center: ["26%", "55%"], radius: "80%", data: [{ value: 72, name: "Cobertura" }] },
        { type: "radar", data: [{ value: [80, 40, 65], name: "Sprint" }] }
      ]
    };
    const instance = createChart(box, { option, theme: "dark", palette: "tokens" });
    try {
      type Line = { lineStyle: { color: unknown } };
      const read = () => {
        const merged = instance.chart.getOption() as unknown as {
          series: { axisLabel: { color: string }; title: { color: string }; detail: { color: string } } & Record<
            "axisLine" | "axisTick" | "splitLine",
            Line
          >[];
          radar: ({ axisName: { color: string }; splitArea: { areaStyle: { color: unknown } } } & Record<
            "axisLine" | "splitLine",
            Line
          >)[];
        };
        return { gauge: merged.series[0], radar: merged.radar[0] };
      };
      const fg = tokenRgba("fg", "dark");
      const muted = tokenRgba("fg-muted", "dark");
      const border = tokenRgba("border", "dark");
      const surface = tokenRgba("surface", "dark");
      const { gauge, radar } = read();
      // Antes: rótulos e título em #54555a (2,4:1 sobre a superfície), o valor em #3c3c41 (1,6:1), trilha e faixas
      // claras do tema claro.
      await expect(gauge.axisLabel.color).toBe(muted);
      await expect(gauge.title.color).toBe(muted);
      await expect(gauge.detail.color).toBe(fg);
      await expect(gauge.axisTick.lineStyle.color).toBe(muted);
      await expect(gauge.splitLine.lineStyle.color).toBe(muted);
      await expect(gauge.axisLine.lineStyle.color).toEqual([[1, border]]);
      await expect(radar.axisName.color).toBe(muted);
      await expect(radar.axisLine.lineStyle.color).toBe(border);
      await expect(radar.splitLine.lineStyle.color).toBe(border);
      await expect(radar.splitArea.areaStyle.color).toEqual([tokenRgba("surface-muted", "dark"), "transparent"]);
      // Texto legível sobre a superfície escura.
      await expect(contrast(muted, surface)).toBeGreaterThanOrEqual(4.5);

      // As cores da `option` vencem o tema: as faixas do medidor e o nome dos eixos do radar.
      const bands: [number, string][] = [
        [0.5, "#16a34a"],
        [1, "#dc2626"]
      ];
      instance.setOption(
        {
          ...option,
          radar: { ...(option.radar as object), axisName: { color: "#123456" } },
          series: [
            {
              type: "gauge",
              center: ["26%", "55%"],
              axisLine: { lineStyle: { color: bands } },
              data: [{ value: 72, name: "Cobertura" }]
            },
            { type: "radar", data: [{ value: [80, 40, 65], name: "Sprint" }] }
          ]
        },
        { notMerge: true }
      );
      await expect(read().gauge.axisLine.lineStyle.color).toEqual(bands);
      await expect(read().radar.axisName.color).toBe("#123456");
      await expect(read().gauge.axisLabel.color).toBe(muted);
    } finally {
      instance.destroy();
    }
  }
};

// resolveTokenColors: as cores dos tokens prontas para a `option` (a série "Aprovado" no intent success), no lado pedido
// ou no da página, lidas onde o app manda (um override de marca vale ali), sem deixar sonda na página; `null` onde o
// CSS dos tokens não chega, e "" para um nome que não é token.
export const ResolveTokenColors = {
  render: () => {
    const wrap = document.createElement("div");
    const branded = document.createElement("div");
    branded.dataset.case = "branded";
    branded.style.setProperty("--ark-color-success", "rgb(1, 2, 3)");
    const bare = document.createElement("div");
    bare.dataset.case = "bare";
    // Um custom property `initial` fica vazio, como numa página sem o CSS dos tokens.
    bare.style.setProperty("--ark-color-primary", "initial");
    wrap.append(branded, bare);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const spans = document.querySelectorAll("span").length;
    const tokens = ["success", "danger", "fg", "surface-muted"] as const;
    for (const side of ["light", "dark"] as const) {
      const colors = resolveTokenColors(tokens, { theme: side });
      await expect(colors).not.toBeNull();
      for (const token of tokens) await expect(colors![token]).toBe(tokenRgba(token, side));
    }
    await expect(document.querySelectorAll("span").length).toBe(spans);

    // Sem `theme`, o lado da página (a Storybook segue o sistema, então compara com o lado que a página resolve).
    const pageSide = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    await expect(resolveTokenColors(["success"])?.success).toBe(tokenRgba("success", pageSide));

    const branded = canvasElement.querySelector<HTMLElement>('[data-case="branded"]')!;
    await expect(resolveTokenColors(["success"], { theme: "light", element: branded })?.success).toBe(
      "rgba(1, 2, 3, 1)"
    );
    await expect(resolveTokenColors(["nao-existe", "fg"], { theme: "light" })).toEqual({
      "nao-existe": "",
      fg: tokenRgba("fg", "light")
    });

    const bare = canvasElement.querySelector<HTMLElement>('[data-case="bare"]')!;
    await expect(resolveTokenColors(["success"], { element: bare })).toBeNull();
    await expect(bare.childElementCount).toBe(0);
  }
};

// `chart` entrega a instância do ECharts, para exportar (PNG no canvas, SVG no svg) e para o resto da API; `null` antes
// de renderizar e fora do DOM, e a instância nova depois de uma troca que recria o gráfico.
export const ChartInstance = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = document.createElement("ark-chart") as ArkChart;
    el.setAttribute("height", "200px");
    el.setAttribute("theme", "light");
    await expect(el.chart).toBeNull();
    el.option = buildOption("bar");
    await expect(el.chart).toBeNull();

    canvasElement.appendChild(el);
    const first = el.chart!;
    await expect(Boolean(first.isDisposed())).toBe(false);
    await expect(first.getDom()).toBe(el.querySelector('[data-ark="chart"]'));
    await expect(first.getDataURL({ type: "png" })).toMatch(/^data:image\/png;base64,/);

    el.setAttribute("renderer", "svg");
    await expect(first.isDisposed()).toBe(true);
    await expect(el.chart!.renderToSVGString()).toMatch(/^<svg/);

    el.setAttribute("theme", "dark");
    await expect(Boolean(el.chart!.isDisposed())).toBe(false);
    await expect(el.chart!.getDom()).toBe(el.querySelector('[data-ark="chart"]'));

    el.remove();
    await expect(el.chart).toBeNull();
  }
};

// Engine sem o elemento: autoResize (padrão) acompanha o tamanho do container.
export const EngineAutoResize = {
  render: () => {
    const box = document.createElement("div");
    box.style.width = "320px";
    box.style.height = "200px";
    return box;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const box = canvasElement.firstElementChild as HTMLElement;
    const instance = createChart(box, { option: buildOption("line") });
    try {
      await expect(instance.chart.getWidth()).toBe(320);
      box.style.width = "480px";
      await waitFor(() => expect(instance.chart.getWidth()).toBe(480));
    } finally {
      instance.destroy();
    }
  }
};

// Sem ResizeObserver (jsdom e outros ambientes de teste) o elemento monta e troca de tema como sempre, só sem
// acompanhar o tamanho; antes a primeira `option` lançava ReferenceError e o tema `auto` ficava sem observador.
export const WithoutResizeObserver = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const original = Object.getOwnPropertyDescriptor(window, "ResizeObserver");
    Object.defineProperty(window, "ResizeObserver", { value: undefined, configurable: true, writable: true });
    try {
      const chart = document.createElement("ark-chart") as ArkChart;
      chart.setAttribute("height", "200px");
      chart.setAttribute("theme", "light");
      canvasElement.appendChild(chart);
      // Conectado e sem instância: a primeira `option` monta o gráfico aqui mesmo, e um erro sairia nesta linha.
      chart.option = buildOption("bar");
      await expect(chart.resolvedTheme).toBe("light");
      await expect(chart.querySelector('[data-ark="chart"] canvas')).not.toBeNull();

      chart.setAttribute("auto-resize", "false");
      chart.setAttribute("auto-resize", "true");
      chart.setAttribute("theme", "dark");
      await expect(chart.resolvedTheme).toBe("dark");
    } finally {
      if (original) Object.defineProperty(window, "ResizeObserver", original);
    }
  }
};

// Hooks de E2E: o contêiner do gráfico leva `data-ark="chart"` e o `testid` como `data-testid`.
export const TestHooks = {
  render: () => {
    const chart = document.createElement("ark-chart") as ArkChart;
    chart.setAttribute("height", "200px");
    chart.setAttribute("testid", "vendas");
    chart.option = buildOption("bar");
    return chart;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const chart = canvasElement.querySelector("ark-chart") as ArkChart;
    const container = await waitFor(() => within(canvasElement).getByTestId("vendas"));
    await expect(container).toHaveAttribute("data-ark", "chart");
    await expect(container).toBe(chart.querySelector('[part="canvas"]'));

    chart.setAttribute("testid", "receita");
    await expect(container).toHaveAttribute("data-testid", "receita");
    chart.removeAttribute("testid");
    await expect(container.hasAttribute("data-testid")).toBe(false);
    await expect(container).toHaveAttribute("data-ark", "chart");
  }
};

// Nome acessível: com `aria-label` o host vira `role="img"` com esse nome (o canvas não tem semântica própria); sem ele
// nada muda, e um `role` do app fica como está.
export const AccessibleName = {
  render: () => {
    const chart = document.createElement("ark-chart") as ArkChart;
    chart.setAttribute("height", "200px");
    chart.setAttribute("aria-label", "Vendas por dia da semana");
    chart.option = buildOption("bar");
    return chart;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const chart = canvasElement.querySelector("ark-chart") as ArkChart;
    await expect(canvas.getByRole("img", { name: "Vendas por dia da semana" })).toBe(chart);

    chart.setAttribute("aria-label", "Receita");
    await expect(canvas.getByRole("img", { name: "Receita" })).toBe(chart);
    chart.removeAttribute("aria-label");
    await expect(chart.hasAttribute("role")).toBe(false);

    // O `role` que o app deu fica, com ou sem nome.
    chart.setAttribute("role", "figure");
    chart.setAttribute("aria-label", "Receita");
    await expect(chart).toHaveAttribute("role", "figure");
    chart.removeAttribute("aria-label");
    await expect(chart).toHaveAttribute("role", "figure");
  }
};
