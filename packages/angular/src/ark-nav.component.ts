import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type { ArkIntent, ArkLang, ArkNavCollapsible, ArkNavSide, ArkNavVariant, ArkSize, ArkTheme } from "@tooark/core";
import type {
  ArkNav as ArkNavElement,
  ArkNavGroup as ArkNavGroupElement,
  ArkNavItem as ArkNavItemElement
} from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

/** `detail` de `ark-navigate`: o destino do item e o seu identificador (`value`, ou o `href`). */
export type ArkNavNavigateDetail = { href: string | null; value: string };

@Component({
  selector: "ark-nav-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-nav
    [attr.testid]="testid"
    [attr.variant]="variant"
    [attr.side]="side"
    [attr.value]="value"
    [attr.collapsed]="collapsed ? '' : null"
    [attr.collapsible]="collapsible === true ? '' : (collapsible || null)"
    [attr.label]="label"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    (ark-collapse)="collapseHandler($event)"
    (ark-navigate)="navigateHandler($event)">
    <ng-content></ng-content>
  </ark-nav>`
})
export class ArkNavComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-nav` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkNavElement | null {
    return this.host.nativeElement.querySelector<ArkNavElement>(":scope > ark-nav");
  }

  @Input() testid: string | undefined;
  /** sidebar (coluna), navbar (barra) ou tabbar (abas de rodapé). Padrão: "sidebar". */
  @Input() variant: ArkNavVariant = "sidebar";
  /** Borda em que a sidebar encosta. Padrão: "left". */
  @Input() side: ArkNavSide = "left";
  /** `value` (ou `href`) do item atual; sem ele cada item mantém o próprio `current`. */
  @Input() value: string | undefined;
  /** Sidebar recolhida. */
  @Input() collapsed = false;
  /** Botão de recolher e o que resta recolhida: true/"rail" (só ícones) ou "hidden" (só o logo e o botão). */
  @Input() collapsible: boolean | ArkNavCollapsible = false;
  /** Vira aria-label da navegação. */
  @Input() label: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** O botão de recolher foi acionado; detail.collapsed é o novo estado, para o app guardar. */
  @Output() arkCollapse = new EventEmitter<CustomEvent<{ collapsed: boolean }>>();
  /** Um item foi acionado (sobe dos itens); preventDefault() cancela a navegação do navegador para o app rotear. */
  @Output() arkNavigate = new EventEmitter<CustomEvent<ArkNavNavigateDetail>>();

  // Só o evento deste elemento: os ark-* borbulham, e o ark-toggle de um ark-tree dentro do grupo chegava aqui.
  protected collapseHandler = (event: Event) => {
    if (event.target === event.currentTarget) this.arkCollapse.emit(event as CustomEvent<{ collapsed: boolean }>);
  };
  protected navigateHandler = (event: Event) => this.arkNavigate.emit(event as CustomEvent<ArkNavNavigateDetail>);
}

@Component({
  selector: "ark-nav-item-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // Sem caixa própria: o item entra no flex do nav (e do grupo), que o ordena e dimensiona.
  host: { style: "display: contents" },
  template: `
  <ark-nav-item
    [attr.testid]="testid"
    [attr.href]="href"
    [attr.target]="target"
    [attr.label]="label"
    [attr.value]="value"
    [attr.current]="current ? '' : null"
    [attr.disabled]="disabled ? '' : null"
    [attr.divider]="divider ? '' : null"
    (ark-navigate)="navigateHandler($event)">
    <ng-content></ng-content>
  </ark-nav-item>`
})
export class ArkNavItemComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-nav-item` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkNavItemElement | null {
    return this.host.nativeElement.querySelector<ArkNavItemElement>(":scope > ark-nav-item");
  }

  @Input() testid: string | undefined;
  /** Destino do link; sem ele o item é um botão. */
  @Input() href: string | undefined;
  /** `target` do link (`_blank` ganha rel noopener). */
  @Input() target: string | undefined;
  /** Texto do item, desenhado pelo componente (oculto no trilho). */
  @Input() label: string | undefined;
  /** Identificador em `ark-navigate` e no `value` do nav. Padrão: o `href`. */
  @Input() value: string | undefined;
  /** Página atual (`aria-current="page"`). */
  @Input() current = false;
  @Input() disabled = false;
  /** Linha separadora (role separator). */
  @Input() divider = false;
  /** Este item foi acionado; preventDefault() cancela a navegação do navegador. */
  @Output() arkNavigate = new EventEmitter<CustomEvent<ArkNavNavigateDetail>>();

  protected navigateHandler = (event: Event) => this.arkNavigate.emit(event as CustomEvent<ArkNavNavigateDetail>);
}

@Component({
  selector: "ark-nav-group-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // Sem caixa própria: o grupo entra no flex do nav.
  host: { style: "display: contents" },
  template: `
  <ark-nav-group
    [attr.testid]="testid"
    [attr.label]="label"
    [attr.expandable]="expandable ? '' : null"
    [attr.open]="open ? '' : null"
    (ark-toggle)="toggleHandler($event)">
    <ng-content></ng-content>
  </ark-nav-group>`
})
export class ArkNavGroupComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-nav-group` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkNavGroupElement | null {
    return this.host.nativeElement.querySelector<ArkNavGroupElement>(":scope > ark-nav-group");
  }

  @Input() testid: string | undefined;
  /** Texto do cabeçalho e nome do grupo. */
  @Input() label: string | undefined;
  /** O cabeçalho é um botão que abre e fecha os itens. */
  @Input() expandable = false;
  /** Itens à mostra (com `expandable`). */
  @Input() open = false;
  /** O cabeçalho expansível foi acionado; detail.open é o novo estado. */
  @Output() arkToggle = new EventEmitter<CustomEvent<{ open: boolean }>>();

  // Só o evento deste elemento: os ark-* borbulham, e o ark-toggle de um ark-tree dentro do grupo chegava aqui.
  protected toggleHandler = (event: Event) => {
    if (event.target === event.currentTarget) this.arkToggle.emit(event as CustomEvent<{ open: boolean }>);
  };
}
