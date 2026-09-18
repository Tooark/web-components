import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkLang, ArkMarkShape, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-shape-picker-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-shape-picker
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.color]="color"
    [attr.label]="label"
    [attr.disabled]="disabled ? '' : null"
    [attr.size]="size"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    (change)="onChange($event)">
  </ark-shape-picker>`
})
export class ArkShapePickerComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Forma selecionada. */
  @Input() value: ArkMarkShape | undefined;
  /** Cor CSS em que as formas são desenhadas. Padrão: a cor do texto ao redor. */
  @Input() color: string | undefined;
  /** Nome acessível do radiogroup. */
  @Input() label: string | undefined;
  @Input() disabled = false;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Seleção mudou pelo usuário: detail.value é a forma. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: ArkMarkShape }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: ArkMarkShape }>);
  }
}
