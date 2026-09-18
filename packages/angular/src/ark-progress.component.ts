import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-progress-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-progress
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.max]="max"
    [attr.indeterminate]="indeterminate ? '' : null"
    [attr.label]="label"
    [attr.show-value]="showValue ? '' : null"
    [attr.intent]="intent"
    [attr.size]="size"
    [attr.theme]="theme">
  </ark-progress>`
})
export class ArkProgressComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Valor atual, de 0 a max. Padrão: 0. */
  @Input() value: number | undefined;
  /** Valor máximo. Padrão: 100. */
  @Input() max: number | undefined;
  /** Segmento em loop no lugar do valor (loader contínuo, isento de movimento reduzido). */
  @Input() indeterminate = false;
  /** Nome acessível (aria-label). */
  @Input() label: string | undefined;
  /** Mostra a porcentagem ao lado do trilho. */
  @Input() showValue = false;
  @Input() intent: ArkIntent = "primary";
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
}
