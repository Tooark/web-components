import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import type {
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkIntent,
  ArkRounded,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-button-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-button
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.type]="type"
    [attr.disabled]="disabled ? '' : null"
    [attr.loading]="loading ? '' : null"
    [attr.status]="status"
    [attr.status-label]="statusLabel"
    [attr.icon-only]="iconOnly ? '' : null"
    [attr.full-width]="fullWidth ? '' : null"
    [attr.variant]="variant"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.rounded]="rounded"
    [attr.href]="href"
    [attr.target]="target"
    [attr.color]="color"
    [attr.text-color]="textColor"
    [attr.size]="size">
    <ng-content></ng-content>
  </ark-button>`
})
export class ArkButtonComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  @Input() type: ArkButtonType = "button";
  @Input() disabled = false;
  @Input() loading = false;
  /** Feedback do resultado: "success" ou "error" trocam o glifo (loading vence). */
  @Input() status: ArkButtonStatus | undefined;
  /** Texto anunciado ao leitor de tela quando status vira success ou error. */
  @Input() statusLabel: string | undefined;
  @Input() iconOnly = false;
  @Input() fullWidth = false;
  @Input() variant: ArkButtonVariant = "primary";
  /** Sem padrão: um intent fixo venceria o de `variant="danger"` (o elemento usa intent || variant). */
  @Input() intent: ArkIntent | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() rounded: ArkRounded = "md";
  @Input() href: string | undefined;
  @Input() target: string | undefined;
  @Input() color: string | undefined;
  @Input() textColor: string | undefined;
}
