import {
  type AfterContentChecked,
  type AfterContentInit,
  type AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  ElementRef,
  type EmbeddedViewRef,
  EventEmitter,
  Input,
  inject,
  type OnChanges,
  type OnDestroy,
  Output,
  type QueryList,
  type SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import type {
  ArkDataViewCardContext,
  ArkDataViewCardRender,
  ArkDataViewCellContext,
  ArkDataViewColumn,
  ArkDataViewKey,
  ArkDataViewMode,
  ArkDataViewQueryChangeDetail,
  ArkDataViewReorderDetail,
  ArkDataViewRow,
  ArkDataViewRowClickDetail,
  ArkDataViewSelectionChangeDetail,
  ArkDataViewSort,
  ArkDataViewView,
  ArkDataViewViewChangeDetail,
  ArkLang,
  ArkSize,
  ArkTheme
} from "@tooark/core";
import type { ArkDataView as ArkDataViewElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

/** Contexto do template de uma célula: o registro em `let-row` (implícito) e o resto por nome (`let-value="value"`). */
export type ArkDataViewCellTemplateContext = ArkDataViewCellContext & { $implicit: ArkDataViewRow };

/** Contexto do template do corpo de um card: o registro em `let-row` (implícito) e `index`. */
export type ArkDataViewCardTemplateContext = ArkDataViewCardContext & { $implicit: ArkDataViewRow };

/**
 * Conteúdo próprio das células de uma coluna do `ark-data-view-wrapper`, em template do Angular:
 * `<ng-template arkDataViewCell="name" let-row let-value="value">...</ng-template>`. Vale sobre o `render` da coluna.
 */
@Directive({
  selector: "ng-template[arkDataViewCell]",
  standalone: true
})
export class ArkDataViewCellDirective {
  /** `key` da coluna que este template desenha. */
  @Input("arkDataViewCell") key = "";

  readonly template = inject<TemplateRef<ArkDataViewCellTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: ArkDataViewCellDirective,
    _context: unknown
  ): _context is ArkDataViewCellTemplateContext {
    return true;
  }
}

/**
 * Corpo de cada card do `ark-data-view-wrapper`, em template do Angular, no lugar da grade de campos:
 * `<ng-template arkDataViewCard let-row let-index="index">...</ng-template>`. Vale sobre o input `cardRender`.
 */
@Directive({
  selector: "ng-template[arkDataViewCard]",
  standalone: true
})
export class ArkDataViewCardDirective {
  readonly template = inject<TemplateRef<ArkDataViewCardTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(
    _directive: ArkDataViewCardDirective,
    _context: unknown
  ): _context is ArkDataViewCardTemplateContext {
    return true;
  }
}

@Component({
  selector: "ark-data-view-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-data-view
    #dataView
    [attr.testid]="testid"
    [attr.row-key]="rowKey"
    [attr.view]="view"
    [attr.no-view-selector]="noViewSelector ? '' : null"
    [attr.breakpoint]="breakpoint"
    [attr.mode]="mode"
    [attr.page]="page"
    [attr.page-size]="pageSize"
    [attr.page-sizes]="pageSizesAttr"
    [attr.total]="total"
    [attr.sort]="sortAttr"
    [attr.search]="search || null"
    [attr.searchable]="searchable ? '' : null"
    [attr.search-placeholder]="searchPlaceholder"
    [attr.search-debounce]="searchDebounce"
    [attr.selectable]="selectable ? '' : null"
    [attr.reorderable]="reorderable ? '' : null"
    [attr.clickable]="clickable ? '' : null"
    [attr.loading]="loading ? '' : null"
    [attr.card-columns]="cardColumns"
    [attr.label]="label"
    [attr.size]="size"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
    <ng-content></ng-content>
  </ark-data-view>`
})
export class ArkDataViewComponent
  implements AfterContentChecked, AfterContentInit, AfterViewInit, OnChanges, OnDestroy
{
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewContainer = inject(ViewContainerRef);

  /** O `ark-data-view` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkDataViewElement | null {
    return this.host.nativeElement.querySelector<ArkDataViewElement>(":scope > ark-data-view");
  }

  @Input() testid: string | undefined;
  /** Registros (propriedade, não atributo; guardados por referência): uma lista nova renderiza de novo. */
  @Input() rows: ArkDataViewRow[] | undefined;
  /** Colunas (propriedade): qual campo aparece, onde e como; o conteúdo próprio vem de `ng-template[arkDataViewCell]`. */
  @Input() columns: ArkDataViewColumn[] | undefined;
  /** Campo que identifica cada registro. Padrão: "id". */
  @Input() rowKey: string | undefined;
  /** Apresentação ao carregar: "auto" (padrão), "table" ou "cards". */
  @Input() view: ArkDataViewView | undefined;
  /** Esconde o seletor de visualização do canto; `view` continua decidindo a apresentação. */
  @Input() noViewSelector = false;
  /** Largura do componente, em px, abaixo da qual "auto" mostra cards. Padrão: 640. */
  @Input() breakpoint: number | undefined;
  /** Quem busca, ordena e pagina: "client" (padrão) ou "server". */
  @Input() mode: ArkDataViewMode | undefined;
  @Input() page: number | undefined;
  /** Itens por página; sem ele não há paginação. */
  @Input() pageSize: number | undefined;
  @Input() pageSizes: number[] | undefined;
  /** Total de registros no servidor (mode "server"). */
  @Input() total: number | undefined;
  /** Ordenação atual: { key, direction } ou "chave:asc". */
  @Input() sort: ArkDataViewSort | string | null | undefined;
  @Input() search: string | undefined;
  @Input() searchable = false;
  @Input() searchPlaceholder: string | undefined;
  /** Atraso em ms entre a última tecla e a consulta. Padrão: 300. */
  @Input() searchDebounce: number | undefined;
  @Input() selectable = false;
  /** Chaves selecionadas (propriedade); atribuir não emite evento. */
  @Input() selected: ArkDataViewKey[] | undefined;
  @Input() reorderable = false;
  @Input() clickable = false;
  @Input() loading = false;
  /** Colunas da grade de campos de cada card, de 1 a 4. Padrão: 2. */
  @Input() cardColumns: number | undefined;
  /** Desenha o corpo de cada card no lugar da grade de campos (propriedade); `ng-template[arkDataViewCard]` vale sobre ela. */
  @Input() cardRender: ArkDataViewCardRender | undefined;
  /** Nome acessível da tabela e da lista de cards. */
  @Input() label: string | undefined;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Página, itens por página, ordenação ou busca mudaram: detail é a consulta inteira mais `reason`. */
  @Output() arkQueryChange = new EventEmitter<CustomEvent<ArkDataViewQueryChangeDetail>>();
  /** O usuário trocou a apresentação no seletor. */
  @Output() arkViewChange = new EventEmitter<CustomEvent<ArkDataViewViewChangeDetail>>();
  /** Clique, Enter ou Espaço numa linha ou card (com clickable): detail é { row, key, index }. */
  @Output() arkRowClick = new EventEmitter<CustomEvent<ArkDataViewRowClickDetail>>();
  /** A seleção mudou por ação do usuário: detail é { selected, rows }. */
  @Output() arkSelectionChange = new EventEmitter<CustomEvent<ArkDataViewSelectionChangeDetail>>();
  /** Um registro foi movido: detail é { key, from, to, rows }. Persistir é do app. */
  @Output() arkReorder = new EventEmitter<CustomEvent<ArkDataViewReorderDetail>>();

  @ViewChild("dataView", { static: false }) viewRef!: ElementRef<ArkDataViewElement>;
  /** Templates de célula e de card declarados dentro do wrapper. */
  @ContentChildren(ArkDataViewCellDirective) cellTemplates: QueryList<ArkDataViewCellDirective> | undefined;
  @ContentChild(ArkDataViewCardDirective) cardTemplate: ArkDataViewCardDirective | undefined;

  /** Views dos templates, pelo nó que o elemento recebeu no lugar do conteúdo da célula (ou do corpo do card). */
  private readonly embedded = new Map<HTMLElement, EmbeddedViewRef<unknown>>();
  private templatesSubscription: { unsubscribe: () => void } | undefined;
  /** Template de card em uso no elemento, para regravar `cardRender` só quando ele entra, sai ou troca. */
  private appliedCard: TemplateRef<ArkDataViewCardTemplateContext> | undefined;

  get pageSizesAttr(): string | null {
    return this.pageSizes && this.pageSizes.length > 0 ? this.pageSizes.join(",") : null;
  }

  get sortAttr(): string | null {
    const sort = this.sort;
    return sort && typeof sort === "object" ? `${sort.key}:${sort.direction}` : sort || null;
  }

  private readonly handlers: Array<[string, EventListener]> = [
    // A cada redesenho do conteúdo o elemento troca os nós de célula: as views dos que saíram do DOM são destruídas.
    ["ark-render", () => this.pruneViews()],
    ["ark-query-change", (event) => this.arkQueryChange.emit(event as CustomEvent<ArkDataViewQueryChangeDetail>)],
    ["ark-view-change", (event) => this.arkViewChange.emit(event as CustomEvent<ArkDataViewViewChangeDetail>)],
    ["ark-row-click", (event) => this.arkRowClick.emit(event as CustomEvent<ArkDataViewRowClickDetail>)],
    [
      "ark-selection-change",
      (event) => this.arkSelectionChange.emit(event as CustomEvent<ArkDataViewSelectionChangeDetail>)
    ],
    ["ark-reorder", (event) => this.arkReorder.emit(event as CustomEvent<ArkDataViewReorderDetail>)]
  ];

  ngAfterContentInit(): void {
    // Um template de célula que entra ou sai depois (um @if em volta dele) muda o que o elemento desenha.
    this.templatesSubscription = this.cellTemplates?.changes.subscribe(() => this.syncColumns());
  }

  ngAfterContentChecked(): void {
    // O template de card é um só (ContentChild, sem `changes`): conferido a cada checagem do conteúdo.
    if (this.viewRef && this.cardTemplate?.template !== this.appliedCard) this.syncCardRender();
  }

  ngAfterViewInit(): void {
    for (const [name, handler] of this.handlers) this.viewRef?.nativeElement?.addEventListener(name, handler);
    this.syncColumns();
    this.syncRows();
    this.syncSelected();
    this.syncCardRender();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Só o que mudou é regravado: `rows` novo não pode ser efeito colateral de outro input mudando.
    if (changes.columns) this.syncColumns();
    if (changes.rows) this.syncRows();
    if (changes.selected) this.syncSelected();
    if (changes.cardRender) this.syncCardRender();
  }

  ngOnDestroy(): void {
    this.templatesSubscription?.unsubscribe();
    for (const [name, handler] of this.handlers) this.viewRef?.nativeElement?.removeEventListener(name, handler);
    for (const view of this.embedded.values()) view.destroy();
    this.embedded.clear();
  }

  // Instância um template para uma célula: a view fica no contêiner do wrapper (entra na detecção de mudanças do
  // componente que declarou o template) e os nós dela vão para o nó que o elemento põe na célula.
  private createView<Context>(template: TemplateRef<Context>, context: Context): HTMLElement {
    const view = this.viewContainer.createEmbeddedView(template, context);
    view.detectChanges();
    const node = document.createElement("span");
    node.style.display = "contents";
    for (const root of view.rootNodes as Node[]) node.appendChild(root);
    this.embedded.set(node, view);
    return node;
  }

  private pruneViews(): void {
    for (const [node, view] of Array.from(this.embedded)) {
      if (node.isConnected) continue;
      view.destroy();
      this.embedded.delete(node);
    }
  }

  // Colunas com um template `arkDataViewCell` de mesma `key` ganham um `render` que instancia o template; as demais
  // vão como vieram (o `render` delas devolve nó ou texto, como no elemento).
  private syncColumns(): void {
    const el = this.viewRef?.nativeElement;
    if (!el || !this.columns) return;
    const templates = new Map((this.cellTemplates?.toArray() ?? []).map((cell) => [cell.key, cell.template]));
    el.columns = this.columns.map((column) => {
      const template = templates.get(column.key);
      if (!template) return column;
      return {
        ...column,
        render: (context: ArkDataViewCellContext) => this.createView(template, { $implicit: context.row, ...context })
      };
    });
  }

  private syncRows(): void {
    const el = this.viewRef?.nativeElement;
    if (el && this.rows) el.rows = this.rows;
  }

  private syncSelected(): void {
    const el = this.viewRef?.nativeElement;
    if (el && this.selected) el.selected = this.selected;
  }

  // Função, então propriedade; só é gravada quando o app dá uma (ou o template de card), para a view sem ela não
  // refazer os cards.
  private syncCardRender(): void {
    const el = this.viewRef?.nativeElement;
    if (!el) return;
    const template = this.cardTemplate?.template;
    this.appliedCard = template;
    if (template) {
      el.cardRender = (context) => this.createView(template, { $implicit: context.row, ...context });
    } else if (this.cardRender || el.cardRender) {
      el.cardRender = this.cardRender ?? null;
    }
  }
}
