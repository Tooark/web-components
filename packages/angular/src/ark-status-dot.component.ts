import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-status-dot-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-status-dot
    [attr.testid]="testid"
    [attr.intent]="intent"
    [attr.label]="label"
    [attr.size]="size"
    [attr.theme]="theme">
  </ark-status-dot>`
})
export class ArkStatusDotComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Cor do ponto. Padrão: "neutral". */
  @Input() intent: ArkIntent = "neutral";
  /** Com rótulo o ponto vira role="img" nomeado; sem ele é decorativo (aria-hidden). */
  @Input() label: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
}
