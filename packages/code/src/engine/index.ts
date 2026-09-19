import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap
} from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  HighlightStyle,
  indentOnInput,
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
import type { ArkCodeEditorOptions, ArkCodeLanguage, ArkCodeTheme } from "../types";

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
  /** Troca as chaves oferecidas depois de `{{`. */
  setVariableKeys(keys: string[]): void;
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

function variablesFor(keys: string[]): Extension {
  if (keys.length === 0) return [];
  // languageData é o que o autocompletion consulta no cursor: assim a fonte vale em qualquer linguagem. A fonte é
  // criada uma vez: o autocompletion identifica a consulta pela identidade da função, e uma nova a cada leitura
  // deixaria a completion pendente para sempre.
  const data = [{ autocomplete: variableSource(keys) }];
  return EditorState.languageData.of(() => data);
}

// --- Instância ---

/**
 * Cria um editor CodeMirror 6 dentro de `parent` com o setup básico do Tooark: numeração e dobra, histórico,
 * fechamento de pares, realce da linha ativa (só editável), busca por Ctrl+F, completions e tema pelos tokens.
 * Tab não indenta (fica livre para a navegação por teclado, como o CodeMirror recomenda).
 */
export function createCodeEditor(parent: HTMLElement, options: ArkCodeEditorOptions = {}): ArkCodeEditorInstance {
  const language = new Compartment();
  const theme = new Compartment();
  const readonly = new Compartment();
  const placeholder = new Compartment();
  const gutterNumbers = new Compartment();
  const gutterFold = new Compartment();
  const wrapping = new Compartment();
  const variables = new Compartment();

  let resolved = resolveCodeTheme(options.theme ?? "auto", parent);
  let applying = false;

  const readonlyExtensions = (on: boolean): Extension => [
    EditorState.readOnly.of(on),
    EditorView.editable.of(!on),
    on ? [] : [highlightActiveLine(), highlightActiveLineGutter()]
  ];

  const state = EditorState.create({
    doc: options.value ?? "",
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
      autocompletion(),
      rectangularSelection(),
      crosshairCursor(),
      highlightSelectionMatches(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap
      ]),
      language.of(languageFor(options.language ?? "text")),
      theme.of(themeFor(resolved)),
      readonly.of(readonlyExtensions(options.readonly === true)),
      placeholder.of(options.placeholder ? placeholderExtension(options.placeholder) : []),
      wrapping.of(options.wrap ? EditorView.lineWrapping : []),
      variables.of(variablesFor(options.variableKeys ?? [])),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !applying) options.onChange?.(update.state.doc.toString());
      })
    ]
  });

  const view = new EditorView({ state, parent });
  view.dom.style.setProperty("--ark-code-min-height", options.minHeight ?? "8rem");

  return {
    view,
    getValue: () => view.state.doc.toString(),
    setValue: (value) => {
      if (value === view.state.doc.toString()) return;
      applying = true;
      try {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value }, selection: { anchor: 0 } });
      } finally {
        applying = false;
      }
    },
    setLanguage: (next) => view.dispatch({ effects: language.reconfigure(languageFor(next)) }),
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
    setVariableKeys: (keys) => view.dispatch({ effects: variables.reconfigure(variablesFor(keys)) }),
    resolvedTheme: () => resolved,
    focus: () => view.focus(),
    destroy: () => view.destroy()
  };
}
