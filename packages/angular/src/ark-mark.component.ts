import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkMarkShape, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-mark-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-mark
    [attr.testid]="testid"
    [attr.shape]="shape"
    [attr.color]="color"
    [attr.size]="size"
    [attr.label]="label"
    [attr.theme]="theme">
  </ark-mark>`
})
export class ArkMarkComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Forma desenhada. Padrão: "circle". */
  @Input() shape: ArkMarkShape = "circle";
  /** Cor CSS da forma. Padrão: a cor do texto ao redor. */
  @Input() color: string | undefined;
  /** Lado do SVG: número em px ou comprimento CSS. Padrão: 16. */
  @Input() size: number | string | undefined;
  /** Com rótulo a marca vira role="img" nomeado; sem ele é decorativa (aria-hidden). */
  @Input() label: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
