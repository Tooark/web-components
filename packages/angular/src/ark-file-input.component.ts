import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-file-input-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-file-input
    [attr.testid]="testid"
    [attr.accept]="accept"
    [attr.multiple]="multiple ? '' : null"
    [attr.label]="label"
    [attr.helper]="helper"
    [attr.error-message]="errorMessage"
    [attr.error]="error ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.required]="required ? '' : null"
    [attr.name]="name"
    [attr.intent]="intent"
    [attr.size]="size"
    [attr.rounded]="rounded"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    (change)="onChange($event)">
  </ark-file-input>`
})
export class ArkFileInputComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Tipos aceitos pelo seletor nativo (accept). */
  @Input() accept: string | undefined;
  /** Aceita vários arquivos; sem ele o drop fica com o primeiro. */
  @Input() multiple = false;
  /** Rótulo do campo (label for o input oculto; nomeia o botão junto do texto dele). */
  @Input() label: string | undefined;
  @Input() helper: string | undefined;
  /** Mensagem de erro; liga aria-invalid e a borda de erro. */
  @Input() errorMessage: string | undefined;
  /** Estado de erro sem mensagem (borda danger e aria-invalid). */
  @Input() error = false;
  @Input() disabled = false;
  @Input() required = false;
  /** Nome no formulário (input nativo oculto). */
  @Input() name: string | undefined;
  @Input() intent: ArkIntent = "primary";
  @Input() size: ArkSize = "md";
  /** Cantos da zona de soltar. Padrão: "lg". */
  @Input() rounded: ArkRounded | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Arquivos escolhidos ou soltos: detail.files é um array de File. */
  @Output() changed = new EventEmitter<CustomEvent<{ files: File[] }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ files: File[] }>);
  }
}
