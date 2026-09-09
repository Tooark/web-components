import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from "@angular/core";
import type { ArkIntent, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-input-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-input
    [attr.testid]="testid"
    [attr.type]="type"
    [attr.label]="label"
    [attr.placeholder]="placeholder"
    [attr.value]="value"
    [attr.name]="name"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.rounded]="rounded"
    [attr.helper]="helper"
    [attr.error]="error ? '' : null"
    [attr.error-message]="errorMessage"
    [attr.disabled]="disabled ? '' : null"
    [attr.required]="required ? '' : null"
    [attr.readonly]="readonly ? '' : null">
    <ng-content></ng-content>
  </ark-input>`
})
export class ArkInputComponent {
  constructor () {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() type = "text";
  @Input() label: string | undefined;
  @Input() placeholder: string | undefined;
  @Input() value: string | undefined;
  @Input() name: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() rounded: ArkRounded = "lg";
  @Input() helper: string | undefined;
  @Input() error = false;
  @Input() errorMessage: string | undefined;
  @Input() disabled = false;
  @Input() required = false;
  @Input() readonly = false;
}
