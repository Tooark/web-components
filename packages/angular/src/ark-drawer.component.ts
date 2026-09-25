import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkDrawerCloseReason, ArkDrawerMode, ArkDrawerSide, ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-drawer-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-drawer
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.side]="side"
    [attr.mode]="mode"
    [attr.size]="size"
    [attr.label]="label"
    [attr.no-close-button]="noCloseButton ? '' : null"
    [attr.persistent]="persistent ? '' : null"
    [attr.no-scroll-lock]="noScrollLock ? '' : null"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel"
    (ark-open)="openHandler($event)"
    (ark-close)="closeHandler($event)">
    <ng-content></ng-content>
  </ark-drawer>`
})
export class ArkDrawerComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Aberta; a saída anima antes de esconder. */
  @Input() open = false;
  /** Borda onde a gaveta encosta. Padrão: "right". */
  @Input() side: ArkDrawerSide = "right";
  /** overlay (popover modal com scrim) ou inline (no fluxo, só anima). Padrão: "overlay". */
  @Input() mode: ArkDrawerMode = "overlay";
  /** Preset sm/md/lg ou comprimento CSS no eixo da gaveta (número vira px). Padrão: "md". */
  @Input() size: string | number | undefined;
  /** Título (h2) e nome acessível. Sem ele, passe ariaLabel. */
  @Input() label: string | undefined;
  /** Esconde o botão de fechar do cabeçalho. */
  @Input() noCloseButton = false;
  /** Esc e clique no scrim não fecham (só no overlay). */
  @Input() persistent = false;
  /** A página continua rolando com a gaveta aberta em overlay. */
  @Input() noScrollLock = false;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Input() ariaLabel: string | undefined;
  @Output() arkOpen = new EventEmitter<CustomEvent>();
  /** O fechamento começou; detail.reason diz por quê (escape, backdrop, close-button, api). */
  @Output() arkClose = new EventEmitter<CustomEvent<{ reason: ArkDrawerCloseReason }>>();

  // Ligados no template, e não no ngAfterViewInit: o listener existe desde a criação da view, então o ark-open de um
  // overlay que já nasce aberto (o elemento o emite num microtask) não se perde, nem na hidratação de SSR.
  protected openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  protected closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent<{ reason: ArkDrawerCloseReason }>);
}
