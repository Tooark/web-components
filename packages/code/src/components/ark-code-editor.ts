import type { EditorView } from "@codemirror/view";
import { type ArkThemeSelected, observeColorScheme } from "@tooark/tokens";
import { type ArkCodeEditorInstance, createCodeEditor } from "../engine";
import type { ArkCodeLanguage, ArkCodeTheme } from "../types";

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
 * `readonly`, `placeholder`, `min-height` (comprimento CSS), `line-numbers`
 * e `fold` (ligados por padrão; "false" desliga), `wrap`, `theme` (auto |
 * light | dark) e `testid`. A propriedade `variableKeys` lista as chaves
 * oferecidas como completions depois de `{{`, inserindo `{{chave}}`. Em
 * `auto` o tema segue o color-scheme da página e acompanha a troca em tempo
 * de execução (`observeColorScheme` de @tooark/tokens). O nó do CodeMirror
 * leva `data-ark="code-editor"` e o `testid` como `data-testid`.
 */
export class ArkCodeEditor extends HTMLElement {
  static readonly tagName = "ark-code-editor";

  private instance: ArkCodeEditorInstance | null = null;
  /** Texto antes de montar, ou o último conhecido depois de desmontar. */
  private pendingValue = "";
  private keys: string[] = [];
  /** Para de observar o tema da página; só existe com `theme="auto"`. */
  private disposeTheme: (() => void) | null = null;

  static get observedAttributes(): string[] {
    return ["language", "readonly", "placeholder", "min-height", "line-numbers", "fold", "wrap", "theme", "testid"];
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
      variableKeys: this.keys,
      onChange: (value) => {
        this.pendingValue = value;
        this.dispatchEvent(new CustomEvent("change", { detail: { value }, bubbles: true, composed: true }));
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
