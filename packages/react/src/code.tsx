// Entry point @tooark/react/code: o wrapper do ark-code-editor, fora da entrada principal para que o CodeMirror (peers
// do @tooark/code) só entre no app que importa este caminho. Também tipa a tag crua <ark-code-editor> com as
// propriedades JS.
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
import type React from "react";
import { createElement, forwardRef, useEffect } from "react";
import { type ArkDomProps, domAttrs } from "./dom-props.js";
import { useForwardedRef } from "./use-forwarded-ref.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

/** Atributos da tag `ark-code-editor`, os mesmos da entrada principal, mais as propriedades JS. */
type ArkCodeEditorTagProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  testid?: string;
  theme?: "auto" | "light" | "dark";
  language?: "json" | "javascript" | "yaml" | "text";
  readonly?: boolean;
  placeholder?: string;
  "min-height"?: string;
  "max-height"?: string;
  "line-numbers"?: boolean | "false";
  fold?: boolean | "false";
  wrap?: boolean;
  "indent-style"?: "space" | "tab";
  "indent-size"?: number;
  "line-ending"?: "auto" | "lf" | "crlf";
  "tab-indent"?: boolean | "false";
  autocomplete?: boolean | "false";
  "mark-unknown-variables"?: boolean;
  "single-line"?: boolean;
  size?: ArkSize;
  /** Texto do editor (propriedade JS). */
  value?: string;
  variableKeys?: string[];
  variables?: ArkCodeVariable[];
  completions?: ArkCodeCompletion[];
  completionSource?: ArkCodeCompletionSource;
  formatter?: ArkCodeFormatter;
  extensions?: ArkCodeExtension;
};

// A tag crua ganha as propriedades JS no JSX; redeclarar com um tipo mais estreito é aceito pela herança.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ark-code-editor": ArkCodeEditorTagProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-code-editor": ArkCodeEditorTagProps;
    }
  }
}

export type ArkCodeEditorProps = ArkDomProps<{
  /** Texto do editor. Controlado: o `onChange` devolve o texto e o app o repassa; atribuir não emite `change`. */
  value?: string;
  /** json, javascript, yaml ou text. Padrão: "text". */
  language?: ArkCodeLanguage;
  /** auto (segue a página), light ou dark. Padrão: "auto". */
  theme?: "auto" | "light" | "dark";
  readonly?: boolean;
  placeholder?: string;
  /** Altura mínima (comprimento CSS). Padrão: "8rem". */
  minHeight?: string;
  /** Altura máxima (comprimento CSS), com rolagem interna acima dela. Padrão: sem limite. */
  maxHeight?: string;
  /** Numeração das linhas. Padrão: true. */
  lineNumbers?: boolean;
  /** Calha de dobra. Padrão: true. */
  fold?: boolean;
  wrap?: boolean;
  indentStyle?: ArkCodeIndentStyle;
  indentSize?: number;
  lineEnding?: ArkCodeLineEnding;
  /** Tab recua (Esc e Tab saem). Padrão: true. */
  tabIndent?: boolean;
  /** Completions ao digitar. Padrão: true. */
  autocomplete?: boolean;
  markUnknownVariables?: boolean;
  singleLine?: boolean;
  size?: ArkSize;
  variableKeys?: string[];
  variables?: ArkCodeVariable[];
  completions?: ArkCodeCompletion[];
  completionSource?: ArkCodeCompletionSource;
  formatter?: ArkCodeFormatter;
  /** Extensões do CodeMirror do app; mantenha a referência estável (useMemo), uma nova reconfigura o editor. */
  extensions?: ArkCodeExtension;
  testid?: string;
  className?: string;
  /** Cada edição do usuário, com `detail: { value }`. */
  onChange?: (event: CustomEvent<{ value: string }>) => void;
  /** Enter em `singleLine`, com `detail: { value }`. */
  onSubmit?: (event: CustomEvent<{ value: string }>) => void;
  /** `format()` falhou, com `detail: { error }`. */
  onFormatError?: (event: CustomEvent<{ error: unknown }>) => void;
}>;

/** Propriedades JS do editor, atribuídas pela ref e só quando a referência muda. */
const PROPERTY_KEYS = [
  "variableKeys",
  "variables",
  "completions",
  "completionSource",
  "formatter",
  "extensions"
] as const;

export const ArkCodeEditor = forwardRef<ArkCodeEditorElement, ArkCodeEditorProps>(
  function ArkCodeEditor(props, forwardedRef): React.JSX.Element {
    const {
      className,
      value,
      readonly,
      minHeight,
      maxHeight,
      lineNumbers,
      fold,
      wrap,
      indentStyle,
      indentSize,
      lineEnding,
      tabIndent,
      autocomplete,
      markUnknownVariables,
      singleLine,
      variableKeys,
      variables,
      completions,
      completionSource,
      formatter,
      extensions,
      onChange,
      onSubmit,
      onFormatError,
      ...rest
    } = props;
    const [ref, setRef] = useForwardedRef<ArkCodeEditorElement>(forwardedRef);
    const properties = { variableKeys, variables, completions, completionSource, formatter, extensions };

    useEffect(() => {
      registerTooarkCode();
    }, []);

    // O texto só é reatribuído quando difere do editor: o valor que o onChange acabou de devolver não move o cursor.
    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (el && value !== undefined && el.value !== value) el.value = value;
    }, [ref, value]);

    // Pela propriedade (o React 18 gravaria texto no atributo) e só com referência nova.
    useIsomorphicLayoutEffect(() => {
      const el = ref.current as unknown as Record<string, unknown> | null;
      if (!el) return;
      for (const key of PROPERTY_KEYS) {
        const next = properties[key];
        if (next !== undefined && el[key] !== next) el[key] = next;
      }
    });

    useIsomorphicLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      const handleChange = (event: Event): void => onChange?.(event as CustomEvent<{ value: string }>);
      const handleSubmit = (event: Event): void => onSubmit?.(event as CustomEvent<{ value: string }>);
      const handleError = (event: Event): void => onFormatError?.(event as CustomEvent<{ error: unknown }>);
      el.addEventListener("change", handleChange);
      el.addEventListener("ark-submit", handleSubmit);
      el.addEventListener("ark-format-error", handleError);
      return () => {
        el.removeEventListener("change", handleChange);
        el.removeEventListener("ark-submit", handleSubmit);
        el.removeEventListener("ark-format-error", handleError);
      };
    }, [ref, onChange, onSubmit, onFormatError]);

    const off = (on: boolean | undefined): string | undefined => (on === false ? "false" : undefined);
    const attrs: Record<string, unknown> = {
      ...domAttrs(rest),
      ref: setRef,
      class: className,
      readonly: readonly ? "" : undefined,
      "min-height": minHeight,
      "max-height": maxHeight,
      "line-numbers": off(lineNumbers),
      fold: off(fold),
      wrap: wrap ? "" : undefined,
      "indent-style": indentStyle,
      "indent-size": indentSize,
      "line-ending": lineEnding,
      "tab-indent": off(tabIndent),
      autocomplete: off(autocomplete),
      "mark-unknown-variables": markUnknownVariables ? "" : undefined,
      "single-line": singleLine ? "" : undefined
    };

    return createElement("ark-code-editor", attrs);
  }
);
