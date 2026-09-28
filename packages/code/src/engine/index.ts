import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
  completionStatus
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
import { closeSearchPanel, highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  type ChangeSpec,
  Compartment,
  EditorState,
  type Extension,
  Prec,
  type Transaction,
  type TransactionSpec
} from "@codemirror/state";
import {
  type Command,
  crosshairCursor,
  Decoration,
  type DecorationSet,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  hoverTooltip,
  keymap,
  lineNumbers,
  MatchDecorator,
  placeholder as placeholderExtension,
  rectangularSelection,
  ViewPlugin,
  type ViewUpdate
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import {
  ARK_INTENT_SOFT_CSS,
  ARK_SIZE_CSS,
  type ArkIntent,
  type ArkSize,
  type ArkThemeSelected,
  resolveColorScheme
} from "@tooark/tokens";
import type {
  ArkCodeCompletion,
  ArkCodeCompletionSource,
  ArkCodeEditorOptions,
  ArkCodeFormatter,
  ArkCodeIndentStyle,
  ArkCodeLanguage,
  ArkCodeLineEnding,
  ArkCodeTheme,
  ArkCodeVariable
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
  /** Troca as variáveis com escopo e cor (completion, pintura e tooltip); lista vazia deixa de pintar. */
  setVariables(variables: ArkCodeVariable[]): void;
  /** Liga/desliga a marcação em `danger` dos `{{chave}}` desconhecidos. */
  setMarkUnknownVariables(on: boolean): void;
  /** Liga/desliga o campo de uma linha; ligar junta as linhas do documento sem chamar `onChange`. */
  setSingleLine(on: boolean): void;
  /** Troca a escala da fonte e do recuo lateral (e a altura em `singleLine`). */
  setSize(size: ArkSize): void;
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

const INTENTS = Object.keys(ARK_INTENT_SOFT_CSS) as ArkIntent[];

// Fonte e recuo lateral por `size`, os mesmos do ark-input; "md" é o editor de sempre.
const SIZES: Record<ArkSize, { font: string; paddingX: string }> = {
  xs: { font: "0.75rem", paddingX: "0.5rem" },
  sm: { font: "0.75rem", paddingX: "0.625rem" },
  md: { font: "0.875rem", paddingX: "0.75rem" },
  lg: { font: "1rem", paddingX: "1rem" },
  xl: { font: "1.125rem", paddingX: "1.25rem" }
};

function normalizeSize(size: string | undefined): ArkSize {
  return size && Object.keys(SIZES).includes(size) ? (size as ArkSize) : "md";
}

// Fundo e texto suaves do intent; o fallback é o próprio `light-dark()` dos tokens, resolvido pelo color-scheme
// que o editor declara.
function variableColors(intent: ArkIntent): Record<string, string> {
  const soft = ARK_INTENT_SOFT_CSS[intent];
  return {
    backgroundColor: `var(--ark-color-${intent}-soft, ${soft.soft})`,
    color: `var(--ark-color-${intent}-soft-fg, ${soft.softFg})`
  };
}

function chromeTheme(side: ArkThemeSelected): Extension {
  const f = FALLBACK[side];
  const v = (token: string, fallback: string): string => `var(--ark-color-${token}, ${fallback})`;
  const tint = (token: string, fallback: string, amount: number): string =>
    `color-mix(in oklab, ${v(token, fallback)} ${amount}%, transparent)`;
  const intentRules = Object.fromEntries(
    INTENTS.map((intent) => [`.cm-ark-variable-${intent}`, variableColors(intent)])
  );
  return EditorView.theme(
    {
      "&": {
        colorScheme: side,
        backgroundColor: v("surface", f.surface),
        color: v("fg", f.fg),
        border: `1px solid ${v("border", f.border)}`,
        borderRadius: "0.5rem",
        fontSize: "var(--ark-code-font-size, 0.875rem)",
        minHeight: "var(--ark-code-min-height, 8rem)"
      },
      // Uma linha na altura do controle: a borda (2px) e a linha (1.5em) saem da altura, o resto vira respiro
      // vertical do conteúdo, que ocupa a caixa toda (o clique em qualquer ponto posiciona o cursor).
      "&.cm-ark-single-line": {
        minHeight: "var(--ark-code-control-height, 2.25rem)"
      },
      "&.cm-ark-single-line .cm-scroller": {
        minHeight: "0",
        scrollbarWidth: "none"
      },
      "&.cm-ark-single-line .cm-content": {
        padding: "max(0px, calc((var(--ark-code-control-height, 2.25rem) - 2px - 1.5em) / 2)) 0"
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
        padding: "0 var(--ark-code-padding-x, 0.75rem)"
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
      },
      ".cm-ark-variable": {
        borderRadius: "0.25rem"
      },
      // O realce da sintaxe fica dentro do span da variável (uma string JSON, por exemplo): herda a cor dela.
      ".cm-ark-variable *": {
        color: "inherit"
      },
      ...intentRules,
      // Desconhecida: além da cor, o sublinhado ondulado distingue sem depender dela.
      ".cm-ark-variable-unknown": {
        ...variableColors("danger"),
        textDecoration: "underline wavy",
        textDecorationSkipInk: "none",
        textUnderlineOffset: "0.2em"
      },
      ".cm-tooltip .cm-ark-variable-tooltip": {
        display: "flex",
        alignItems: "baseline",
        gap: "0.5rem",
        maxWidth: "24rem",
        padding: "0.25rem 0.5rem",
        fontSize: "0.75rem"
      },
      ".cm-ark-variable-tooltip-scope": {
        flexShrink: "0",
        padding: "0 0.375rem",
        borderRadius: "0.25rem",
        fontWeight: "500"
      },
      ".cm-ark-variable-tooltip-value": {
        fontFamily: MONO,
        color: v("fg-muted", f.fgMuted),
        overflowWrap: "anywhere"
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

// --- Variáveis ---

/** Variável já validada: intent resolvido, escopo e valor só quando são texto. */
type VariableEntry = { key: string; scope?: string; intent: ArkIntent; value?: string };

// `{{ chave }}` com espaços opcionais por dentro; a chave usa o mesmo conjunto de caracteres da completion.
const VARIABLE_PATTERN = /\{\{\s*([\w$.-]+)\s*\}\}/g;

// Chave repetida: vale a primeira ocorrência (o app resolve a precedência entre escopos antes de mandar).
function normalizeVariables(variables: ArkCodeVariable[]): Map<string, VariableEntry> {
  const map = new Map<string, VariableEntry>();
  for (const variable of variables) {
    if (!variable || typeof variable.key !== "string" || !variable.key || map.has(variable.key)) continue;
    map.set(variable.key, {
      key: variable.key,
      scope: typeof variable.scope === "string" && variable.scope ? variable.scope : undefined,
      intent: INTENTS.includes(variable.intent as ArkIntent) ? (variable.intent as ArkIntent) : "primary",
      value: typeof variable.value === "string" ? variable.value : undefined
    });
  }
  return map;
}

// Completions de variáveis: depois de `{{`, oferece as chaves e insere `{{chave}}`; se o `}}` já está adiante
// (closeBrackets fechou o par), só a chave entra e o cursor pula o fechamento. O escopo vai como detalhe e o valor
// como info.
function variableSource(variables: VariableEntry[]): (context: CompletionContext) => CompletionResult | null {
  return (context) => {
    const match = context.matchBefore(/\{\{\s*[\w$.-]*$/);
    if (!match) return null;
    const typed = match.text.match(/[\w$.-]*$/)?.[0] ?? "";
    const from = match.to - typed.length;
    const options: Completion[] = variables.map(({ key, scope, value }) => ({
      label: key,
      type: "variable",
      ...(scope ? { detail: scope } : {}),
      ...(value !== undefined ? { info: value } : {}),
      apply: (view, _completion, start, end) => {
        const closed = view.state.sliceDoc(end, end + 2) === "}}";
        const insert = closed ? key : `${key}}}`;
        view.dispatch({
          changes: { from: start, to: end, insert },
          selection: { anchor: start + insert.length + (closed ? 2 : 0) }
        });
      }
    }));
    return { from, options, validFor: /^[\w$.-]*$/ };
  };
}

function variableTooltip(variable: VariableEntry): HTMLElement {
  const dom = document.createElement("div");
  dom.className = "cm-ark-variable-tooltip";
  dom.setAttribute("data-ark", "code-editor-variable-tooltip");
  if (variable.scope) {
    const scope = document.createElement("span");
    scope.className = `cm-ark-variable-tooltip-scope cm-ark-variable-${variable.intent}`;
    scope.textContent = variable.scope;
    dom.appendChild(scope);
  }
  if (variable.value !== undefined) {
    const value = document.createElement("span");
    value.className = "cm-ark-variable-tooltip-value";
    value.textContent = variable.value;
    dom.appendChild(value);
  }
  return dom;
}

/**
 * Pinta cada `{{chave}}` de `variables` com o intent dela e, com `markUnknown`, em `danger` a chave que não está
 * nem em `variables` nem em `known` (as `variableKeys`, que completam mas não pintam). Sem variáveis e sem
 * `markUnknown` não há extensão nenhuma: o editor fica como sem o recurso.
 */
function variableExtensions(
  variables: Map<string, VariableEntry>,
  known: Set<string>,
  markUnknown: boolean
): Extension {
  if (variables.size === 0 && !markUnknown) return [];

  const marks = new Map<string, Decoration>();
  const markFor = (key: string): Decoration | null => {
    const cached = marks.get(key);
    if (cached) return cached;
    const variable = variables.get(key);
    let mark: Decoration | null = null;
    if (variable) {
      mark = Decoration.mark({
        class: `cm-ark-variable cm-ark-variable-${variable.intent}`,
        attributes: {
          "data-ark": "code-editor-variable",
          "data-key": key,
          "data-intent": variable.intent,
          ...(variable.scope ? { "data-scope": variable.scope } : {})
        }
      });
    } else if (markUnknown && !known.has(key)) {
      mark = Decoration.mark({
        class: "cm-ark-variable cm-ark-variable-unknown",
        attributes: { "data-ark": "code-editor-variable", "data-key": key, "data-intent": "danger", "data-unknown": "" }
      });
    }
    if (mark) marks.set(key, mark);
    return mark;
  };

  const decorator = new MatchDecorator({ regexp: VARIABLE_PATTERN, decoration: (match) => markFor(match[1]) });
  const painter = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = decorator.createDeco(view);
      }

      update(update: ViewUpdate): void {
        this.decorations = decorator.updateDeco(update, this.decorations);
      }
    },
    {
      // Por fora de todas as outras decorações: a variável fica num span só, que o realce da sintaxe, o par de
      // colchetes e a busca não cortam; a cor chega ao texto de dentro pela regra `.cm-ark-variable *`.
      provide: (plugin) => EditorView.outerDecorations.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none)
    }
  );

  // O tooltip só existe para variável conhecida com escopo ou valor: o texto é todo do app, a lib não traduz nada.
  const tooltip = hoverTooltip((view, pos, side) => {
    const line = view.state.doc.lineAt(pos);
    for (const match of line.text.matchAll(VARIABLE_PATTERN)) {
      const from = line.from + (match.index ?? 0);
      const to = from + match[0].length;
      if (pos < from || pos > to || (pos === from && side < 0) || (pos === to && side > 0)) continue;
      const variable = variables.get(match[1]);
      if (!variable || (!variable.scope && variable.value === undefined)) return null;
      return { pos: from, end: to, above: true, create: () => ({ dom: variableTooltip(variable) }) };
    }
    return null;
  });

  return [painter, tooltip];
}

// --- Uma linha ---

// As quebras que entram (colar, arrastar, comando) saem na mesma transação, como o `<input>` faz com o valor.
function joinLines(tr: Transaction): TransactionSpec | readonly TransactionSpec[] {
  if (!tr.docChanged || tr.newDoc.lines === 1) return tr;
  const changes: ChangeSpec[] = [];
  for (let n = 1; n < tr.newDoc.lines; n++) {
    const end = tr.newDoc.line(n).to;
    changes.push({ from: end, to: end + 1 });
  }
  return [tr, { changes, sequential: true }];
}

function singleLineExtensions(on: boolean, submit: () => void): Extension {
  if (!on) return [];
  // Com a lista de completions aberta o Enter é dela (o keymap do autocomplete vem antes); se ela acabou de abrir
  // e ainda ignora o Enter, ele não envia a meia variável.
  const run: Command = (view) => {
    if (completionStatus(view.state) !== "active") submit();
    return true;
  };
  return [
    EditorView.editorAttributes.of({ class: "cm-ark-single-line" }),
    EditorView.contentAttributes.of({ "aria-multiline": "false" }),
    EditorState.transactionFilter.of(joinLines),
    Prec.high(
      keymap.of([
        { key: "Enter", run, shift: run },
        { key: "Mod-Enter", run }
      ])
    )
  ];
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
  variables: VariableEntry[],
  items: ArkCodeCompletion[],
  source: ArkCodeCompletionSource | undefined
): Extension {
  if (!on) return [];
  // languageData é o que o autocompletion consulta no cursor: assim as fontes valem em qualquer linguagem. Cada
  // fonte é criada uma vez por configuração: o autocompletion identifica a consulta pela identidade da função, e
  // uma nova a cada leitura deixaria a completion pendente para sempre.
  const sources: Array<{ autocomplete: ArkCodeCompletionSource }> = [];
  if (variables.length > 0) sources.push({ autocomplete: variableSource(variables) });
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
 * `formatter` do app) e tema pelos tokens. Opcionais, ligados só pelas opções: `variables` pintadas por intent com
 * tooltip, `markUnknownVariables` e o campo `singleLine`.
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
  const variableMarks = new Compartment();
  const lineMode = new Compartment();
  const searchKeys = new Compartment();

  let resolved = resolveCodeTheme(options.theme ?? "auto", parent);
  let applying = false;
  let currentLanguage: ArkCodeLanguage = options.language ?? "text";
  let indentStyle: ArkCodeIndentStyle = options.indentStyle ?? "space";
  let indentSize = options.indentSize ?? 2;
  let lineEnding: ArkCodeLineEnding = options.lineEnding ?? "auto";
  let detected: "lf" | "crlf" = detectLineEnding(options.value ?? "");
  let autocomplete = options.autocomplete !== false;
  let variableKeys = options.variableKeys ?? [];
  let variables = normalizeVariables(options.variables ?? []);
  let markUnknown = options.markUnknownVariables === true;
  let completions = options.completions ?? [];
  let completionSource = options.completionSource;
  let formatter = options.formatter;
  let readonlyOn = options.readonly === true;
  let lineNumbersOn = options.lineNumbers !== false;
  let foldOn = options.fold !== false;
  let tabIndentOn = options.tabIndent !== false;
  let singleLine = options.singleLine === true;

  // Em `singleLine` calhas, linha ativa, recuo por Tab e busca ficam desligados, seja qual for a opção de cada um;
  // desligar o modo devolve o que as opções pedem.
  const readonlyExtensions = (): Extension => [
    EditorState.readOnly.of(readonlyOn),
    EditorView.editable.of(!readonlyOn),
    readonlyOn || singleLine ? [] : [highlightActiveLine(), highlightActiveLineGutter()]
  ];
  const numbersExtension = (): Extension => (lineNumbersOn && !singleLine ? lineNumbers() : []);
  const foldExtension = (): Extension => (foldOn && !singleLine ? foldGutter() : []);
  const tabExtension = (): Extension => tabExtensions(tabIndentOn && !singleLine);
  const searchExtension = (): Extension => (singleLine ? [] : keymap.of(searchKeymap));
  const lineModeExtension = (): Extension =>
    singleLineExtensions(singleLine, () => options.onSubmit?.(view.state.doc.toString().split("\n").join(eol())));

  // Variáveis com escopo primeiro; as `variableKeys` que elas não cobrem entram só como completion.
  const variableEntries = (): VariableEntry[] => [
    ...variables.values(),
    ...variableKeys.filter((key) => !variables.has(key)).map((key): VariableEntry => ({ key, intent: "primary" }))
  ];
  const marksExtension = (): Extension => variableExtensions(variables, new Set(variableKeys), markUnknown);
  const reconfigureCompletion = (): void => {
    view.dispatch({
      effects: completion.reconfigure(
        completionExtensions(autocomplete, variableEntries(), completions, completionSource)
      )
    });
  };
  const eol = (): "\n" | "\r\n" => ((lineEnding === "auto" ? detected : lineEnding) === "crlf" ? "\r\n" : "\n");
  // Texto como o documento guarda: sempre LF e, em `singleLine`, sem quebras.
  const toDoc = (value: string): string => {
    const text = normalizeNewlines(value);
    return singleLine ? text.replace(/\n/g, "") : text;
  };
  const applySize = (size: ArkSize): void => {
    const scale = SIZES[size];
    view.dom.style.setProperty("--ark-code-font-size", scale.font);
    view.dom.style.setProperty("--ark-code-padding-x", scale.paddingX);
    view.dom.style.setProperty("--ark-code-control-height", `var(--ark-size-${size}, ${ARK_SIZE_CSS[size]})`);
  };

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
    doc: toDoc(options.value ?? ""),
    extensions: [
      gutterNumbers.of(numbersExtension()),
      gutterFold.of(foldExtension()),
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
      // A busca fica num keymap à parte, depois do principal, para sair em `singleLine`.
      searchKeys.of(searchExtension()),
      language.of(languageFor(currentLanguage)),
      theme.of(themeFor(resolved)),
      readonly.of(readonlyExtensions()),
      placeholder.of(options.placeholder ? placeholderExtension(options.placeholder) : []),
      wrapping.of(options.wrap ? EditorView.lineWrapping : []),
      indentation.of(indentExtensions(indentStyle, indentSize)),
      tabKey.of(tabExtension()),
      completion.of(completionExtensions(autocomplete, variableEntries(), completions, completionSource)),
      variableMarks.of(marksExtension()),
      lineMode.of(lineModeExtension()),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !applying) options.onChange?.(update.state.doc.toString().split("\n").join(eol()));
      })
    ]
  });

  const view = new EditorView({ state, parent });
  view.dom.style.setProperty("--ark-code-min-height", options.minHeight ?? "8rem");
  applySize(normalizeSize(options.size));

  return {
    view,
    getValue: () => view.state.doc.toString().split("\n").join(eol()),
    setValue: (value) => {
      detected = detectLineEnding(value);
      const text = toDoc(value);
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
    setReadonly: (on) => {
      readonlyOn = on;
      view.dispatch({ effects: readonly.reconfigure(readonlyExtensions()) });
    },
    setPlaceholder: (text) =>
      view.dispatch({ effects: placeholder.reconfigure(text ? placeholderExtension(text) : []) }),
    setLineNumbers: (on) => {
      lineNumbersOn = on;
      view.dispatch({ effects: gutterNumbers.reconfigure(numbersExtension()) });
    },
    setFold: (on) => {
      foldOn = on;
      view.dispatch({ effects: gutterFold.reconfigure(foldExtension()) });
    },
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
    setTabIndent: (on) => {
      tabIndentOn = on;
      view.dispatch({ effects: tabKey.reconfigure(tabExtension()) });
    },
    setAutocomplete: (on) => {
      autocomplete = on;
      reconfigureCompletion();
    },
    setVariableKeys: (keys) => {
      variableKeys = keys;
      reconfigureCompletion();
      // As chaves só completam, mas contam como conhecidas para a marcação das desconhecidas.
      view.dispatch({ effects: variableMarks.reconfigure(marksExtension()) });
    },
    setVariables: (next) => {
      variables = normalizeVariables(next);
      reconfigureCompletion();
      view.dispatch({ effects: variableMarks.reconfigure(marksExtension()) });
    },
    setMarkUnknownVariables: (on) => {
      markUnknown = on;
      view.dispatch({ effects: variableMarks.reconfigure(marksExtension()) });
    },
    setSingleLine: (on) => {
      if (on === singleLine) return;
      singleLine = on;
      if (on) closeSearchPanel(view);
      view.dispatch({
        effects: [
          lineMode.reconfigure(lineModeExtension()),
          searchKeys.reconfigure(searchExtension()),
          readonly.reconfigure(readonlyExtensions()),
          gutterNumbers.reconfigure(numbersExtension()),
          gutterFold.reconfigure(foldExtension()),
          tabKey.reconfigure(tabExtension())
        ]
      });
      // O filtro só age nas próximas edições: o texto que já estava junta aqui, como um `setValue`.
      const text = view.state.doc.toString();
      if (!on || !text.includes("\n")) return;
      applying = true;
      try {
        view.dispatch({ changes: { from: 0, to: text.length, insert: toDoc(text) } });
      } finally {
        applying = false;
      }
    },
    setSize: (size) => applySize(normalizeSize(size)),
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
