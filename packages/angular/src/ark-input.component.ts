import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkInput as ArkInputElement } from "@tooark/web-components";
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
    [attr.readonly]="readonly ? '' : null"
    [attr.reveal]="reveal ? '' : null"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.autocomplete]="autocomplete"
    [attr.autofocus]="autofocus ? '' : null"
    [attr.inputmode]="inputmode"
    [attr.maxlength]="maxlength"
    [attr.minlength]="minlength"
    [attr.pattern]="pattern"
    [attr.min]="min"
    [attr.max]="max"
    [attr.step]="step"
    [attr.spellcheck]="spellcheckAttr"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-input>`
})
export class ArkInputComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-input` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkInputElement | null {
    return this.host.nativeElement.querySelector<ArkInputElement>(":scope > ark-input");
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
  /** Com type="password", botão de mostrar/ocultar na ponta direita. */
  @Input() reveal = false;
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Input() autocomplete: string | undefined;
  @Input() autofocus = false;
  @Input() inputmode: string | undefined;
  @Input() maxlength: number | undefined;
  @Input() minlength: number | undefined;
  @Input() pattern: string | undefined;
  @Input() min: string | number | undefined;
  @Input() max: string | number | undefined;
  @Input() step: string | number | undefined;
  @Input() spellcheck: boolean | undefined;
  @Input() ariaLabel: string | undefined;

  get spellcheckAttr(): string | null {
    return this.spellcheck === undefined ? null : String(this.spellcheck);
  }
}
