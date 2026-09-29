import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkSize, ArkTheme } from "@tooark/core";
import type { ArkKbd as ArkKbdElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-kbd-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-kbd
    [attr.testid]="testid"
    [attr.size]="size"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-kbd>`
})
export class ArkKbdComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-kbd` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkKbdElement | null {
    return this.host.nativeElement.querySelector<ArkKbdElement>(":scope > ark-kbd");
  }

  @Input() testid: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
}
