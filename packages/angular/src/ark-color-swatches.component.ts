import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type { ArkColorSwatch, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkColorSwatches as ArkColorSwatchesElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-color-swatches-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-color-swatches
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.value]="value"
    [attr.colors]="colorsJson"
    [attr.label]="label"
    [attr.disabled]="disabled ? '' : null"
    [attr.size]="size"
    [attr.theme]="theme"
    (change)="onChange($event)">
  </ark-color-swatches>`
})
export class ArkColorSwatchesComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-color-swatches` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkColorSwatchesElement | null {
    return this.host.nativeElement.querySelector<ArkColorSwatchesElement>(":scope > ark-color-swatches");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  /** Cor selecionada (o value da amostra). */
  @Input() value: string | undefined;
  /** Amostras { name, value }[]; vão como JSON no atributo. */
  @Input() colors: ArkColorSwatch[] | undefined;
  /** Nome acessível do radiogroup. */
  @Input() label: string | undefined;
  @Input() disabled = false;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
  /** Seleção mudou pelo usuário: detail.value é a cor. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();

  get colorsJson(): string | null {
    return this.colors ? JSON.stringify(this.colors) : null;
  }

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}
