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
import type { ArkDialogCloseReason, ArkDialogSize, ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-dialog-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-dialog
    #dialog
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.label]="label"
    [attr.no-close-button]="noCloseButton ? '' : null"
    [attr.persistent]="persistent ? '' : null"
    [attr.size]="size"
    [attr.width]="width"
    [attr.height]="height"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-dialog>`
})
export class ArkDialogComponent implements AfterViewInit, OnDestroy {
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

  @ViewChild("dialog", { static: false }) dialogRef!: ElementRef<HTMLElement>;

  private openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  private closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent<{ reason: ArkDialogCloseReason }>);

  ngAfterViewInit(): void {
    this.dialogRef?.nativeElement?.addEventListener("ark-open", this.openHandler);
    this.dialogRef?.nativeElement?.addEventListener("ark-close", this.closeHandler);
  }

  ngOnDestroy(): void {
    this.dialogRef?.nativeElement?.removeEventListener("ark-open", this.openHandler);
    this.dialogRef?.nativeElement?.removeEventListener("ark-close", this.closeHandler);
  }
}
