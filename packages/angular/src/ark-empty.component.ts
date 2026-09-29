import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkTheme } from "@tooark/core";
import type { ArkEmpty as ArkEmptyElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-empty-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-empty
    [attr.testid]="testid"
    [attr.heading]="heading"
    [attr.description]="description"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-empty>`
})
export class ArkEmptyComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-empty` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkEmptyElement | null {
    return this.host.nativeElement.querySelector<ArkEmptyElement>(":scope > ark-empty");
  }

  @Input() testid: string | undefined;
  /** Título (h3). */
  @Input() heading: string | undefined;
  /** Texto abaixo do título. */
  @Input() description: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
