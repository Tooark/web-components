import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  type OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import type { ArkIntent, ArkLang, ArkPageChangeDetail, ArkSize, ArkTheme } from "@tooark/core";
import type { ArkPagination as ArkPaginationElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-pagination-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-pagination
    #pagination
    [attr.testid]="testid"
    [attr.aria-label]="ariaLabel"
    [attr.page]="page"
    [attr.page-size]="pageSize"
    [attr.total]="total"
    [attr.page-sizes]="pageSizesAttr"
    [attr.siblings]="siblings"
    [attr.disabled]="disabled ? '' : null"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
  </ark-pagination>`
})
export class ArkPaginationComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-pagination` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkPaginationElement | null {
    return this.host.nativeElement.querySelector<ArkPaginationElement>(":scope > ark-pagination");
  }

  @Input() testid: string | undefined;
  /** Nome acessível da navegação; sem ele vale a string `pagination` do idioma. */
  @Input() ariaLabel: string | undefined;
  /** Página atual, a partir de 1; um clique a reescreve no elemento e emite arkPageChange. */
  @Input() page: number | undefined;
  /** Itens por página. Padrão: 10. */
  @Input() pageSize: number | undefined;
  /** Total de itens. */
  @Input() total: number | undefined;
  /** Opções do seletor de itens por página; sem elas o seletor não aparece. */
  @Input() pageSizes: number[] | undefined;
  /** Páginas vizinhas da atual, de cada lado. Padrão: 1. */
  @Input() siblings: number | undefined;
  @Input() disabled = false;
  @Input() size: ArkSize = "md";
  @Input() intent: ArkIntent = "primary";
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Página ou itens por página mudaram: detail é { page, pageSize, pageCount }. */
  @Output() arkPageChange = new EventEmitter<CustomEvent<ArkPageChangeDetail>>();

  @ViewChild("pagination", { static: false }) paginationRef!: ElementRef<HTMLElement>;

  get pageSizesAttr(): string | null {
    return this.pageSizes && this.pageSizes.length > 0 ? this.pageSizes.join(",") : null;
  }

  private pageHandler = (event: Event) => this.arkPageChange.emit(event as CustomEvent<ArkPageChangeDetail>);

  ngAfterViewInit(): void {
    this.paginationRef?.nativeElement?.addEventListener("ark-page-change", this.pageHandler);
  }

  ngOnDestroy(): void {
    this.paginationRef?.nativeElement?.removeEventListener("ark-page-change", this.pageHandler);
  }
}
