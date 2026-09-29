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
import type { ArkLang, ArkSplitPaneDirection, ArkTheme } from "@tooark/core";
import type { ArkSplitPane as ArkSplitPaneElement } from "@tooark/web-components";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-split-pane-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-split-pane
    #pane
    [attr.testid]="testid"
    [attr.direction]="direction"
    [attr.sizes]="sizesAttr"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson">
    <ng-content></ng-content>
  </ark-split-pane>`
})
export class ArkSplitPaneComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-split-pane` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkSplitPaneElement | null {
    return this.host.nativeElement.querySelector<ArkSplitPaneElement>(":scope > ark-split-pane");
  }

  @Input() testid: string | undefined;
  /** Painéis lado a lado (horizontal) ou empilhados (vertical). Padrão: "horizontal". */
  @Input() direction: ArkSplitPaneDirection = "horizontal";
  /** Tamanhos dos painéis em percentuais, na ordem do conteúdo projetado; faltantes são distribuídos. */
  @Input() sizes: number[] | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Tamanhos mudaram por arrasto ou teclado: detail.sizes é a lista normalizada. Persistir é do app. */
  @Output() arkResize = new EventEmitter<CustomEvent<{ sizes: number[] }>>();

  @ViewChild("pane", { static: false }) paneRef!: ElementRef<HTMLElement>;

  get sizesAttr(): string | null {
    return this.sizes ? this.sizes.join(",") : null;
  }

  private resizeHandler = (event: Event) => this.arkResize.emit(event as CustomEvent<{ sizes: number[] }>);

  ngAfterViewInit(): void {
    this.paneRef?.nativeElement?.addEventListener("ark-resize", this.resizeHandler);
  }

  ngOnDestroy(): void {
    this.paneRef?.nativeElement?.removeEventListener("ark-resize", this.resizeHandler);
  }
}
