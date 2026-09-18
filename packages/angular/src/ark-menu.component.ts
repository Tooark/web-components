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
import type { ArkIntent, ArkMenuAlign, ArkMenuDirection, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-menu-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-menu
    #menu
    [attr.testid]="testid"
    [attr.for]="for"
    [attr.open]="open ? '' : null"
    [attr.align]="align"
    [attr.direction]="direction"
    [attr.size]="size"
    [attr.theme]="theme"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-menu>`
})
export class ArkMenuComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** id do gatilho: o menu escreve aria-* nele e escuta clique e setas. */
  @Input() for: string | undefined;
  /** Aberto; refletido do estado do popover. */
  @Input() open = false;
  /** Alinhamento em relação ao gatilho. Padrão: "start". */
  @Input() align: ArkMenuAlign = "start";
  /** Lado do gatilho; vira quando não cabe. Padrão: "down". */
  @Input() direction: ArkMenuDirection = "down";
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
  @Input() ariaLabel: string | undefined;
  /** Um item foi escolhido; o menu fecha em seguida. */
  @Output() arkSelect = new EventEmitter<CustomEvent<{ value: string }>>();
  @Output() arkOpen = new EventEmitter<CustomEvent>();
  @Output() arkClose = new EventEmitter<CustomEvent>();

  @ViewChild("menu", { static: false }) menuRef!: ElementRef<HTMLElement>;

  private selectHandler = (event: Event) => this.arkSelect.emit(event as CustomEvent<{ value: string }>);
  private openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  private closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent);

  ngAfterViewInit(): void {
    const el = this.menuRef?.nativeElement;
    el?.addEventListener("ark-select", this.selectHandler);
    el?.addEventListener("ark-open", this.openHandler);
    el?.addEventListener("ark-close", this.closeHandler);
  }

  ngOnDestroy(): void {
    const el = this.menuRef?.nativeElement;
    el?.removeEventListener("ark-select", this.selectHandler);
    el?.removeEventListener("ark-open", this.openHandler);
    el?.removeEventListener("ark-close", this.closeHandler);
  }
}

@Component({
  selector: "ark-menu-item-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-menu-item
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.intent]="intent"
    [attr.disabled]="disabled ? '' : null"
    [attr.checked]="checkedAttr"
    [attr.divider]="divider ? '' : null"
    [attr.static]="static ? '' : null">
    <ng-content></ng-content>
  </ark-menu-item>`
})
export class ArkMenuItemComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() value: string | undefined;
  /** Cor do texto e do hover; "danger" para ações destrutivas. */
  @Input() intent: ArkIntent | undefined;
  @Input() disabled = false;
  /** Item checkbox: true marcado, false desmarcado; undefined é um item comum. */
  @Input() checked: boolean | undefined;
  /** Linha separadora (role separator). */
  @Input() divider = false;
  /** Conteúdo não interativo (nome e e-mail), sem role de item. */
  @Input() static = false;

  get checkedAttr(): string | null {
    if (this.checked === undefined) return null;
    return this.checked ? "" : "false";
  }
}
