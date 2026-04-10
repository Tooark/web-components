import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from "@angular/core";
import type { ArkSize, ArkButtonType, ArkButtonVariant, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

ensureTooarkComponentsRegistered();

@Component({
  selector: "ark-button-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-button
    [attr.type]="type"
    [attr.disabled]="disabled ? '' : null"
    [attr.variant]="variant"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.color]="color"
    [attr.text-color]="textColor"
    [attr.size]="size">
    <ng-content></ng-content>
  </ark-button>`
})
export class ArkButtonComponent {
  @Input() type: ArkButtonType = "button";
  @Input() disabled = false;
  @Input() variant: ArkButtonVariant = "primary";
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() color: string | undefined;
  @Input() textColor: string | undefined;
}
