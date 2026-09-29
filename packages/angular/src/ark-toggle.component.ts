import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkToggle as ArkToggleElement, ArkToggleGroup as ArkToggleGroupElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-toggle-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-toggle
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.pressed]="pressed ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.value]="value"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-toggle>`
})
export class ArkToggleComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-toggle` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkToggleElement | null {
    return this.host.nativeElement.querySelector<ArkToggleElement>(":scope > ark-toggle");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  @Input() pressed = false;
  @Input() disabled = false;
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() value: string | undefined;
  @Output() changed = new EventEmitter<CustomEvent<{ pressed: boolean; value: string }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ pressed: boolean; value: string }>);
  }
}

@Component({
  selector: "ark-toggle-group-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-toggle-group
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.multiple]="multiple ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-toggle-group>`
})
export class ArkToggleGroupComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-toggle-group` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkToggleGroupElement | null {
    return this.host.nativeElement.querySelector<ArkToggleGroupElement>(":scope > ark-toggle-group");
  }

  @Input() testid: string | undefined;
  @Input() value: string | undefined;
  @Input() multiple = false;
  @Input() disabled = false;
  @Input() intent: ArkIntent | undefined;
  @Input() theme: ArkTheme | undefined;
  @Input() size: ArkSize | undefined;
  @Output() changed = new EventEmitter<CustomEvent<{ value?: string; values?: string[] }>>();

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value?: string; values?: string[] }>);
  }
}
