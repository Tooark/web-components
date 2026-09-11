import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-switch-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-switch
    [attr.testid]="testid"
    [attr.checked]="checked ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.labels]="labels ? '' : null"
    [attr.icons]="icons ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.color]="color"
    [attr.name]="name"
    [attr.value]="value"
    [attr.label]="label"
    [attr.label-on]="labelOn"
    [attr.label-off]="labelOff"
    (change)="onChange($event)">
  </ark-switch>`
})
export class ArkSwitchComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() labels = false;
  @Input() icons = false;
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() color: string | undefined;
  @Input() name: string | undefined;
  @Input() value: string | undefined;
  @Input() label: string | undefined;
  @Input() labelOn: string | undefined;
  @Input() labelOff: string | undefined;
  @Output() changed = new EventEmitter<CustomEvent<{ checked: boolean }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ checked: boolean }>);
  }
}
