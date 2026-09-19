import type { EditorView } from "@codemirror/view";
import { type ArkThemeSelected, observeColorScheme } from "@tooark/tokens";
import { type ArkCodeEditorInstance, createCodeEditor } from "../engine";
import type {
  ArkCodeCompletion,
  ArkCodeCompletionSource,
  ArkCodeFormatter,
  ArkCodeIndentStyle,
  ArkCodeLanguage,
  ArkCodeLineEnding,
  ArkCodeTheme
} from "../types";

// Mesma regra do coerceBooleanAttr de @tooark/core (este pacote só depende de tokens): frameworks passam o valor do
// atributo como propriedade, então "" é presente e "false" é ausente.
function truthy(value: unknown): boolean {
  if (value === "" || value === true) return true;
  if (value === false || value === null || value === undefined || value === "false") return false;
  return Boolean(value);
}

/**
 * Custom Element que renderiza um editor de código CodeMirror 6.
 *
 * O texto vai pela propriedade `value` (ou pelo atributo `value` como valor
 * inicial) e volta em `change` com `detail: { value }` a cada edição do
 * usuário. Atributos: `language` (json | javascript | yaml | text),
 * `readonly`, `placeholder`, `min-height` (comprimento CSS), `line-numbers`,
 * `fold`, `tab-indent` e `autocomplete` (ligados por padrão; "false"
 * desliga), `wrap`, `indent-style` (space | tab), `indent-size`,
 * `line-ending` (lf | crlf | auto), `theme` (auto | light | dark) e
 * `testid`. Propriedades JS: `variableKeys` (completions depois de `{{`),
 * `completions` (palavras oferecidas em qualquer linguagem),
 * `completionSource` (fonte própria), `formatter` (formatador do app;
 * sem ele só JSON formata) e `format()`, também por Shift+Alt+F. Tab recua e
 * Esc+Tab sai do editor. Em `auto` o tema segue o color-scheme da página e
 * acompanha a troca em tempo de execução (`observeColorScheme` de
 * @tooark/tokens). O nó do CodeMirror leva `data-ark="code-editor"` e o
 * `testid` como `data-testid`.
 */
export class ArkCodeEditor extends HTMLElement {
  static readonly tagName = "ark-code-editor";

  private instance: ArkCodeEditorInstance | null = null;
  /** Texto antes de montar, ou o último conhecido depois de desmontar. */
  private pendingValue = "";
  private keys: string[] = [];
  private items: ArkCodeCompletion[] = [];
  private source: ArkCodeCompletionSource | undefined;
  private formatFn: ArkCodeFormatter | undefined;
  /** Para de observar o tema da página; só existe com `theme="auto"`. */
  private disposeTheme: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return [
      "language",
      "readonly",
      "placeholder",
      "min-height",
      "line-numbers",
      "fold",
      "wrap",
      "indent-style",
      "indent-size",
      "line-ending",
      "tab-indent",
      "autocomplete",
      "theme",
      "testid"
    ];
  }

  /** Texto do editor. Atribuir substitui tudo sem disparar `change`. */
  get value(): string {
    return this.instance ? this.instance.getValue() : this.pendingValue;
  }

  set value(next: string | null | undefined) {
    const text = next ?? "";
    this.pendingValue = text;
    this.instance?.setValue(text);
  }

  /** Chaves oferecidas como completions depois de `{{` (propriedade JS). */
  get variableKeys(): string[] {
    return [...this.keys];
  }

  set variableKeys(next: string[] | null | undefined) {
    this.keys = Array.isArray(next) ? next.filter((key) => typeof key === "string" && key.length > 0) : [];
    this.instance?.setVariableKeys(this.keys);
  }

  /** Palavras oferecidas como completion em qualquer linguagem (propriedade JS, formato do CodeMirror). */
  get completions(): ArkCodeCompletion[] {
    return [...this.items];
  }

  set completions(next: ArkCodeCompletion[] | null | undefined) {
    this.items = Array.isArray(next) ? next.filter((item) => item && typeof item.label === "string") : [];
    this.instance?.setCompletions(this.items);
  }

  /** Fonte de completion própria (propriedade JS), somada às da linguagem. */
  get completionSource(): ArkCodeCompletionSource | undefined {
    return this.source;
  }

  set completionSource(next: ArkCodeCompletionSource | null | undefined) {
    this.source = typeof next === "function" ? next : undefined;
    this.instance?.setCompletionSource(this.source);
  }

  /** Formatador do app (propriedade JS); sem ele só `language="json"` formata. */
  get formatter(): ArkCodeFormatter | undefined {
    return this.formatFn;
  }

  set formatter(next: ArkCodeFormatter | null | undefined) {
    this.formatFn = typeof next === "function" ? next : undefined;
    this.instance?.setFormatter(this.formatFn);
  }

  /** Recuo com espaços ou tabulação (atributo `indent-style`). Padrão: "space". */
  get indentStyle(): ArkCodeIndentStyle {
    return this.getAttribute("indent-style") === "tab" ? "tab" : "space";
  }

  set indentStyle(value: ArkCodeIndentStyle) {
    this.setAttribute("indent-style", value);
  }

  /** Espaços por nível, ou largura da tabulação (atributo `indent-size`). Padrão: 2. */
  get indentSize(): number {
    const raw = Number(this.getAttribute("indent-size"));
    return this.hasAttribute("indent-size") && Number.isInteger(raw) && raw >= 1 && raw <= 16 ? raw : 2;
  }

  set indentSize(value: number) {
    this.setAttribute("indent-size", String(value));
  }

  /** Fim de linha do valor (atributo `line-ending`): lf, crlf ou auto. Padrão: "auto". */
  get lineEnding(): ArkCodeLineEnding {
    const value = (this.getAttribute("line-ending") || "auto").toLowerCase();
    return value === "lf" || value === "crlf" ? value : "auto";
  }

  set lineEnding(value: ArkCodeLineEnding) {
    this.setAttribute("line-ending", value);
  }

  /** Fim de linha em vigor depois de resolver `auto` (o do último valor atribuído). */
  get resolvedLineEnding(): "lf" | "crlf" {
    return this.instance ? this.instance.resolvedLineEnding() : this.pendingValue.includes("\r\n") ? "crlf" : "lf";
  }

  /** Tab recua e Esc+Tab sai; ligado salvo `tab-indent="false"`. */
  get tabIndent(): boolean {
    return this.getAttribute("tab-indent") !== "false";
  }

  set tabIndent(value: boolean | string | null | undefined) {
    this.setAttribute("tab-indent", truthy(value) ? "true" : "false");
  }

  /** Completions ligadas salvo `autocomplete="false"`. */
  get autocomplete(): boolean {
    return this.getAttribute("autocomplete") !== "false";
  }

  set autocomplete(value: boolean | string | null | undefined) {
    this.setAttribute("autocomplete", truthy(value) ? "true" : "false");
  }

  /** Linguagem do realce (atributo `language`). Padrão: "text". */
  get language(): ArkCodeLanguage {
    const value = (this.getAttribute("language") || "text").toLowerCase();
    return value === "json" || value === "javascript" || value === "yaml" ? value : "text";
  }

  set language(next: ArkCodeLanguage) {
    this.setAttribute("language", next);
  }

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }

  set readonly(value: boolean | string | null | undefined) {
    this.toggleAttribute("readonly", truthy(value));
  }

  /** Quebra de linha visual (atributo `wrap`). */
  get wrap(): boolean {
    return this.hasAttribute("wrap");
  }

  set wrap(value: boolean | string | null | undefined) {
    this.toggleAttribute("wrap", truthy(value));
  }

  /** Numeração das linhas; ligada salvo `line-numbers="false"`. */
  get lineNumbers(): boolean {
    return this.getAttribute("line-numbers") !== "false";
  }

  set lineNumbers(value: boolean | string | null | undefined) {
    this.setAttribute("line-numbers", truthy(value) ? "true" : "false");
  }

  /** Calha de dobra; ligada salvo `fold="false"`. */
  get fold(): boolean {
    return this.getAttribute("fold") !== "false";
  }

  set fold(value: boolean | string | null | undefined) {
    this.setAttribute("fold", truthy(value) ? "true" : "false");
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") || "";
  }

  set placeholder(value: string | null | undefined) {
    if (value) {
      this.setAttribute("placeholder", value);
    } else {
      this.removeAttribute("placeholder");
    }
  }

  /** Altura mínima do editor (atributo `min-height`, comprimento CSS). Padrão: "8rem". */
  get minHeight(): string {
    return this.getAttribute("min-height")?.trim() || "8rem";
  }

  set minHeight(value: string | null | undefined) {
    if (value) {
      this.setAttribute("min-height", value);
    } else {
      this.removeAttribute("min-height");
    }
  }

  get theme(): ArkCodeTheme {
    const value = (this.getAttribute("theme") || "auto").toLowerCase();
    return value === "light" || value === "dark" ? value : "auto";
  }

  set theme(value: ArkCodeTheme) {
    this.setAttribute("theme", value);
  }

  /** Tema efetivamente aplicado (depois de resolver `auto`); `null` antes de renderizar. */
  get resolvedTheme(): ArkThemeSelected | null {
    return this.instance?.resolvedTheme() ?? null;
  }

  /** Instância nativa do CodeMirror (uso avançado); `null` antes de renderizar. */
  get view(): EditorView | null {
    return this.instance?.view ?? null;
  }

  connectedCallback(): void {
    // O atributo `value` só dá o texto inicial; depois a propriedade manda.
    if (!this.instance && !this.pendingValue && this.hasAttribute("value")) {
      this.pendingValue = this.getAttribute("value") ?? "";
    }
    this.render();
  }

  disconnectedCallback(): void {
    this.teardown();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.instance) return;

    if (name === "language") this.instance.setLanguage(this.language);
    if (name === "readonly") this.instance.setReadonly(this.readonly);
    if (name === "placeholder") this.instance.setPlaceholder(this.placeholder);
    if (name === "min-height") this.instance.setMinHeight(this.minHeight);
    if (name === "line-numbers") this.instance.setLineNumbers(this.lineNumbers);
    if (name === "fold") this.instance.setFold(this.fold);
    if (name === "wrap") this.instance.setWrap(this.wrap);
    if (name === "indent-style" || name === "indent-size") this.instance.setIndent(this.indentStyle, this.indentSize);
    if (name === "line-ending") this.instance.setLineEnding(this.lineEnding);
    if (name === "tab-indent") this.instance.setTabIndent(this.tabIndent);
    if (name === "autocomplete") this.instance.setAutocomplete(this.autocomplete);
    if (name === "theme") {
      this.instance.setTheme(this.theme);
      this.syncThemeObserver();
    }
    if (name === "testid") this.applyHooks();
  }

  /** Foca o editor. */
  focus(): void {
    this.instance?.focus();
  }

  /** Formata o documento com `formatter` (ou JSON nativo); `false` sem formatador ou quando falha (`ark-format-error`). */
  format(): Promise<boolean> {
    return this.instance ? this.instance.format() : Promise.resolve(false);
  }

  /** Indica se a linguagem atual tem como ser formatada. */
  get canFormat(): boolean {
    return this.instance ? this.instance.canFormat() : this.formatFn !== undefined || this.language === "json";
  }

  private render(): void {
    this.teardown();
    this.style.display = this.style.display || "block";

    this.instance = createCodeEditor(this, {
      value: this.pendingValue,
      language: this.language,
      theme: this.theme,
      readonly: this.readonly,
      placeholder: this.placeholder || undefined,
      lineNumbers: this.lineNumbers,
      fold: this.fold,
      wrap: this.wrap,
      minHeight: this.minHeight,
      indentStyle: this.indentStyle,
      indentSize: this.indentSize,
      lineEnding: this.lineEnding,
      tabIndent: this.tabIndent,
      autocomplete: this.autocomplete,
      variableKeys: this.keys,
      completions: this.items,
      completionSource: this.source,
      formatter: this.formatFn,
      onChange: (value) => {
        this.pendingValue = value;
        this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true, composed: true }));
      },
      onFormatError: (error) => {
        this.dispatchEvent(new CustomEvent("ark-format-error", { detail: { error }, bubbles: true, composed: true }));
      }
    });

    this.applyHooks();
    this.syncThemeObserver();
  }

  // O nó raiz do CodeMirror leva o hook de E2E, como os componentes de @tooark/web-components.
  private applyHooks(): void {
    const dom = this.instance?.view.dom;
    if (!dom) return;
    dom.setAttribute("data-ark", "code-editor");
    const testid = this.getAttribute("testid");
    if (testid) {
      dom.setAttribute("data-testid", testid);
    } else {
      dom.removeAttribute("data-testid");
    }
  }

  // Em `auto`, a troca de tema da página re-resolve o tema do editor; com tema fixo não há o que observar.
  private syncThemeObserver(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.theme !== "auto") return;
    this.disposeTheme = observeColorScheme(this, () => this.instance?.setTheme("auto"));
  }

  private teardown(): void {
    this.disposeTheme?.();
    this.disposeTheme = null;
    if (this.instance) {
      this.pendingValue = this.instance.getValue();
      this.instance.destroy();
      this.instance = null;
    }
  }
}

export default ArkCodeEditor;
