import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkIntent, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkSpinner as ArkSpinnerElement } from "@tooark/web-components";
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-spinner` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkSpinnerElement | null {
    return this.host.nativeElement.querySelector<ArkSpinnerElement>(":scope > ark-spinner");
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
