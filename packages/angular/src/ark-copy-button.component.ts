import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
  EventEmitter,
  Input,
  type OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import type { ArkButtonVariant, ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-copy-button-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-copy-button
    #button
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.for]="for"
    [attr.feedback-ms]="feedbackMs"
    [attr.variant]="variant"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.size]="size"
    [attr.rounded]="rounded"
    [attr.disabled]="disabled ? '' : null"
    [attr.loading]="loading ? '' : null"
    [attr.icon-only]="iconOnly ? '' : null"
    [attr.full-width]="fullWidth ? '' : null"
    [attr.color]="color"
    [attr.text-color]="textColor"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
    <ng-content></ng-content>
  </ark-copy-button>`
})
export class ArkCopyButtonComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Texto a copiar. */
  @Input() value: string | undefined;
  /** id de um elemento: copia o value de inputs/textareas ou o textContent. */
  @Input() for: string | undefined;
  /** Duração do feedback "copiado" em ms. Padrão: 1500. */
  @Input() feedbackMs: number | undefined;
  @Input() variant: ArkButtonVariant = "primary";
  /** Sem padrão: um intent fixo venceria o de `variant="danger"` (o elemento usa intent || variant). */
  @Input() intent: ArkIntent | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() size: ArkSize = "md";
  @Input() rounded: ArkRounded = "md";
  @Input() disabled = false;
  @Input() loading = false;
  @Input() iconOnly = false;
  @Input() fullWidth = false;
  @Input() color: string | undefined;
  @Input() textColor: string | undefined;
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Output() arkCopy = new EventEmitter<CustomEvent<{ value: string }>>();

  @ViewChild("button", { static: false }) buttonRef!: ElementRef<HTMLElement>;

  private copyHandler = (event: Event) => this.arkCopy.emit(event as CustomEvent<{ value: string }>);

  ngAfterViewInit(): void {
    this.buttonRef?.nativeElement?.addEventListener("ark-copy", this.copyHandler);
  }

  ngOnDestroy(): void {
    this.buttonRef?.nativeElement?.removeEventListener("ark-copy", this.copyHandler);
  }
}
