import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkLang, ArkTheme, ArkToastPosition } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-toaster-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-toaster
    [attr.testid]="testid"
    [attr.theme]="theme"
    [attr.position]="position"
    [attr.max-visible]="maxVisible"
    [attr.duration]="duration"
    [attr.rich-colors]="richColors ? '' : null"
    [attr.close-button]="closeButton ? null : 'false'"
    [attr.lang]="lang"
    (ark-toast-action)="onAction($event)">
  </ark-toaster>`
})
export class ArkToasterComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() position: ArkToastPosition = "bottom-right";
  @Input() richColors = false;
  @Input() closeButton = true;
  @Input() maxVisible = 4;
  @Input() duration = 4000;
  /** Idioma do rótulo do botão de fechar. */
  @Input() lang: ArkLang | undefined;
  /** Botão de ação de um toast: detail traz o id do toast e o actionId das opções. */
  @Output() arkToastAction = new EventEmitter<CustomEvent<{ id: string; actionId: string | null }>>();

  onAction(event: Event): void {
    this.arkToastAction.emit(event as CustomEvent<{ id: string; actionId: string | null }>);
  }
}
