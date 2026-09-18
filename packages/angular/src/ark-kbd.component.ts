import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkSize, ArkTheme } from "@tooark/core";
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

  @Input() testid: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
}
