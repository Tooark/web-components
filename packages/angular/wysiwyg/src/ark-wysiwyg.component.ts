import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  Output
} from "@angular/core";
import type { ArkLang } from "@tooark/core";
import {
  type ArkWysiwygContent,
  type ArkWysiwygEditor as ArkWysiwygEditorElement,
  type ArkWysiwygUploadError,
  type ArkWysiwygUploader,
  type ArkWysiwygViewer as ArkWysiwygViewerElement,
  registerTooarkWysiwyg
} from "@tooark/wysiwyg";

// Entry point @tooark/angular/wysiwyg: fora da entrada principal para que o Tiptap (dependência do @tooark/wysiwyg) só
// entre no app que importa este caminho.
@Component({
  selector: "ark-wysiwyg-editor-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-wysiwyg-editor
    [attr.testid]="testid"
    [attr.toolbar]="toolbar"
    [attr.theme]="theme"
    [attr.placeholder]="placeholder"
    [attr.editable]="editable === false ? 'false' : null"
    [attr.lang]="lang"
    [attr.locale-json]="localeJsonAttr"
    [attr.colors]="colors ? stringify(colors) : null"
    [attr.highlights]="highlights ? stringify(highlights) : null"
    [attr.max-file-size]="maxFileSize"
    [attr.aria-label]="ariaLabel"
    [uploadFile]="uploadFile ?? null"
    (ark-wysiwyg-change)="changeHandler($event)"
    (ark-wysiwyg-upload-error)="uploadErrorHandler($event)"></ark-wysiwyg-editor>`
})
export class ArkWysiwygEditorComponent implements AfterViewInit {
  constructor() {
    registerTooarkWysiwyg();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** O último JSON emitido ou atribuído: o getter `content` do elemento monta um objeto novo a cada leitura. */
  private known: ArkWysiwygContent | null | undefined;
  private pending: ArkWysiwygContent | null | undefined;

  /** O `ark-wysiwyg-editor` que este wrapper renderiza; `null` antes da view. */
  get element(): ArkWysiwygEditorElement | null {
    return this.host.nativeElement.querySelector<ArkWysiwygEditorElement>(":scope > ark-wysiwyg-editor");
  }

  @Input() testid: string | undefined;

  /**
   * Conteúdo como JSON do Tiptap. Atribuído só quando a referência muda e fora do histórico de desfazer: o objeto
   * que o `(changed)` entregou, repassado, não reescreve o editor nem move o cursor.
   */
  @Input()
  set content(value: ArkWysiwygContent | null | undefined) {
    if (value === undefined || value === this.known) return;
    this.known = value;
    const el = this.element;
    if (el) {
      el.content = value;
    } else {
      this.pending = value;
    }
  }
  get content(): ArkWysiwygContent | null | undefined {
    return this.known;
  }

  /** Gancho de upload; sem ele não há botões de mídia e arquivos colados são recusados. */
  @Input() uploadFile: ArkWysiwygUploader | null | undefined;
  @Input() toolbar: string | undefined;
  @Input() theme: "auto" | "light" | "dark" | undefined;
  @Input() placeholder: string | undefined;
  /** false desabilita a edição. Padrão: true. */
  @Input() editable: boolean | undefined;
  @Input() lang: ArkLang | undefined;
  /** Rótulos próprios (objeto ou JSON), por cima do idioma. */
  @Input() localeJson: string | Record<string, string> | undefined;
  @Input() colors: string[] | undefined;
  @Input() highlights: string[] | undefined;
  @Input() maxFileSize: number | undefined;
  @Input() ariaLabel: string | undefined;
  /** Cada edição, com o JSON do Tiptap em `detail`. */
  @Output() changed = new EventEmitter<CustomEvent<ArkWysiwygContent>>();
  /** Arquivo recusado ou upload que falhou, com o motivo em `detail`. */
  @Output() uploadError = new EventEmitter<CustomEvent<ArkWysiwygUploadError>>();

  get localeJsonAttr(): string | null {
    if (this.localeJson === undefined) return null;
    return typeof this.localeJson === "string" ? this.localeJson : JSON.stringify(this.localeJson);
  }

  ngAfterViewInit(): void {
    const el = this.element;
    if (el && this.pending !== undefined) el.content = this.pending;
    this.pending = undefined;
  }

  protected stringify = (value: unknown): string => JSON.stringify(value);

  protected changeHandler = (event: Event) => {
    this.known = (event as CustomEvent<ArkWysiwygContent>).detail;
    this.changed.emit(event as CustomEvent<ArkWysiwygContent>);
  };
  protected uploadErrorHandler = (event: Event) => this.uploadError.emit(event as CustomEvent<ArkWysiwygUploadError>);
}

@Component({
  selector: "ark-wysiwyg-viewer-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-wysiwyg-viewer [attr.testid]="testid" [attr.theme]="theme" [content]="content ?? null"></ark-wysiwyg-viewer>`
})
export class ArkWysiwygViewerComponent {
  constructor() {
    registerTooarkWysiwyg();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-wysiwyg-viewer` que este wrapper renderiza; `null` antes da view. */
  get element(): ArkWysiwygViewerElement | null {
    return this.host.nativeElement.querySelector<ArkWysiwygViewerElement>(":scope > ark-wysiwyg-viewer");
  }

  @Input() testid: string | undefined;
  /** Conteúdo como JSON do Tiptap, sanitizado ao entrar. */
  @Input() content: ArkWysiwygContent | null | undefined;
  @Input() theme: "auto" | "light" | "dark" | undefined;
}
