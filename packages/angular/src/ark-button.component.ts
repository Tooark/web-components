import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type {
  ArkButtonNavigateDetail,
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkIntent,
  ArkOrientation,
  ArkRounded,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import type { ArkButton as ArkButtonElement, ArkButtonGroup as ArkButtonGroupElement } from "@tooark/web-components";
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
    [attr.form]="form"
    [attr.disabled]="disabled ? '' : null"
    [attr.soft-disabled]="softDisabled ? '' : null"
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
    [attr.download]="download === true ? '' : download || null"
    [attr.color]="color"
    [attr.text-color]="textColor"
    [attr.size]="size"
    (ark-navigate)="navigateHandler($event)">
    <ng-content></ng-content>
  </ark-button>`
})
export class ArkButtonComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-button` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkButtonElement | null {
    return this.host.nativeElement.querySelector<ArkButtonElement>(":scope > ark-button");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  @Input() type: ArkButtonType = "button";
  /** Id do formulário a que o botão pertence quando fica fora dele, como no `<button form>` nativo. */
  @Input() form: string | undefined;
  @Input() disabled = false;
  /** Desabilitado só para a ação: continua no Tab e sob o ponteiro, para um tooltip dizer o motivo. */
  @Input() softDisabled = false;
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
  /** Com href, baixa em vez de navegar: true (ou "") usa o nome da URL, uma string define o nome do arquivo. */
  @Input() download: boolean | string | undefined;
  @Input() color: string | undefined;
  @Input() textColor: string | undefined;
  /** Clique simples no link (`href`), cancelável: `event.preventDefault()` e o roteamento da SPA. */
  @Output() arkNavigate = new EventEmitter<CustomEvent<ArkButtonNavigateDetail>>();

  protected navigateHandler = (event: Event) => this.arkNavigate.emit(event as CustomEvent<ArkButtonNavigateDetail>);
}

@Component({
  selector: "ark-button-group-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-button-group
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.label]="label"
    [attr.orientation]="orientation"
    [attr.spaced]="spaced ? '' : null"
    [attr.full-width]="fullWidth ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.variant]="variant"
    [attr.intent]="intent"
    [attr.size]="size"
    [attr.rounded]="rounded"
    [attr.theme]="theme">
    <ng-content></ng-content>
  </ark-button-group>`
})
export class ArkButtonGroupComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-button-group` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkButtonGroupElement | null {
    return this.host.nativeElement.querySelector<ArkButtonGroupElement>(":scope > ark-button-group");
  }

  @Input() testid: string | undefined;
  /** Nome acessível, repassado ao elemento (o aria-label no wrapper ficaria no host errado). */
  @Input() ariaLabel: string | undefined;
  /** Nome do grupo (vira `aria-label`). */
  @Input() label: string | undefined;
  /** Direção da fila. Padrão: "horizontal". */
  @Input() orientation: ArkOrientation | undefined;
  /** Botões separados pelo gap do size, em vez de colados. */
  @Input() spaced = false;
  /** O grupo ocupa a largura disponível e a reparte entre os botões. */
  @Input() fullWidth = false;
  /** Desabilita todos os botões do grupo. */
  @Input() disabled = false;
  // Sem padrão: só o que o app der ao grupo é gravado nos botões.
  @Input() variant: ArkButtonVariant | undefined;
  @Input() intent: ArkIntent | undefined;
  @Input() size: ArkSize | undefined;
  @Input() rounded: ArkRounded | undefined;
  @Input() theme: ArkTheme | undefined;
}
