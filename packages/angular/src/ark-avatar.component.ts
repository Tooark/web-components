import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type { ArkAvatarShape, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-avatar-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-avatar
    [attr.testid]="testid"
    [attr.name]="name"
    [attr.src]="src"
    [attr.size]="size"
    [attr.shape]="shape"
    [attr.color]="color"
    [attr.theme]="theme">
  </ark-avatar>`
})
export class ArkAvatarComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Nome da pessoa: vira aria-label e as iniciais (primeira letra, ou primeira + última com sobrenome). */
  @Input() name: string | undefined;
  /** Imagem; em erro de carga caem as iniciais. */
  @Input() src: string | undefined;
  @Input() size: ArkSize = "md";
  /** Círculo ou quadrado de cantos arredondados. Padrão: "circle". */
  @Input() shape: ArkAvatarShape = "circle";
  /** Cor CSS própria para as iniciais (texto na cor, fundo suave). Padrão: o tint primary. */
  @Input() color: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
