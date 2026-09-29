import type { Completion, CompletionContext, CompletionResult } from "@codemirror/autocomplete";
import type { ArkIntent, ArkSize, ArkThemeSelected } from "@tooark/tokens";

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

/**
 * Variável `{{chave}}` informada pelo app: oferecida depois de `{{` e pintada no texto. O escopo é livre (a lib não
 * conhece nenhum); quando a mesma chave existe em mais de um escopo, o app manda só a que vale.
 */
export type ArkCodeVariable = {
  /** Chave usada em `{{chave}}`: letras, dígitos, `_`, `.`, `-` e `$`. */
  key: string;
  /** Nome do escopo: vai para `data-scope` no token, para o detalhe da completion e para o tooltip. */
  scope?: string;
  /** Cor do token (fundo e texto suaves do intent). Padrão: "primary". */
  intent?: ArkIntent;
  /** Valor mostrado no tooltip e na completion; o app deixa de fora o que for segredo. */
  value?: string;
};

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
  /** Nome acessível do conteúdo editável (`aria-label`), para quem não tem um `<label>` visível. Padrão: nenhum. */
  label?: string;
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
  /**
   * Variáveis com escopo e cor: oferecidas depois de `{{` como `variableKeys` e pintadas no texto, com tooltip do
   * escopo e do valor. Padrão: nenhuma (nada é pintado).
   */
  variables?: ArkCodeVariable[];
  /** Pinta em `danger`, sublinhado, o `{{chave}}` que não está em `variables` nem em `variableKeys`. Padrão: false. */
  markUnknownVariables?: boolean;
  /**
   * Campo de uma linha na altura dos controles (`size`): sem calhas nem linha ativa, Enter chama `onSubmit` em vez
   * de quebrar a linha, quebras coladas são removidas (como num `<input>`), Tab sai do editor e Ctrl+F fica com o
   * navegador. Padrão: false.
   */
  singleLine?: boolean;
  /** Escala da fonte e do recuo lateral; em `singleLine`, também a altura (`--ark-size-*`). Padrão: "md". */
  size?: ArkSize;
  /** Palavras oferecidas como completion em qualquer linguagem (chaves de um schema, nomes conhecidos). */
  completions?: ArkCodeCompletion[];
  /** Fonte de completion própria, além das da linguagem. */
  completionSource?: ArkCodeCompletionSource;
  /** Formatador do app; `format()` e Shift+Alt+F usam. */
  formatter?: ArkCodeFormatter;
  /** Chamado a cada edição do usuário com o texto atual (não dispara em `setValue`). */
  onChange?: (value: string) => void;
  /** Chamado com o texto atual quando Enter é pressionado em `singleLine` (fora da lista de completions). */
  onSubmit?: (value: string) => void;
  /** Chamado quando `format()` falha (JSON inválido, formatador lançou). */
  onFormatError?: (error: unknown) => void;
};
