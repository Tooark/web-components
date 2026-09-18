import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkRounded, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-skeleton-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-skeleton
    [attr.testid]="testid"
    [attr.rows]="rows"
    [attr.animated]="animated ? '' : null"
    [attr.rounded]="rounded"
    [attr.color]="color"
    [attr.ratio]="ratio"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-skeleton>`
})
export class ArkSkeletonComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Número de barras; acima de 1 troca o bloco por barras em coluna. Padrão: 1. */
  @Input() rows: number | undefined;
  /** Liga o brilho que varre (opt-in; para sob movimento reduzido). */
  @Input() animated = false;
  /** Raio dos cantos. Padrão: o do preset (lg). */
  @Input() rounded: ArkRounded | undefined;
  /** Cor base própria (qualquer cor CSS) no lugar de muted. */
  @Input() color: string | undefined;
  /** Proporção do bloco ("16/9", "1/1"...): a altura vem da largura. Ignorado com rows. */
  @Input() ratio: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
