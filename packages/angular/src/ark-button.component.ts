import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkButtonType, ArkButtonVariant, ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-button-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-button
    [attr.testid]="testid"
    [attr.type]="type"
    [attr.disabled]="disabled ? '' : null"
    [attr.loading]="loading ? '' : null"
    [attr.icon-only]="iconOnly ? '' : null"
    [attr.full-width]="fullWidth ? '' : null"
    [attr.variant]="variant"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.rounded]="rounded"
    [attr.href]="href"
    [attr.target]="target"
    [attr.color]="color"
    [attr.text-color]="textColor"
    [attr.size]="size">
    <ng-content></ng-content>
  </ark-button>`
})
export class ArkButtonComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() type: ArkButtonType = "button";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() iconOnly = false;
  @Input() fullWidth = false;
  @Input() variant: ArkButtonVariant = "primary";
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() rounded: ArkRounded = "md";
  @Input() href: string | undefined;
  @Input() target: string | undefined;
  @Input() color: string | undefined;
  @Input() textColor: string | undefined;
}
