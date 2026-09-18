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
import type { ArkDrawerCloseReason, ArkDrawerMode, ArkDrawerSide, ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-drawer-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-drawer
    #drawer
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.side]="side"
    [attr.mode]="mode"
    [attr.size]="size"
    [attr.label]="label"
    [attr.no-close-button]="noCloseButton ? '' : null"
    [attr.persistent]="persistent ? '' : null"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-drawer>`
})
export class ArkDrawerComponent implements AfterViewInit, OnDestroy {
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
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Input() ariaLabel: string | undefined;
  @Output() arkOpen = new EventEmitter<CustomEvent>();
  /** O fechamento começou; detail.reason diz por quê (escape, backdrop, close-button, api). */
  @Output() arkClose = new EventEmitter<CustomEvent<{ reason: ArkDrawerCloseReason }>>();

  @ViewChild("drawer", { static: false }) drawerRef!: ElementRef<HTMLElement>;

  private openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  private closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent<{ reason: ArkDrawerCloseReason }>);

  ngAfterViewInit(): void {
    this.drawerRef?.nativeElement?.addEventListener("ark-open", this.openHandler);
    this.drawerRef?.nativeElement?.addEventListener("ark-close", this.closeHandler);
  }

  ngOnDestroy(): void {
    this.drawerRef?.nativeElement?.removeEventListener("ark-open", this.openHandler);
    this.drawerRef?.nativeElement?.removeEventListener("ark-close", this.closeHandler);
  }
}
