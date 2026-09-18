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
import type { ArkAlertLive, ArkAlertVariant, ArkIntent, ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-alert-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-alert
    #alert
    [attr.testid]="testid"
    [attr.intent]="intent"
    [attr.variant]="variant"
    [attr.heading]="heading"
    [attr.dismissible]="dismissible ? '' : null"
    [attr.live]="live"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
    <ng-content></ng-content>
  </ark-alert>`
})
export class ArkAlertComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() intent: ArkIntent = "info";
  /** Caixa arredondada ou banner de largura toda. Padrão: "box". */
  @Input() variant: ArkAlertVariant = "box";
  /** Título próprio no início do alerta. */
  @Input() heading: string | undefined;
  /** Botão de dispensar (rótulo por lang/localeJson). */
  @Input() dismissible = false;
  /** Live region. Padrão: "assertive" em warning e danger, "polite" nos demais. */
  @Input() live: ArkAlertLive | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Depois da saída animada: o host ganha `hidden`; desmontar é do app. */
  @Output() arkDismiss = new EventEmitter<CustomEvent>();

  @ViewChild("alert", { static: false }) alertRef!: ElementRef<HTMLElement>;

  private dismissHandler = (event: Event) => this.arkDismiss.emit(event as CustomEvent);

  ngAfterViewInit(): void {
    this.alertRef?.nativeElement?.addEventListener("ark-dismiss", this.dismissHandler);
  }

  ngOnDestroy(): void {
    this.alertRef?.nativeElement?.removeEventListener("ark-dismiss", this.dismissHandler);
  }
}
