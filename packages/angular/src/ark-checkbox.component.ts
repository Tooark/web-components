import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-checkbox-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-checkbox
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.checked]="checked ? '' : null"
    [attr.indeterminate]="indeterminate ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.name]="name"
    [attr.value]="value"
    [attr.label]="label"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-checkbox>`
})
export class ArkCheckboxComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  @Input() checked = false;
  /** Estado misto (aria-checked="mixed", traço); o próximo clique o limpa. */
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  /** Nome no formulário (submete `value` quando marcado). */
  @Input() name: string | undefined;
  /** Valor submetido quando marcado. Padrão: "on". */
  @Input() value: string | undefined;
  /** Rótulo próprio (<label for>); sem ele use aria-label ou o conteúdo projetado como rótulo livre. */
  @Input() label: string | undefined;
  @Output() changed = new EventEmitter<CustomEvent<{ checked: boolean }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ checked: boolean }>);
  }
}
