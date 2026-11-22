import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import type { ArkSize, ArkTheme, ArkTreeSelection } from "@tooark/core";
import type { ArkTree as ArkTreeElement, ArkTreeItem as ArkTreeItemElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-tree-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-tree
    [attr.testid]="testid"
    [attr.selection]="selection"
    [attr.checkboxes]="checkboxes ? '' : null"
    [attr.propagate]="propagate ? '' : null"
    [attr.value]="valueAttr"
    [attr.label]="label"
    [attr.aria-label]="ariaLabel"
    [attr.size]="size"
    [attr.theme]="theme"
    (ark-toggle)="toggleHandler($event)"
    (ark-selection-change)="selectionHandler($event)"
    (ark-activate)="activateHandler($event)">
    <ng-content></ng-content>
  </ark-tree>`
})
export class ArkTreeComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-tree` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkTreeElement | null {
    return this.host.nativeElement.querySelector<ArkTreeElement>(":scope > ark-tree");
  }

  @Input() testid: string | undefined;
  /** none (só navega, expande e ativa), single ou multiple. Padrão: "none". */
  @Input() selection: ArkTreeSelection | undefined;
  @Input() checkboxes = false;
  @Input() propagate = false;
  /** Valores selecionados: um em `single`, a lista em `multiple`. */
  @Input() value: string | string[] | undefined;
  /** Nome da árvore (vira `aria-label`). */
  @Input() label: string | undefined;
  @Input() ariaLabel: string | undefined;
  @Input() size: ArkSize | undefined;
  @Input() theme: ArkTheme | undefined;
  @Output() arkToggle = new EventEmitter<CustomEvent<{ value: string; expanded: boolean; item: ArkTreeItemElement }>>();
  @Output() arkSelectionChange = new EventEmitter<CustomEvent<{ values: string[]; value?: string | null }>>();
  @Output() arkActivate = new EventEmitter<CustomEvent<{ value: string; item: ArkTreeItemElement }>>();

  get valueAttr(): string | null {
    if (Array.isArray(this.value)) return this.value.length ? JSON.stringify(this.value) : null;
    return this.value || null;
  }

  protected toggleHandler = (event: Event) =>
    this.arkToggle.emit(event as CustomEvent<{ value: string; expanded: boolean; item: ArkTreeItemElement }>);
  protected selectionHandler = (event: Event) =>
    this.arkSelectionChange.emit(event as CustomEvent<{ values: string[]; value?: string | null }>);
  protected activateHandler = (event: Event) =>
    this.arkActivate.emit(event as CustomEvent<{ value: string; item: ArkTreeItemElement }>);
}

// Entre a árvore (ou o item pai) e o item: display: contents, para a grid do item pai e a coluna da árvore verem o
// ark-tree-item como se o wrapper não existisse. A árvore acha os itens por descendência.
@Component({
  selector: "ark-tree-item-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { style: "display: contents" },
  template: `
  <ark-tree-item
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.label]="label"
    [attr.expanded]="expanded ? '' : null"
    [attr.lazy]="lazy ? '' : null"
    [attr.loading]="loading ? '' : null"
    [attr.selected]="selected ? '' : null"
    [attr.checked]="checked === 'mixed' ? 'mixed' : checked ? '' : null"
    [attr.disabled]="disabled ? '' : null">
    <ng-content></ng-content>
  </ark-tree-item>`
})
export class ArkTreeItemComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-tree-item` que este wrapper renderiza; `null` antes da view. */
  get element(): ArkTreeItemElement | null {
    return this.host.nativeElement.querySelector<ArkTreeItemElement>(":scope > ark-tree-item");
  }

  @Input() testid: string | undefined;
  @Input() value: string | undefined;
  /** Texto do nó (também usado na busca por digitação). */
  @Input() label: string | undefined;
  @Input() expanded = false;
  /** Mostra o chevron sem filhos: carregue os filhos no `(arkToggle)` com `expanded: true`. */
  @Input() lazy = false;
  @Input() loading = false;
  @Input() selected = false;
  /** Caixa com `checkboxes`: true, false ou "mixed". */
  @Input() checked: boolean | "mixed" | undefined;
  @Input() disabled = false;
}
