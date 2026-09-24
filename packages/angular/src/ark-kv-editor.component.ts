import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
  EventEmitter,
  Input,
  type OnChanges,
  type OnDestroy,
  Output,
  type SimpleChanges,
  ViewChild
} from "@angular/core";
import type { ArkKvBulkFormat, ArkKvRow, ArkLang, ArkSize, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-kv-editor-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-kv-editor
    #editor
    [attr.testid]="testid"
    [attr.bulk]="bulk ? '' : null"
    [attr.bulk-format]="bulkFormat"
    [attr.types]="typesAttr"
    [attr.description]="description ? '' : null"
    [attr.secret]="secret ? '' : null"
    [attr.key-placeholder]="keyPlaceholder"
    [attr.value-placeholder]="valuePlaceholder"
    [attr.description-placeholder]="descriptionPlaceholder"
    [attr.readonly]="readonly ? '' : null"
    [attr.size]="size"
    [attr.theme]="theme"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    (change)="onChange($event)">
  </ark-kv-editor>`
})
export class ArkKvEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Linhas { id, key, value, enabled }; atribuir substitui tudo e renderiza de novo (propriedade, não atributo). */
  @Input() rows: ArkKvRow[] | undefined;
  /** Modo de edição em massa (textarea). */
  @Input() bulk = false;
  /** Formato do modo em massa: "lines" (chave:valor por linha) ou "json". Padrão: "lines". */
  @Input() bulkFormat: ArkKvBulkFormat | undefined;
  /** Tipos de valor da coluna de tipo (string, number, date, time, datetime, email, url); vazio esconde a coluna. */
  @Input() types: string[] | undefined;
  /** Mostra a coluna de descrição. */
  @Input() description = false;
  /** Mostra o cadeado por linha: fechado mascara o valor como senha, com o olho para revelar. */
  @Input() secret = false;
  @Input() keyPlaceholder: string | undefined;
  @Input() valuePlaceholder: string | undefined;
  @Input() descriptionPlaceholder: string | undefined;
  @Input() readonly = false;
  @Input() size: ArkSize = "md";
  @Input() theme: ArkTheme = "auto";
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  /** Qualquer edição, inclusive ao sair do modo em massa: detail.rows são as linhas. */
  @Output() changed = new EventEmitter<CustomEvent<{ rows: ArkKvRow[] }>>();
  @Output() arkAdd = new EventEmitter<CustomEvent<{ id: string }>>();
  @Output() arkDelete = new EventEmitter<CustomEvent<{ id: string }>>();

  @ViewChild("editor", { static: false }) editorRef!: ElementRef<HTMLElement & { rows: ArkKvRow[] }>;

  get typesAttr(): string | null {
    return this.types && this.types.length > 0 ? this.types.join(",") : null;
  }

  private addHandler = (event: Event) => this.arkAdd.emit(event as CustomEvent<{ id: string }>);
  private deleteHandler = (event: Event) => this.arkDelete.emit(event as CustomEvent<{ id: string }>);

  ngAfterViewInit(): void {
    this.syncRows();
    this.editorRef?.nativeElement?.addEventListener("ark-add", this.addHandler);
    this.editorRef?.nativeElement?.addEventListener("ark-delete", this.deleteHandler);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Só um `rows` novo substitui o modelo: bulk, readonly ou theme mudando não podem apagar o que o usuário editou.
    if (changes.rows) this.syncRows();
  }

  ngOnDestroy(): void {
    this.editorRef?.nativeElement?.removeEventListener("ark-add", this.addHandler);
    this.editorRef?.nativeElement?.removeEventListener("ark-delete", this.deleteHandler);
  }

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ rows: ArkKvRow[] }>);
  }

  private syncRows(): void {
    const el = this.editorRef?.nativeElement;
    if (el && this.rows) el.rows = this.rows;
  }
}
