import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
  indentUnit,
  syntaxHighlighting
} from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
  rectangularSelection
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { type ArkThemeSelected, resolveColorScheme } from "@tooark/tokens";
import type {
  ArkCodeCompletion,
  ArkCodeCompletionSource,
  ArkCodeEditorOptions,
  ArkCodeFormatter,
  ArkCodeIndentStyle,
  ArkCodeLanguage,
  ArkCodeLineEnding,
  ArkCodeTheme
} from "../types";

export type ArkCodeEditorInstance = {
  /** Instância nativa do CodeMirror (uso avançado: dispatch, state, extensões). */
  readonly view: EditorView;
  /** Texto atual. */
  getValue(): string;
  /** Substitui o texto inteiro sem disparar `onChange`; a seleção vai ao início. */
  setValue(value: string): void;
  /** Troca a linguagem do realce e da dobra. */
  setLanguage(language: ArkCodeLanguage): void;
  /** Troca o tema (re-resolve "auto" pelo color-scheme atual). */
  setTheme(theme: ArkCodeTheme): void;
  /** Liga/desliga a edição. */
  setReadonly(readonly: boolean): void;
  /** Troca o texto do documento vazio; vazio remove. */
  setPlaceholder(text?: string): void;
  /** Liga/desliga a numeração das linhas. */
  setLineNumbers(on: boolean): void;
  /** Liga/desliga a calha de dobra. */
  setFold(on: boolean): void;
  /** Liga/desliga a quebra de linha visual. */
  setWrap(on: boolean): void;
  /** Altura mínima (comprimento CSS). */
  setMinHeight(value: string): void;
  /** Recuo: espaços ou tabulação, e o tamanho (espaços por nível ou largura da tabulação). */
  setIndent(style: ArkCodeIndentStyle, size: number): void;
  /** Fim de linha do valor (`getValue`, `onChange`); "auto" segue o último `setValue`. */
  setLineEnding(lineEnding: ArkCodeLineEnding): void;
  /** Fim de linha em vigor depois de resolver "auto". */
  resolvedLineEnding(): "lf" | "crlf";
  /** Liga/desliga Tab para recuar (com Esc+Tab para sair). */
  setTabIndent(on: boolean): void;
  /** Liga/desliga as completions. */
  setAutocomplete(on: boolean): void;
  /** Troca as chaves oferecidas depois de `{{`. */
  setVariableKeys(keys: string[]): void;
  /** Troca as palavras oferecidas como completion em qualquer linguagem. */
  setCompletions(items: ArkCodeCompletion[]): void;
  /** Troca a fonte de completion própria. */
  setCompletionSource(source: ArkCodeCompletionSource | undefined): void;
  /** Troca o formatador do app. */
  setFormatter(formatter: ArkCodeFormatter | undefined): void;
  /** Formata o documento (formatador do app, ou JSON nativo); `false` sem formatador ou quando falha. */
  format(): Promise<boolean>;
  /** Indica se há como formatar a linguagem atual. */
  canFormat(): boolean;
  /** Tema efetivamente aplicado (após resolver "auto"). */
  resolvedTheme(): ArkThemeSelected;
  /** Foca o editor. */
  focus(): void;
  /** Libera o editor e remove o DOM dele. */
  destroy(): void;
};

/** Resolve "auto" para "light"/"dark" pelo color-scheme computado de `element`, ou pela preferência do sistema. */
export function resolveCodeTheme(theme: ArkCodeTheme | undefined, element?: Element | null): ArkThemeSelected {
  if (theme === "dark") return "dark";
  if (theme === "light") return "light";
  return resolveColorScheme(element);
}

// --- Tema ---

// Cores de sintaxe por lado; o chrome (fundo, texto, bordas, seleção) vem dos tokens --ark-color-* com fallback,
// para o editor seguir o tema do app mesmo sem o CSS do @tooark/web-components na página.
const SYNTAX = {
  light: {
    keyword: "#6d28d9",
    string: "#15803d",
    number: "#b45309",
    property: "#1d4ed8",
    comment: "#64748b",
    atom: "#0f766e",
    punctuation: "#475569",
    invalid: "#dc2626"
  },
  dark: {
    keyword: "#c4b5fd",
    string: "#86efac",
    number: "#fcd34d",
    property: "#93c5fd",
    comment: "#94a3b8",
    atom: "#5eead4",
    punctuation: "#cbd5e1",
    invalid: "#f87171"
  }
} as const;

const FALLBACK = {
  light: {
    surface: "#ffffff",
    surfaceMuted: "#f8fafc",
    fg: "#0f172a",
    fgMuted: "#64748b",
    placeholder: "#94a3b8",
    border: "#e2e8f0",
    primary: "#4f46e5",
    ring: "#a5b4fc",
    match: "#fef3c7"
  },
  dark: {
    surface: "#0f172a",
    surfaceMuted: "#1e293b",
    fg: "#e2e8f0",
    fgMuted: "#94a3b8",
    placeholder: "#64748b",
    border: "#334155",
    primary: "#818cf8",
    ring: "#6366f1",
    match: "#78350f"
  }
} as const;

const MONO =
  'var(--ark-font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)';

function chromeTheme(side: ArkThemeSelected): Extension {
  const f = FALLBACK[side];
  const v = (token: string, fallback: string): string => `var(--ark-color-${token}, ${fallback})`;
  const tint = (token: string, fallback: string, amount: number): string =>
    `color-mix(in oklab, ${v(token, fallback)} ${amount}%, transparent)`;
  return EditorView.theme(
    {
      "&": {
        colorScheme: side,
        backgroundColor: v("surface", f.surface),
        color: v("fg", f.fg),
        border: `1px solid ${v("border", f.border)}`,
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        minHeight: "var(--ark-code-min-height, 8rem)"
      },
      "&.cm-focused": {
        outline: `2px solid ${v("primary-ring", f.ring)}`,
        outlineOffset: "1px"
      },
      ".cm-scroller": {
        fontFamily: MONO,
        lineHeight: "1.5",
        borderRadius: "inherit",
        // A calha e o conteúdo esticam até a altura mínima do editor, não só até o texto.
        minHeight: "inherit"
      },
      ".cm-content": {
        padding: "0.5rem 0",
        caretColor: v("fg", f.fg)
      },
      ".cm-line": {
        padding: "0 0.75rem"
      },
      ".cm-gutters": {
        backgroundColor: v("surface-muted", f.surfaceMuted),
        color: v("fg-muted", f.fgMuted),
        borderRight: `1px solid ${v("border", f.border)}`,
        borderRadius: "0.5rem 0 0 0.5rem"
      },
      ".cm-activeLine": {
        backgroundColor: tint("fg", f.fg, 6)
      },
      ".cm-activeLineGutter": {
        backgroundColor: tint("fg", f.fg, 8)
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: v("fg", f.fg)
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: tint("primary", f.primary, 22)
      },
      ".cm-selectionMatch": {
        backgroundColor: tint("primary", f.primary, 14)
      },
      ".cm-searchMatch": {
        backgroundColor: v("warning-soft", f.match),
        outline: `1px solid ${v("warning-border", f.match)}`
      },
      ".cm-searchMatch.cm-searchMatch-selected": {
        backgroundColor: v("warning-soft", f.match)
      },
      "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
        backgroundColor: tint("primary", f.primary, 18),
        outline: "none"
      },
      ".cm-placeholder": {
        color: v("fg-placeholder", f.placeholder),
        fontStyle: "italic"
      },
      ".cm-foldGutter .cm-gutterElement": {
        cursor: "pointer"
      },
      ".cm-foldPlaceholder": {
        backgroundColor: v("surface-muted", f.surfaceMuted),
        border: `1px solid ${v("border", f.border)}`,
        color: v("fg-muted", f.fgMuted)
      },
      ".cm-panels": {
        backgroundColor: v("surface-muted", f.surfaceMuted),
        color: v("fg", f.fg)
      },
      ".cm-panels.cm-panels-top": {
        borderBottom: `1px solid ${v("border", f.border)}`
      },
      ".cm-panels.cm-panels-bottom": {
        borderTop: `1px solid ${v("border", f.border)}`
      },
      ".cm-panel.cm-search input, .cm-panel.cm-search button, .cm-panel.cm-search label": {
        fontFamily: "inherit",
        fontSize: "0.75rem"
      },
      ".cm-panel.cm-search input": {
        backgroundColor: v("surface", f.surface),
        color: v("fg", f.fg),
        border: `1px solid ${v("border", f.border)}`,
        borderRadius: "0.25rem"
      },
      ".cm-tooltip": {
        backgroundColor: v("surface", f.surface),
        color: v("fg", f.fg),
        border: `1px solid ${v("border", f.border)}`,
        borderRadius: "0.5rem",
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul": {
        fontFamily: "inherit",
        maxHeight: "14rem"
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
        padding: "0.25rem 0.5rem"
      },
      ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: v("primary-soft", tint("primary", f.primary, 15)),
        color: v("primary-soft-fg", f.fg)
      },
      ".cm-completionIcon": {
        color: v("fg-muted", f.fgMuted)
      }
    },
    { dark: side === "dark" }
  );
}

function syntaxTheme(side: ArkThemeSelected): Extension {
  const c = SYNTAX[side];
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: [tags.keyword, tags.modifier, tags.operatorKeyword, tags.controlKeyword], color: c.keyword },
      { tag: [tags.string, tags.special(tags.string)], color: c.string },
      { tag: [tags.number, tags.integer, tags.float], color: c.number },
      { tag: [tags.propertyName, tags.definition(tags.propertyName), tags.attributeName], color: c.property },
      { tag: [tags.comment, tags.lineComment, tags.blockComment], color: c.comment, fontStyle: "italic" },
      { tag: [tags.bool, tags.null, tags.atom, tags.self], color: c.atom },
      { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: c.property },
      { tag: [tags.typeName, tags.className, tags.namespace], color: c.keyword },
      { tag: [tags.punctuation, tags.separator, tags.bracket, tags.operator], color: c.punctuation },
      { tag: tags.invalid, color: c.invalid, textDecoration: "underline" }
    ])
  );
}

function themeFor(side: ArkThemeSelected): Extension {
  return [chromeTheme(side), syntaxTheme(side)];
}

// --- Linguagens e completions ---

function languageFor(language: ArkCodeLanguage): Extension {
  if (language === "json") return json();
  if (language === "javascript") return javascript();
  if (language === "yaml") return yaml();
  return [];
}

// Completions de variáveis: depois de `{{`, oferece as chaves e insere `{{chave}}`; se o `}}` já está adiante
// (closeBrackets fechou o par), só a chave entra e o cursor pula o fechamento.
function variableSource(keys: string[]): (context: CompletionContext) => CompletionResult | null {
  return (context) => {
    const match = context.matchBefore(/\{\{\s*[\w.-]*$/);
    if (!match) return null;
    const typed = match.text.match(/[\w.-]*$/)?.[0] ?? "";
    const from = match.to - typed.length;
    const options: Completion[] = keys.map((key) => ({
      label: key,
      type: "variable",
      apply: (view, _completion, start, end) => {
        const closed = view.state.sliceDoc(end, end + 2) === "}}";
        const insert = closed ? key : `${key}}}`;
        view.dispatch({
          changes: { from: start, to: end, insert },
          selection: { anchor: start + insert.length + (closed ? 2 : 0) }
        });
      }
    }));
    return { from, options, validFor: /^[\w.-]*$/ };
  };
}

// --- Recuo, fim de linha e formatação ---

function indentExtensions(style: ArkCodeIndentStyle, size: number): Extension {
  const width = Math.max(1, Math.min(16, Math.floor(size) || 2));
  return [indentUnit.of(style === "tab" ? "\t" : " ".repeat(width)), EditorState.tabSize.of(width)];
}

// O documento fica sempre em LF por dentro (colar CRLF num doc LF não deixa \r solto); o fim de linha só vale
// na fronteira: `getValue` junta com o configurado e `setValue`/`auto` detectam o que entrou.
function detectLineEnding(value: string): "lf" | "crlf" {
  return value.includes("\r\n") ? "crlf" : "lf";
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function completionsSource(items: ArkCodeCompletion[]): ArkCodeCompletionSource {
  return (context) => {
    const word = context.matchBefore(/[\w$.-]+/);
    if (!word && !context.explicit) return null;
    return { from: word ? word.from : context.pos, options: items, validFor: /^[\w$.-]*$/ };
  };
}

function completionExtensions(
  on: boolean,
  keys: string[],
  items: ArkCodeCompletion[],
  source: ArkCodeCompletionSource | undefined
): Extension {
  if (!on) return [];
  // languageData é o que o autocompletion consulta no cursor: assim as fontes valem em qualquer linguagem. Cada
  // fonte é criada uma vez por configuração: o autocompletion identifica a consulta pela identidade da função, e
  // uma nova a cada leitura deixaria a completion pendente para sempre.
  const sources: Array<{ autocomplete: ArkCodeCompletionSource }> = [];
  if (keys.length > 0) sources.push({ autocomplete: variableSource(keys) });
  if (items.length > 0) sources.push({ autocomplete: completionsSource(items) });
  if (source) sources.push({ autocomplete: source });
  return [autocompletion(), sources.length > 0 ? EditorState.languageData.of(() => sources) : []];
}

// Tab recua e Shift+Tab desfaz. A saída por teclado é do próprio CodeMirror: Esc arma o tab-focus mode por dois
// segundos (o Tab seguinte só move o foco) e Ctrl+M, do keymap padrão, alterna o modo de vez.
function tabExtensions(on: boolean): Extension {
  return on ? keymap.of([indentWithTab]) : [];
}

function formatJson(value: string, unit: string): string {
  return JSON.stringify(JSON.parse(value), null, unit);
}

// --- Instância ---

/**
 * Cria um editor CodeMirror 6 dentro de `parent` com o setup básico do Tooark: numeração e dobra, histórico,
 * fechamento de pares, realce da linha ativa (só editável), busca por Ctrl+F, completions (da linguagem, de
 * `variableKeys`, de `completions` e de `completionSource`), Tab para recuar com saída por Esc+Tab, recuo por
 * espaços ou tabulação, fim de linha LF/CRLF na fronteira do valor, formatação por Shift+Alt+F (JSON nativo ou o
 * `formatter` do app) e tema pelos tokens.
 */
export function createCodeEditor(parent: HTMLElement, options: ArkCodeEditorOptions = {}): ArkCodeEditorInstance {
  const language = new Compartment();
  const theme = new Compartment();
  const readonly = new Compartment();
  const placeholder = new Compartment();
  const gutterNumbers = new Compartment();
  const gutterFold = new Compartment();
  const wrapping = new Compartment();
  const indentation = new Compartment();
  const tabKey = new Compartment();
  const completion = new Compartment();

  let resolved = resolveCodeTheme(options.theme ?? "auto", parent);
  let applying = false;
  let currentLanguage: ArkCodeLanguage = options.language ?? "text";
  let indentStyle: ArkCodeIndentStyle = options.indentStyle ?? "space";
  let indentSize = options.indentSize ?? 2;
  let lineEnding: ArkCodeLineEnding = options.lineEnding ?? "auto";
  let detected: "lf" | "crlf" = detectLineEnding(options.value ?? "");
  let autocomplete = options.autocomplete !== false;
  let variableKeys = options.variableKeys ?? [];
  let completions = options.completions ?? [];
  let completionSource = options.completionSource;
  let formatter = options.formatter;

  const readonlyExtensions = (on: boolean): Extension => [
    EditorState.readOnly.of(on),
    EditorView.editable.of(!on),
    on ? [] : [highlightActiveLine(), highlightActiveLineGutter()]
  ];
  const reconfigureCompletion = (): void => {
    view.dispatch({
      effects: completion.reconfigure(completionExtensions(autocomplete, variableKeys, completions, completionSource))
    });
  };
  const eol = (): "\n" | "\r\n" => ((lineEnding === "auto" ? detected : lineEnding) === "crlf" ? "\r\n" : "\n");

  const format = async (): Promise<boolean> => {
    const source = view.state.doc.toString();
    try {
      let next: string;
      if (formatter) {
        next = normalizeNewlines(await formatter(source, currentLanguage));
      } else if (currentLanguage === "json") {
        next = formatJson(source, indentStyle === "tab" ? "\t" : " ".repeat(indentSize));
      } else {
        return false;
      }
      if (view.state.doc.toString() !== source) return false;
      if (next !== source) {
        // Edição de verdade: entra no histórico e dispara onChange, como se o usuário tivesse digitado.
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: next },
          selection: { anchor: Math.min(view.state.selection.main.head, next.length) },
          userEvent: "format"
        });
      }
      return true;
    } catch (error) {
      options.onFormatError?.(error);
      return false;
    }
  };

  const state = EditorState.create({
    doc: normalizeNewlines(options.value ?? ""),
    extensions: [
      gutterNumbers.of(options.lineNumbers === false ? [] : lineNumbers()),
      gutterFold.of(options.fold === false ? [] : foldGutter()),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      rectangularSelection(),
      crosshairCursor(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        {
          key: "Shift-Alt-f",
          run: () => {
            void format();
            return true;
          }
        }
      ]),
      language.of(languageFor(currentLanguage)),
      theme.of(themeFor(resolved)),
      readonly.of(readonlyExtensions(options.readonly === true)),
      placeholder.of(options.placeholder ? placeholderExtension(options.placeholder) : []),
      wrapping.of(options.wrap ? EditorView.lineWrapping : []),
      indentation.of(indentExtensions(indentStyle, indentSize)),
      tabKey.of(tabExtensions(options.tabIndent !== false)),
      completion.of(completionExtensions(autocomplete, variableKeys, completions, completionSource)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !applying) options.onChange?.(update.state.doc.toString().split("\n").join(eol()));
      })
    ]
  });

  const view = new EditorView({ state, parent });
  view.dom.style.setProperty("--ark-code-min-height", options.minHeight ?? "8rem");

  return {
    view,
    getValue: () => view.state.doc.toString().split("\n").join(eol()),
    setValue: (value) => {
      detected = detectLineEnding(value);
      const text = normalizeNewlines(value);
      if (text === view.state.doc.toString()) return;
      applying = true;
      try {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, selection: { anchor: 0 } });
      } finally {
        applying = false;
      }
    },
    setLanguage: (next) => {
      currentLanguage = next;
      view.dispatch({ effects: language.reconfigure(languageFor(next)) });
    },
    setTheme: (next) => {
      const side = resolveCodeTheme(next, parent);
      if (side === resolved) return;
      resolved = side;
      view.dispatch({ effects: theme.reconfigure(themeFor(side)) });
    },
    setReadonly: (on) => view.dispatch({ effects: readonly.reconfigure(readonlyExtensions(on)) }),
    setPlaceholder: (text) =>
      view.dispatch({ effects: placeholder.reconfigure(text ? placeholderExtension(text) : []) }),
    setLineNumbers: (on) => view.dispatch({ effects: gutterNumbers.reconfigure(on ? lineNumbers() : []) }),
    setFold: (on) => view.dispatch({ effects: gutterFold.reconfigure(on ? foldGutter() : []) }),
    setWrap: (on) => view.dispatch({ effects: wrapping.reconfigure(on ? EditorView.lineWrapping : []) }),
    setMinHeight: (value) => view.dom.style.setProperty("--ark-code-min-height", value),
    setIndent: (style, size) => {
      indentStyle = style;
      indentSize = size;
      view.dispatch({ effects: indentation.reconfigure(indentExtensions(style, size)) });
    },
    setLineEnding: (next) => {
      lineEnding = next;
    },
    resolvedLineEnding: () => (lineEnding === "auto" ? detected : lineEnding),
    setTabIndent: (on) => view.dispatch({ effects: tabKey.reconfigure(tabExtensions(on)) }),
    setAutocomplete: (on) => {
      autocomplete = on;
      reconfigureCompletion();
    },
    setVariableKeys: (keys) => {
      variableKeys = keys;
      reconfigureCompletion();
    },
    setCompletions: (items) => {
      completions = items;
      reconfigureCompletion();
    },
    setCompletionSource: (source) => {
      completionSource = source;
      reconfigureCompletion();
    },
    setFormatter: (next) => {
      formatter = next;
    },
    format,
    canFormat: () => formatter !== undefined || currentLanguage === "json",
    resolvedTheme: () => resolved,
    focus: () => view.focus(),
    destroy: () => view.destroy()
  };
}
