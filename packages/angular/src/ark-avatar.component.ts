import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkAvatarShape, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkAvatar as ArkAvatarElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-avatar-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-avatar
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
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

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-avatar` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkAvatarElement | null {
    return this.host.nativeElement.querySelector<ArkAvatarElement>(":scope > ark-avatar");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
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
