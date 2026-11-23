import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type { ArkIntent, ArkOrientation, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkRadio as ArkRadioElement, ArkRadioGroup as ArkRadioGroupElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-radio-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-radio
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.checked]="checked ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.name]="name"
    [attr.value]="value"
    [attr.label]="label"
    [attr.helper]="helper"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-radio>`
})
export class ArkRadioComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-radio` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkRadioElement | null {
    return this.host.nativeElement.querySelector<ArkRadioElement>(":scope > ark-radio");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
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
  /** Dica abaixo do rótulo, ligada ao controle por aria-describedby. */
  @Input() helper: string | undefined;
  /** Dispara só no radio que ganhou a marca. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}

@Component({
  selector: "ark-radio-group-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-radio-group
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.value]="value"
    [attr.name]="name"
    [attr.label]="label"
    [attr.helper]="helper"
    [attr.error]="error ? '' : null"
    [attr.error-message]="errorMessage"
    [attr.orientation]="orientation"
    [attr.required]="required ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.size]="size"
    [attr.theme]="theme"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-radio-group>`
})
export class ArkRadioGroupComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-radio-group` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkRadioGroupElement | null {
    return this.host.nativeElement.querySelector<ArkRadioGroupElement>(":scope > ark-radio-group");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  /** O `value` do rádio marcado; atribuído, marca o rádio desse valor. */
  @Input() value: string | undefined;
  /** `name` gravado em cada rádio, para o formulário. */
  @Input() name: string | undefined;
  /** Legenda própria do grupo. */
  @Input() label: string | undefined;
  @Input() helper: string | undefined;
  /** Marca o grupo como inválido, com ou sem mensagem. */
  @Input() error = false;
  @Input() errorMessage: string | undefined;
  /** Direção da lista. Padrão: "vertical". */
  @Input() orientation: ArkOrientation | undefined;
  @Input() required = false;
  @Input() disabled = false;
  // Sem padrão: só o que o app der ao grupo é gravado nos rádios.
  @Input() intent: ArkIntent | undefined;
  @Input() size: ArkSize | undefined;
  @Input() theme: ArkTheme | undefined;
  /** Um só por mudança, do grupo, com o `value` do rádio que ganhou a marca. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();

  // O grupo para o `change` dos rádios e publica o próprio: só o dele (target no host) é reemitido.
  onChange(event: Event): void {
    if (event.target === event.currentTarget) this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}
