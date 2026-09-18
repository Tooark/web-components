import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkTheme, ArkTooltipSide } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-tooltip-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-tooltip
    [attr.testid]="testid"
    [attr.content]="content"
    [attr.side]="side"
    [attr.delay]="delay"
    [attr.open]="open ? '' : null"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-tooltip>`
})
export class ArkTooltipComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Texto do balão; para conteúdo rico, projete um filho com slot="content". */
  @Input() content: string | undefined;
  /** Lado do gatilho; vira quando não cabe. Padrão: "top". */
  @Input() side: ArkTooltipSide = "top";
  /** Atraso em ms antes de abrir no hover; o foco abre na hora. Padrão: 200. */
  @Input() delay: number | undefined;
  /** Aberto; refletido do estado do balão. */
  @Input() open = false;
  @Input() theme: ArkTheme = "auto";
}
