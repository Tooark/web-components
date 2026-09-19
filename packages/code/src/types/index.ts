import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { ArkThemeSelected } from "@tooark/tokens";

/** Tema do editor. "auto" segue o color-scheme do host, ou a preferência do sistema sem lado fixo. */
export type ArkCodeTheme = "auto" | ArkThemeSelected;

/** Linguagens com realce e dobra; "text" é texto puro. */
export type ArkCodeLanguage = "json" | "javascript" | "yaml" | "text";

/** Recuo com espaços ou com tabulação. */
export type ArkCodeIndentStyle = "space" | "tab";

/** Fim de linha do valor: LF, CRLF ou detectado do texto que entra (LF quando não há CRLF). */
export type ArkCodeLineEnding = "lf" | "crlf" | "auto";

/** Entrada de completion oferecida pelo app (o mesmo formato do CodeMirror). */
export type ArkCodeCompletion = Completion;

/** Fonte de completion do CodeMirror, para quem precisa de contexto (posição, texto antes do cursor). */
export type ArkCodeCompletionSource = (
  context: CompletionContext
) => CompletionResult | null | Promise<CompletionResult | null>;

/**
 * Formatador fornecido pelo app (Prettier, js-yaml...): recebe o texto e a linguagem e devolve o texto formatado.
 * Sem ele, só `json` tem formatação (nativa, com o recuo configurado).
 */
export type ArkCodeFormatter = (value: string, language: ArkCodeLanguage) => string | Promise<string>;

/** Opções de `createCodeEditor`; cada uma tem um `set*` correspondente na instância. */
export type ArkCodeEditorOptions = {
  /** Texto inicial. Padrão: "". */
  value?: string;
  /** Linguagem do realce e da dobra. Padrão: "text". */
  language?: ArkCodeLanguage;
  /** Tema visual. Padrão: "auto". */
  theme?: ArkCodeTheme;
  /** Somente leitura: sem cursor de edição nem realce da linha ativa. Padrão: false. */
  readonly?: boolean;
  /** Texto exibido com o documento vazio. */
  placeholder?: string;
  /** Numeração das linhas na calha. Padrão: true. */
  lineNumbers?: boolean;
  /** Calha de dobra (fold) por bloco da linguagem. Padrão: true. */
  fold?: boolean;
  /** Quebra de linha visual em vez de rolagem horizontal. Padrão: false. */
  wrap?: boolean;
  /** Altura mínima do editor (comprimento CSS). Padrão: "8rem". */
  minHeight?: string;
  /** Recuo com espaços ou tabulação. Padrão: "space". */
  indentStyle?: ArkCodeIndentStyle;
  /** Tamanho do recuo: espaços por nível, ou largura visual da tabulação. Padrão: 2. */
  indentSize?: number;
  /** Fim de linha do valor. Padrão: "auto". */
  lineEnding?: ArkCodeLineEnding;
  /** Tab recua (Shift+Tab desfaz o recuo); Esc e depois Tab sai do editor. Padrão: true. */
  tabIndent?: boolean;
  /** Completions ao digitar e por Ctrl+Espaço. Padrão: true. */
  autocomplete?: boolean;
  /** Chaves oferecidas como completions depois de `{{`; a escolha insere `{{chave}}`. Padrão: nenhuma. */
  variableKeys?: string[];
  /** Palavras oferecidas como completion em qualquer linguagem (chaves de um schema, nomes conhecidos). */
  completions?: ArkCodeCompletion[];
  /** Fonte de completion própria, além das da linguagem. */
  completionSource?: ArkCodeCompletionSource;
  /** Formatador do app; `format()` e Shift+Alt+F usam. */
  formatter?: ArkCodeFormatter;
  /** Chamado a cada edição do usuário com o texto atual (não dispara em `setValue`). */
  onChange?: (value: string) => void;
  /** Chamado quando `format()` falha (JSON inválido, formatador lançou). */
  onFormatError?: (error: unknown) => void;
};
