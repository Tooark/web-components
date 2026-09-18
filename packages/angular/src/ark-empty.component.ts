import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkTheme } from "@tooark/core";
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

  @Input() testid: string | undefined;
  /** Título (h3). */
  @Input() heading: string | undefined;
  /** Texto abaixo do título. */
  @Input() description: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
