import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import { type ArkChart as ArkChartElement, type EChartsOption, registerTooarkChart } from "@tooark/chart";

// Entry point @tooark/angular/chart: fora da entrada principal para que o ECharts (peer do @tooark/chart) só entre no
// app que importa este caminho.
@Component({
  selector: "ark-chart-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-chart
    [attr.testid]="testid"
    [attr.theme]="theme"
    [attr.palette]="palette"
    [attr.renderer]="renderer"
    [attr.height]="height"
    [attr.auto-resize]="autoResize === false ? 'false' : null"
    [attr.aria-label]="ariaLabel"
    [option]="option"
    (ark-chart-click)="clickHandler($event)"></ark-chart>`
})
export class ArkChartComponent {
  constructor() {
    registerTooarkChart();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-chart` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkChartElement | null {
    return this.host.nativeElement.querySelector<ArkChartElement>(":scope > ark-chart");
  }

  @Input() testid: string | undefined;
  /** Opções nativas do ECharts, pela propriedade (só com referência nova; cada uma re-renderiza com notMerge). */
  @Input() option: EChartsOption | null = null;
  /** auto (segue o color-scheme da página), light ou dark. Padrão: "auto". */
  @Input() theme: "auto" | "light" | "dark" | undefined;
  /** default ou tokens (cores dos tokens `--ark-color-*`, @tooark/chart 1.7+). Padrão: "default". */
  @Input() palette: "default" | "tokens" | undefined;
  @Input() renderer: "canvas" | "svg" | undefined;
  /** Altura (comprimento CSS). Padrão: "320px". */
  @Input() height: string | undefined;
  /** false desliga o redimensionamento junto com o contêiner. Padrão: true. */
  @Input() autoResize: boolean | undefined;
  /** Nome do gráfico como imagem (`role="img"`). */
  @Input() ariaLabel: string | undefined;
  /** Clique numa série, com os params nativos do ECharts em `detail`. */
  @Output() chartClick = new EventEmitter<CustomEvent>();

  protected clickHandler = (event: Event) => this.chartClick.emit(event as CustomEvent);
}
