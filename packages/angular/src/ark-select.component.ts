import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkIntent, ArkRounded, ArkSelectOption, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-select-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-select
    [attr.testid]="testid"
    [attr.label]="label"
    [attr.placeholder]="placeholder"
    [attr.options]="optionsStr"
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
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-select>`
})
export class ArkSelectComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() label: string | undefined;
  @Input() placeholder: string | undefined;
  @Input() options: ArkSelectOption[] | undefined;
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
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();

  get optionsStr(): string | undefined {
    return this.options ? JSON.stringify(this.options) : undefined;
  }

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}
