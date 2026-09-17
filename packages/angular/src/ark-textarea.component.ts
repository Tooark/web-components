import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkIntent, ArkRounded, ArkSize, ArkTextareaResize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-textarea-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-textarea
    [attr.testid]="testid"
    [attr.label]="label"
    [attr.placeholder]="placeholder"
    [attr.value]="value"
    [attr.name]="name"
    [attr.rows]="rows"
    [attr.autosize]="autosize ? '' : null"
    [attr.monospace]="monospace ? '' : null"
    [attr.resize]="resize"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.rounded]="rounded"
    [attr.helper]="helper"
    [attr.error]="error ? '' : null"
    [attr.error-message]="errorMessage"
    [attr.disabled]="disabled ? '' : null"
    [attr.required]="required ? '' : null"
    [attr.readonly]="readonly ? '' : null"
    [attr.autocomplete]="autocomplete"
    [attr.autofocus]="autofocus ? '' : null"
    [attr.maxlength]="maxlength"
    [attr.minlength]="minlength"
    [attr.spellcheck]="spellcheckAttr"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-textarea>`
})
export class ArkTextareaComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() label: string | undefined;
  @Input() placeholder: string | undefined;
  @Input() value: string | undefined;
  @Input() name: string | undefined;
  /** Linhas visíveis iniciais. Padrão: 3. */
  @Input() rows: number | undefined;
  /** Cresce com o conteúdo (field-sizing nativo, fallback por JS). */
  @Input() autosize = false;
  /** Fonte monoespaçada, para código e dados. */
  @Input() monospace = false;
  @Input() resize: ArkTextareaResize = "vertical";
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
  @Input() autocomplete: string | undefined;
  @Input() autofocus = false;
  @Input() maxlength: number | undefined;
  @Input() minlength: number | undefined;
  @Input() spellcheck: boolean | undefined;
  @Input() ariaLabel: string | undefined;

  get spellcheckAttr(): string | null {
    return this.spellcheck === undefined ? null : String(this.spellcheck);
  }
}
