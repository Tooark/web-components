import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkTheme, ArkToastPosition } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-toaster-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-toaster
    [attr.testid]="testid"
    [attr.theme]="theme"
    [attr.position]="position"
    [attr.max-visible]="maxVisible"
    [attr.duration]="duration"
    [attr.rich-colors]="richColors ? '' : null"
    [attr.close-button]="closeButton ? null : 'false'">
  </ark-toaster>`
})
export class ArkToasterComponent {
  constructor () {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() position: ArkToastPosition = "bottom-right";
  @Input() richColors = false;
  @Input() closeButton = true;
  @Input() maxVisible = 4;
  @Input() duration = 4000;
}
