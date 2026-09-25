import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkDialogCloseReason, ArkDialogSize, ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-dialog-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-dialog
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.label]="label"
    [attr.no-close-button]="noCloseButton ? '' : null"
    [attr.persistent]="persistent ? '' : null"
    [attr.no-scroll-lock]="noScrollLock ? '' : null"
    [attr.size]="size"
    [attr.width]="width"
    [attr.height]="height"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel"
    (ark-open)="openHandler($event)"
    (ark-close)="closeHandler($event)">
    <ng-content></ng-content>
  </ark-dialog>`
})
export class ArkDialogComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Aberto; a saída anima antes de sair do top layer. */
  @Input() open = false;
  /** Título (h2) e nome acessível. Sem ele, passe ariaLabel. */
  @Input() label: string | undefined;
  /** Esconde o botão de fechar do cabeçalho. */
  @Input() noCloseButton = false;
  /** Esc e clique no scrim não fecham. */
  @Input() persistent = false;
  /** A página continua rolando com o diálogo aberto. */
  @Input() noScrollLock = false;
  /** Largura máxima do painel; "full" ocupa a viewport inteira. Padrão: "md". */
  @Input() size: ArkDialogSize = "md";
  /** Largura própria (comprimento CSS; número vira px), acima do preset e limitada à viewport. */
  @Input() width: string | number | undefined;
  /** Altura própria (comprimento CSS; número vira px), limitada à viewport. Padrão: a do conteúdo. */
  @Input() height: string | number | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Input() ariaLabel: string | undefined;
  @Output() arkOpen = new EventEmitter<CustomEvent>();
  /** O fechamento começou; detail.reason diz por que (escape, backdrop, close-button, api). */
  @Output() arkClose = new EventEmitter<CustomEvent<{ reason: ArkDialogCloseReason }>>();

  // Ligados no template, e não no ngAfterViewInit: o listener existe desde a criação da view, então o ark-open de um
  // overlay que já nasce aberto (o elemento o emite num microtask) não se perde, nem na hidratação de SSR.
  protected openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  protected closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent<{ reason: ArkDialogCloseReason }>);
}
