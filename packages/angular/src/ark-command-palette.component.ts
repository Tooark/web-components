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
import type { ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-command-palette-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-command-palette
    #palette
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.placeholder]="placeholder"
    [attr.hotkey]="hotkey"
    [attr.filter]="filter ? '' : null"
    [attr.query-delay]="queryDelay"
    [attr.label]="label"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel">
    <ng-content></ng-content>
  </ark-command-palette>`
})
export class ArkCommandPaletteComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Aberta; a saída anima antes de sair do top layer. */
  @Input() open = false;
  /** Placeholder e nome do campo de busca. Padrão: a string `search` do idioma. */
  @Input() placeholder: string | undefined;
  /** Atalho global: "/", "mod+k" (Ctrl ou Cmd), "ctrl+shift+p"... */
  @Input() hotkey: string | undefined;
  /** Filtra localmente pelo label dos itens. */
  @Input() filter = false;
  /** Debounce de ark-query em ms. Padrão: 150. */
  @Input() queryDelay: number | undefined;
  /** Nome acessível do diálogo. */
  @Input() label: string | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Input() ariaLabel: string | undefined;
  @Output() arkSelect = new EventEmitter<CustomEvent<{ value: string }>>();
  @Output() arkQuery = new EventEmitter<CustomEvent<{ query: string }>>();
  @Output() arkOpen = new EventEmitter<CustomEvent>();
  @Output() arkClose = new EventEmitter<CustomEvent>();

  @ViewChild("palette", { static: false }) paletteRef!: ElementRef<HTMLElement>;

  private selectHandler = (event: Event) => this.arkSelect.emit(event as CustomEvent<{ value: string }>);
  private queryHandler = (event: Event) => this.arkQuery.emit(event as CustomEvent<{ query: string }>);
  private openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  private closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent);

  ngAfterViewInit(): void {
    const el = this.paletteRef?.nativeElement;
    el?.addEventListener("ark-select", this.selectHandler);
    el?.addEventListener("ark-query", this.queryHandler);
    el?.addEventListener("ark-open", this.openHandler);
    el?.addEventListener("ark-close", this.closeHandler);
  }

  ngOnDestroy(): void {
    const el = this.paletteRef?.nativeElement;
    el?.removeEventListener("ark-select", this.selectHandler);
    el?.removeEventListener("ark-query", this.queryHandler);
    el?.removeEventListener("ark-open", this.openHandler);
    el?.removeEventListener("ark-close", this.closeHandler);
  }
}

@Component({
  selector: "ark-command-item-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-command-item
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.group]="group"
    [attr.label]="label"
    [attr.disabled]="disabled ? '' : null">
    <ng-content></ng-content>
  </ark-command-item>`
})
export class ArkCommandItemComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() value = "";
  /** Seção em que a paleta lista o item. */
  @Input() group: string | undefined;
  /** Texto do filtro e nome da opção. Padrão: o texto projetado sem slot. */
  @Input() label: string | undefined;
  @Input() disabled = false;
}
