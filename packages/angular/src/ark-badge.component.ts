import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, inject } from "@angular/core";
import type { ArkBadgeSize, ArkBadgeVariant, ArkIntent, ArkRounded, ArkTheme } from "@tooark/core";
import type { ArkBadge as ArkBadgeElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-badge-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-badge
    [attr.testid]="testid"
    [attr.intent]="intent"
    [attr.variant]="variant"
    [attr.size]="size"
    [attr.rounded]="rounded"
    [attr.color]="color"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-badge>`
})
export class ArkBadgeComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-badge` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkBadgeElement | null {
    return this.host.nativeElement.querySelector<ArkBadgeElement>(":scope > ark-badge");
  }

  @Input() testid: string | undefined;
  @Input() intent: ArkIntent = "neutral";
  @Input() variant: ArkBadgeVariant = "soft";
  @Input() size: ArkBadgeSize = "md";
  @Input() rounded: ArkRounded = "full";
  @Input() color: string | undefined;
  @Input() theme: ArkTheme = "auto";
}
