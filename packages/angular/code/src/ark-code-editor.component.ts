import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, inject, Output } from "@angular/core";
import {
  type ArkCodeCompletion,
  type ArkCodeCompletionSource,
  type ArkCodeEditor as ArkCodeEditorElement,
  type ArkCodeExtension,
  type ArkCodeFormatter,
  type ArkCodeIndentStyle,
  type ArkCodeLanguage,
  type ArkCodeLineEnding,
  type ArkCodeVariable,
  registerTooarkCode
} from "@tooark/code";
import type { ArkSize } from "@tooark/core";

// Entry point @tooark/angular/code: fora da entrada principal para que o CodeMirror (peers do @tooark/code) só entre
// no app que importa este caminho. As propriedades JS vão por property binding, que só reatribui com valor novo.
@Component({
  selector: "ark-code-editor-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-code-editor
    [attr.testid]="testid"
    [attr.language]="language"
    [attr.theme]="theme"
    [attr.readonly]="readonly ? '' : null"
    [attr.placeholder]="placeholder"
    [attr.min-height]="minHeight"
    [attr.max-height]="maxHeight"
    [attr.line-numbers]="lineNumbers === false ? 'false' : null"
    [attr.fold]="fold === false ? 'false' : null"
    [attr.wrap]="wrap ? '' : null"
    [attr.indent-style]="indentStyle"
    [attr.indent-size]="indentSize"
    [attr.line-ending]="lineEnding"
    [attr.tab-indent]="tabIndent === false ? 'false' : null"
    [attr.autocomplete]="autocomplete === false ? 'false' : null"
    [attr.mark-unknown-variables]="markUnknownVariables ? '' : null"
    [attr.single-line]="singleLine ? '' : null"
    [attr.size]="size"
    [attr.aria-label]="ariaLabel"
    [value]="value ?? ''"
    [variableKeys]="variableKeys ?? []"
    [variables]="variables ?? []"
    [completions]="completions ?? []"
    [completionSource]="completionSource"
    [formatter]="formatter"
    [extensions]="extensions ?? []"
    (change)="changeHandler($event)"
    (ark-submit)="submitHandler($event)"
    (ark-format-error)="formatErrorHandler($event)"></ark-code-editor>`
})
export class ArkCodeEditorComponent {
  constructor() {
    registerTooarkCode();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-code-editor` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkCodeEditorElement | null {
    return this.host.nativeElement.querySelector<ArkCodeEditorElement>(":scope > ark-code-editor");
  }

  @Input() testid: string | undefined;
  /** Texto do editor; o valor que o `(changed)` acabou de entregar, repassado, não move o cursor. */
  @Input() value: string | undefined;
  @Input() language: ArkCodeLanguage | undefined;
  @Input() theme: "auto" | "light" | "dark" | undefined;
  @Input() readonly = false;
  @Input() placeholder: string | undefined;
  @Input() minHeight: string | undefined;
  /** Altura máxima (comprimento CSS), com rolagem interna acima dela. */
  @Input() maxHeight: string | undefined;
  /** false tira a numeração. Padrão: true. */
  @Input() lineNumbers: boolean | undefined;
  /** false tira a calha de dobra. Padrão: true. */
  @Input() fold: boolean | undefined;
  @Input() wrap = false;
  @Input() indentStyle: ArkCodeIndentStyle | undefined;
  @Input() indentSize: number | undefined;
  @Input() lineEnding: ArkCodeLineEnding | undefined;
  /** false deixa Tab como navegação. Padrão: true. */
  @Input() tabIndent: boolean | undefined;
  /** false desliga as completions. Padrão: true. */
  @Input() autocomplete: boolean | undefined;
  @Input() markUnknownVariables = false;
  @Input() singleLine = false;
  @Input() size: ArkSize | undefined;
  @Input() ariaLabel: string | undefined;
  @Input() variableKeys: string[] | undefined;
  @Input() variables: ArkCodeVariable[] | undefined;
  @Input() completions: ArkCodeCompletion[] | undefined;
  @Input() completionSource: ArkCodeCompletionSource | undefined;
  @Input() formatter: ArkCodeFormatter | undefined;
  /** Extensões do CodeMirror do app; mantenha a referência estável, uma nova reconfigura o editor. */
  @Input() extensions: ArkCodeExtension | undefined;
  /** Cada edição do usuário, com `detail: { value }`. */
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();
  /** Enter em `singleLine`, com `detail: { value }`. */
  @Output() arkSubmit = new EventEmitter<CustomEvent<{ value: string }>>();
  /** `format()` falhou, com `detail: { error }`. */
  @Output() arkFormatError = new EventEmitter<CustomEvent<{ error: unknown }>>();

  protected changeHandler = (event: Event) => this.changed.emit(event as CustomEvent<{ value: string }>);
  protected submitHandler = (event: Event) => this.arkSubmit.emit(event as CustomEvent<{ value: string }>);
  protected formatErrorHandler = (event: Event) => this.arkFormatError.emit(event as CustomEvent<{ error: unknown }>);
}
