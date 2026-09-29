import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkStatusDot as ArkStatusDotElement } from "@tooark/web-components";
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-status-dot` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkStatusDotElement | null {
    return this.host.nativeElement.querySelector<ArkStatusDotElement>(":scope > ark-status-dot");
  }

  @Input() testid: string | undefined;
  /** Cor do ponto. Padrão: "neutral". */
  @Input() intent: ArkIntent = "neutral";
  /** Com rótulo o ponto vira role="img" nomeado; sem ele é decorativo (aria-hidden). */
  @Input() label: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
}
