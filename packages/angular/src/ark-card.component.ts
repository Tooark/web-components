import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkCardPadding, ArkRounded, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-card-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-card
    [attr.testid]="testid"
    [attr.heading]="heading"
    [attr.padding]="padding"
    [attr.rounded]="rounded"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-card>`
})
export class ArkCardComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Título (h2) na linha de cima; com ele o filho slot="header" vira a linha seguinte do cabeçalho. */
  @Input() heading: string | undefined;
  /** Espaçamento interno (padding e gap). Padrão: "md". */
  @Input() padding: ArkCardPadding | undefined;
  /** Raio dos cantos. Padrão: "lg". */
  @Input() rounded: ArkRounded | undefined;
  @Input() theme: ArkTheme = "auto";
}
