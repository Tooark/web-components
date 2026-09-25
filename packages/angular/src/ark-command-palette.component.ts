import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from "@angular/core";
import type { ArkLang, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-command-palette-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-command-palette
    [attr.testid]="testid"
    [attr.open]="open ? '' : null"
    [attr.placeholder]="placeholder"
    [attr.hotkey]="hotkey"
    [attr.no-scroll-lock]="noScrollLock ? '' : null"
    [attr.filter]="filter ? '' : null"
    [attr.query-delay]="queryDelay"
    [attr.label]="label"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    [attr.aria-label]="ariaLabel"
    (ark-select)="selectHandler($event)"
    (ark-query)="queryHandler($event)"
    (ark-open)="openHandler($event)"
    (ark-close)="closeHandler($event)">
    <ng-content></ng-content>
  </ark-command-palette>`
})
export class ArkCommandPaletteComponent {
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
  /** A página continua rolando com a paleta aberta. */
  @Input() noScrollLock = false;
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

  // Ligados no template, e não no ngAfterViewInit: o listener existe desde a criação da view, então o ark-open de um
  // overlay que já nasce aberto (o elemento o emite num microtask) não se perde, nem na hidratação de SSR.
  protected selectHandler = (event: Event) => this.arkSelect.emit(event as CustomEvent<{ value: string }>);
  protected queryHandler = (event: Event) => this.arkQuery.emit(event as CustomEvent<{ query: string }>);
  protected openHandler = (event: Event) => this.arkOpen.emit(event as CustomEvent);
  protected closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent);
}

@Component({
  selector: "ark-command-item-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // Sem caixa própria: o item entra no layout da paleta, que o ordena por grupo com `order`.
  host: { style: "display: contents" },
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
