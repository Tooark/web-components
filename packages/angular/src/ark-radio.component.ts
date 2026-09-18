import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-radio-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-radio
    [attr.testid]="testid"
    [attr.checked]="checked ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.name]="name"
    [attr.value]="value"
    [attr.label]="label"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-radio>`
})
export class ArkRadioComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  /** Nome do grupo: agrupa no formulário e para setas/roving tabindex. */
  @Input() name: string | undefined;
  /** Valor submetido e publicado em `change` quando marcado. Padrão: "on". */
  @Input() value: string | undefined;
  /** Rótulo próprio (<label for>); sem ele use aria-label ou o conteúdo projetado como rótulo livre. */
  @Input() label: string | undefined;
  /** Dispara só no radio que ganhou a marca. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}
