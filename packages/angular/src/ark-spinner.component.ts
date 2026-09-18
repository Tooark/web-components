import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkIntent, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-spinner-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-spinner
    [attr.testid]="testid"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.label]="label"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
  </ark-spinner>`
})
export class ArkSpinnerComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() size: ArkSize = "md";
  /** Cor pelo intent. Padrão: herda a cor do texto ao redor. */
  @Input() intent: ArkIntent | undefined;
  /** Rótulo só para leitores de tela. Padrão: a string `loading` do idioma. */
  @Input() label: string | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
}
