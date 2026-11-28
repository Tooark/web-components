import { type ArkThemeSelected, observeColorScheme } from "@tooark/tokens";
import type { EChartsOption, EChartsType } from "echarts";
import { type ArkChartInstance, createChart } from "../engine";
import type { ArkChartPalette, ArkChartRenderer, ArkChartTheme } from "../types";
import { HTMLElementBase } from "./html-element-base";
import { upgradeProperties } from "./upgrade-properties";

/** Contador do id gerado da descrição, que o `aria-describedby` do host referencia. */
let nextId = 0;

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
 * Atributos: `theme` ("auto" | "light" | "dark"), `palette` ("default" | "tokens":
 * séries, texto, eixos e tooltip nos tokens `--ark-color-*`, fundo transparente), `renderer` ("canvas" | "svg"),
 * `height` (ex.: "320px" | "20rem"), `auto-resize` ("false" desliga) e
 * `testid`. Em `auto` o tema segue o color-scheme da página e acompanha a
 * troca em tempo de execução (`observeColorScheme` de @tooark/tokens). O
 * contêiner do gráfico leva `data-ark="chart"` e o `testid` como
 * `data-testid`. Com `aria-label` (ou `aria-labelledby`) o host vira
 * `role="img"` com esse nome, a menos que o app já tenha dado outro `role`;
 * sem eles nada muda, e a descrição gerada pelo ECharts (`option.aria`)
 * continua disponível. Com nome e `option.aria`, o host aponta para essa
 * descrição por `aria-describedby`.
 *
 * Eventos: dispara `ark-chart-click` (bubbles/composed) ao clicar em uma série,
 * com `detail` = params nativos do ECharts.
 */
export class ArkChart extends HTMLElementBase {
  static readonly tagName = "ark-chart";

  private container: HTMLDivElement | null = null;
  private instance: ArkChartInstance | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private pendingOption: EChartsOption | null = null;
  /** Para de observar o tema da página; só existe com `theme="auto"`. */
  private disposeTheme: (() => void) | null = null;
  /** O `role="img"` do host foi posto pelo componente (e sai com o nome). */
  private ownsRole = false;
  /** O `aria-describedby` do host foi posto pelo componente (descrição gerada pelo ECharts). */
  private ownsDescription = false;
  /** Cópia oculta da descrição gerada pelo ECharts, referenciada pelo `aria-describedby` do host. */
  private descriptionEl: HTMLSpanElement | null = null;
  /** Acompanha o `aria-label` que o ECharts grava no contêiner. */
  private descriptionObserver: MutationObserver | null = null;
  /** O próprio componente está gravando o `aria-describedby` (o callback não troca o dono). */
  private writingDescription = false;

  static get observedAttributes(): string[] {
    return [
      "theme",
      "palette",
      "renderer",
      "height",
      "auto-resize",
      "testid",
      "aria-label",
      "aria-labelledby",
      "aria-describedby"
    ];
  }

  /** Opções nativas do ECharts. Atribuir re-renderiza o gráfico. */
  get option(): EChartsOption | null {
    return this.pendingOption;
  }

  set option(value: EChartsOption | null) {
    this.pendingOption = value;
    if (this.instance && value) {
      this.instance.setOption(value, { notMerge: true });
      this.syncDescription();
    } else if (value) {
      // Conectado sem instância (primeira option) monta agora; desconectado, o connectedCallback monta.
      this.render();
    }
  }

  /** Tema efetivamente aplicado ao gráfico (depois de resolver `auto`); `null` antes de renderizar. */
  get resolvedTheme(): ArkThemeSelected | null {
    return this.instance?.resolvedTheme() ?? null;
  }

  /** Paleta efetivamente aplicada: "tokens" só com o CSS dos tokens na página; `null` antes de renderizar. */
  get resolvedPalette(): ArkChartPalette | null {
    return this.instance?.resolvedPalette() ?? null;
  }

  /**
   * Instância do ECharts (exportar com `getDataURL`/`renderToSVGString`, `dispatchAction`, eventos além do clique);
   * `null` antes de renderizar. Troca quando o gráfico é recriado (`theme`, `palette`, `renderer` ou reconexão): leia
   * na hora de usar, sem guardar.
   */
  get chart(): EChartsType | null {
    return this.instance?.chart ?? null;
  }

  connectedCallback(): void {
    // Uma `option` gravada antes do registro já monta o gráfico ao passar pelo setter.
    upgradeProperties(this);
    this.syncRole();
    if (!this.instance) this.render();
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

    if (name === "testid") {
      this.applyHooks();
      return;
    }

    // Um `aria-describedby` gravado pelo app passa a ser dele: o componente não o troca nem o tira.
    if (name === "aria-describedby") {
      if (!this.writingDescription) this.ownsDescription = false;
      return;
    }

    if (name === "aria-label" || name === "aria-labelledby") {
      this.syncRole();
      return;
    }

    // theme / palette / renderer exigem reconstrução da instância.
    this.render();
  }

  private getTheme(): ArkChartTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    if (value === "light" || value === "dark") return value;
    return "auto";
  }

  private getPalette(): ArkChartPalette {
    return (this.getAttribute("palette") || "").toLowerCase() === "tokens" ? "tokens" : "default";
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
    // Fora do DOM o ECharts iniciaria num contêiner sem largura e deixaria instância e observer sem dono.
    if (!this.pendingOption || !this.isConnected) return;

    this.teardown();

    this.style.display = this.style.display || "block";

    const container = document.createElement("div");
    container.setAttribute("part", "canvas");
    container.style.width = "100%";
    container.style.height = this.getHeight();
    this.appendChild(container);
    this.container = container;
    // O ECharts regrava a descrição gerada a cada atualização dos dados: a cópia do host acompanha.
    this.descriptionObserver = new MutationObserver(() => this.syncDescription());
    this.descriptionObserver.observe(container, { attributes: true, attributeFilter: ["aria-label"] });
    this.applyHooks();

    this.instance = createChart(container, {
      option: this.pendingOption,
      theme: this.getTheme(),
      palette: this.getPalette(),
      renderer: this.getRenderer(),
      // O elemento tem o próprio observer, que o atributo auto-resize liga e desliga em tempo de execução.
      autoResize: false
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
    this.syncThemeObserver();
    this.syncDescription();
  }

  // Com nome, o gráfico inteiro é uma imagem para a tecnologia assistiva (o canvas não tem semântica própria); o
  // `role` do app, se houver, fica como está.
  private syncRole(): void {
    const named = this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby");
    if (named && !this.hasAttribute("role")) {
      this.setAttribute("role", "img");
      this.ownsRole = true;
    } else if (!named && this.ownsRole) {
      this.removeAttribute("role");
      this.ownsRole = false;
    }
    this.syncDescription();
  }

  // Com `option.aria` o ECharts grava a descrição gerada (tipo, título, séries e valores) como `aria-label` do
  // contêiner, que ele também marca `role="img"`. Com o host nomeado, o contêiner é filho de uma imagem e a tecnologia
  // assistiva não o lê: o host passa a apontar para ele por `aria-describedby`, ficando com o nome do app e a
  // descrição do gráfico. Sem nome o contêiner já é lido sozinho; um `aria-describedby` do app fica como está.
  // A referência é um <span hidden> próprio com o mesmo texto, e não o contêiner: o cálculo da descrição de um nó
  // referenciado nem sempre usa o aria-label dele, e o texto de conteúdo entra em todos.
  private syncDescription(): void {
    const text = this.container?.getAttribute("aria-label")?.trim() ?? "";
    const named = this.hasAttribute("aria-label") || this.hasAttribute("aria-labelledby");
    const described = text !== "" && named && this.getAttribute("role") === "img";
    if (described && (this.ownsDescription || !this.hasAttribute("aria-describedby"))) {
      if (!this.descriptionEl) {
        const span = document.createElement("span");
        span.hidden = true;
        span.id = `ark-chart-${++nextId}-description`;
        span.setAttribute("data-ark", "chart-description");
        this.appendChild(span);
        this.descriptionEl = span;
        this.applyHooks();
      }
      if (this.descriptionEl.textContent !== text) this.descriptionEl.textContent = text;
      this.writingDescription = true;
      if (this.getAttribute("aria-describedby") !== this.descriptionEl.id) {
        this.setAttribute("aria-describedby", this.descriptionEl.id);
      }
      this.writingDescription = false;
      this.ownsDescription = true;
    } else if (!described && this.ownsDescription) {
      this.writingDescription = true;
      this.removeAttribute("aria-describedby");
      this.writingDescription = false;
      this.ownsDescription = false;
    }
    if (!this.ownsDescription && this.descriptionEl) {
      this.descriptionEl.remove();
      this.descriptionEl = null;
    }
  }

  // O contêiner leva o hook de E2E, como os componentes de @tooark/web-components (a descrição, o testid sufixado).
  private applyHooks(): void {
    if (!this.container) return;
    this.container.setAttribute("data-ark", "chart");
    const testid = this.getAttribute("testid");
    if (testid) {
      this.container.setAttribute("data-testid", testid);
      this.descriptionEl?.setAttribute("data-testid", `${testid}-description`);
    } else {
      this.container.removeAttribute("data-testid");
      this.descriptionEl?.removeAttribute("data-testid");
    }
  }

  // Em `auto`, a troca de tema da página (classe/atributo em html ou body, preferência do sistema) re-resolve o
  // tema do ECharts; com tema fixo não há o que observar.
  private syncThemeObserver(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.getTheme() !== "auto") return;
    this.disposeTheme = observeColorScheme(this, () => this.instance?.setTheme("auto"));
  }

  private syncAutoResize(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    // Sem ResizeObserver (jsdom e outros ambientes de teste) o gráfico monta sem acompanhar o tamanho, como o engine.
    if (!this.isAutoResize() || !this.container || typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver(() => {
      this.instance?.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  private teardown(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.disposeTheme?.();
    this.disposeTheme = null;
    this.instance?.destroy();
    this.instance = null;
    this.descriptionObserver?.disconnect();
    this.descriptionObserver = null;
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

export default ArkChart;
