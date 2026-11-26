// Tema do ECharts a partir dos tokens --ark-color-* (palette="tokens"). Os tokens só existem no CSS compilado
// (@tooark/core/styles.css ou @tooark/web-components/styles.css) e são light-dark(): getPropertyValue devolve o texto
// cru, então cada cor é lida num nó-sonda com `color: var(...)`, que resolve o lado pelo color-scheme. A maioria
// computa para oklch(), que o parser do zrender não lê (as cores derivadas, como a ênfase ao passar o mouse, sairiam
// erradas): o canvas pinta o pixel e devolve sRGB.
import type { ArkThemeSelected } from "@tooark/tokens";

/** Cores das séries, na ordem: o ECharts repete a partir da sétima, e o `option.color` do app vence. */
const SERIES_TOKENS = ["primary", "info", "success", "warning", "danger", "neutral"] as const;

/** Cor CSS em `rgba()` sRGB de 8 bits, como o canvas a pinta (todas no mesmo formato, de hex, rgb ou oklch). */
function toRgba(color: string, context: CanvasRenderingContext2D | null): string {
  if (!context) return color;
  context.clearRect(0, 0, 1, 1);
  // Uma cor que o canvas não aceite deixa o fillStyle anterior: transparente, e não a cor da leitura de antes.
  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 1000) / 1000})`;
}

/**
 * Tema do ECharts com as cores dos tokens `--ark-color-*` lidas em `element`, no lado `side`: séries nos intents
 * (primary, info, success, warning, danger, neutral), texto, eixos e legenda em `fg`/`fg-muted`, grade em `border`,
 * tooltip em `surface-raised` e fundo transparente; gauge e radar com os mesmos textos e linhas, e as faixas do radar em
 * `surface-muted`. `null` sem o CSS dos tokens na página.
 */
export function tokensChartTheme(element: HTMLElement, side: ArkThemeSelected): Record<string, unknown> | null {
  if (typeof getComputedStyle !== "function") return null;
  if (!getComputedStyle(element).getPropertyValue("--ark-color-primary").trim()) return null;

  const probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;color-scheme:${side}`;
  element.appendChild(probe);
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const read = (token: string): string => {
    probe.style.color = `var(--ark-color-${token})`;
    return toRgba(getComputedStyle(probe).color, context);
  };

  try {
    const fg = read("fg");
    const muted = read("fg-muted");
    const border = read("border");
    const axis = {
      axisLine: { lineStyle: { color: border } },
      axisTick: { lineStyle: { color: border } },
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: [border] } },
      nameTextStyle: { color: muted }
    };
    return {
      darkMode: side === "dark",
      // Sem fundo próprio: aparece a superfície do card ou da página (o tema dark embutido pinta um fundo opaco).
      backgroundColor: "transparent",
      color: SERIES_TOKENS.map(read),
      textStyle: { color: fg },
      title: { textStyle: { color: fg }, subtextStyle: { color: muted } },
      legend: { textStyle: { color: muted }, pageTextStyle: { color: muted } },
      tooltip: { backgroundColor: read("surface-raised"), borderColor: border, textStyle: { color: fg } },
      // Gauge e radar não seguem os eixos acima: sem as chaves próprias, os textos e as linhas ficavam nos cinzas do
      // tema claro do ECharts, ilegíveis no lado escuro (as mesmas chaves que o tema dark embutido troca).
      gauge: {
        axisLabel: { color: muted },
        axisTick: { lineStyle: { color: muted } },
        splitLine: { lineStyle: { color: muted } },
        axisLine: { lineStyle: { color: [[1, border]] } },
        title: { color: muted },
        detail: { color: fg }
      },
      // O tema `radar` também entra na série radar do ECharts, que ignora estas chaves de coordenada.
      radar: {
        axisName: { color: muted },
        axisLine: { lineStyle: { color: border } },
        splitLine: { lineStyle: { color: border } },
        splitArea: { areaStyle: { color: [read("surface-muted"), "transparent"] } }
      },
      categoryAxis: axis,
      valueAxis: axis,
      logAxis: axis,
      timeAxis: axis
    };
  } finally {
    probe.remove();
  }
}
