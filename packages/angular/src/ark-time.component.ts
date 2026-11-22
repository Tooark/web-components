import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkTimeFormat } from "@tooark/core";
import type { ArkTime as ArkTimeElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-time-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-time
    [attr.testid]="testid"
    [attr.datetime]="datetimeAttr"
    [attr.format]="format"
    [attr.lang]="lang"></ark-time>`
})
export class ArkTimeComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-time` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkTimeElement | null {
    return this.host.nativeElement.querySelector<ArkTimeElement>(":scope > ark-time");
  }

  @Input() testid: string | undefined;
  /** Instante: ISO com ou sem fuso, só a data (`YYYY-MM-DD`), um `Date` ou ms. */
  @Input() datetime: string | number | Date | undefined;
  /** relative ("há 3 minutos"), date, time ou datetime. Padrão: "relative". */
  @Input() format: ArkTimeFormat | undefined;
  /** Idioma do Intl (qualquer tag, como `pt-BR`); sem ele, o de setArkLocale(), senão "en". */
  @Input() lang: string | undefined;

  /** `Date` e número viram ISO: o atributo é texto. */
  get datetimeAttr(): string | null {
    const value = this.datetime;
    if (value === undefined || value === null || value === "") return null;
    if (typeof value === "string") return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
}
