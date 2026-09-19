import type { ArkThemeSelected } from "@tooark/tokens";

/** Tema do editor. "auto" segue o color-scheme do host, ou a preferência do sistema sem lado fixo. */
export type ArkCodeTheme = "auto" | ArkThemeSelected;

/** Linguagens com realce e dobra; "text" é texto puro. */
export type ArkCodeLanguage = "json" | "javascript" | "yaml" | "text";

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
  /** Chaves oferecidas como completions depois de `{{`; a escolha insere `{{chave}}`. Padrão: nenhuma. */
  variableKeys?: string[];
  /** Chamado a cada edição do usuário com o texto atual (não dispara em `setValue`). */
  onChange?: (value: string) => void;
};
